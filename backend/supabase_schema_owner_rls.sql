-- Supabase schema with owner-based RLS for `projects` and `expenses`
BEGIN;

-- Profiles (user profiles; `id` matches Auth user's UUID)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY,
  username text UNIQUE NOT NULL,
  email text,
  full_name text,
  bio text,
  avatar_url text,
  phone text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Categories for posts
CREATE TABLE IF NOT EXISTS categories (
  id serial PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  color text DEFAULT '#000000',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Posts
CREATE TABLE IF NOT EXISTS posts (
  id serial PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  category_id integer REFERENCES categories(id) ON DELETE SET NULL,
  tags text[] DEFAULT '{}'::text[],
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id serial PRIMARY KEY,
  post_id integer REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Likes
CREATE TABLE IF NOT EXISTS likes (
  id serial PRIMARY KEY,
  post_id integer REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT likes_unique_per_user_per_post UNIQUE (post_id, user_id)
);

-- Expenses (added `owner` to support owner-based RLS)
CREATE TABLE IF NOT EXISTS expenses (
  id serial PRIMARY KEY,
  owner uuid REFERENCES profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  category text NOT NULL,
  amount numeric(12,2) NOT NULL,
  date date,
  method text,
  notes text,
  trend text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Projects (added `owner` to support owner-based RLS)
CREATE TABLE IF NOT EXISTS projects (
  id serial PRIMARY KEY,
  owner uuid REFERENCES profiles(id) ON DELETE SET NULL,
  client text NOT NULL,
  project text NOT NULL,
  total_amount numeric(14,2) NOT NULL,
  status text,
  date date,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Payments for projects
CREATE TABLE IF NOT EXISTS project_payments (
  id serial PRIMARY KEY,
  project_id integer REFERENCES projects(id) ON DELETE CASCADE,
  amount numeric(14,2) NOT NULL,
  date date,
  type text,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Profit distributions
CREATE TABLE IF NOT EXISTS profit_distributions (
  id serial PRIMARY KEY,
  owner text NOT NULL,
  amount numeric(14,2) NOT NULL,
  method text,
  date date,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_project_payments_project_id ON project_payments(project_id);
CREATE INDEX IF NOT EXISTS idx_expenses_owner ON expenses(owner);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner);

-- Basic constraints
-- Add constraint only if it does not already exist (Postgres doesn't support IF NOT EXISTS on ADD CONSTRAINT)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_username_not_empty'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_username_not_empty CHECK (char_length(username) > 0);
  END IF;
END
$$;

-- Row Level Security (owner-based) for `projects` and `expenses`

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- project_payments: only project owner can view/insert/delete payments for their project
ALTER TABLE project_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "project_payments_select_owner" ON project_payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p WHERE p.id = project_payments.project_id AND p.owner = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "project_payments_insert_owner" ON project_payments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p WHERE p.id = project_payments.project_id AND p.owner = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "project_payments_delete_owner" ON project_payments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects p WHERE p.id = project_payments.project_id AND p.owner = auth.uid()
    )
  );

-- Projects: owner-only access (authenticated users must be the owner)
CREATE POLICY IF NOT EXISTS "projects_owner_select" ON projects
  FOR SELECT
  USING (auth.uid() = owner);

CREATE POLICY IF NOT EXISTS "projects_owner_insert" ON projects
  FOR INSERT
  WITH CHECK (auth.uid() = owner);

CREATE POLICY IF NOT EXISTS "projects_owner_update" ON projects
  FOR UPDATE
  USING (auth.uid() = owner)
  WITH CHECK (auth.uid() = owner);

CREATE POLICY IF NOT EXISTS "projects_owner_delete" ON projects
  FOR DELETE
  USING (auth.uid() = owner);

-- Expenses: owner-only access
CREATE POLICY IF NOT EXISTS "expenses_owner_select" ON expenses
  FOR SELECT
  USING (auth.uid() = owner);

CREATE POLICY IF NOT EXISTS "expenses_owner_insert" ON expenses
  FOR INSERT
  WITH CHECK (auth.uid() = owner);

CREATE POLICY IF NOT EXISTS "expenses_owner_update" ON expenses
  FOR UPDATE
  USING (auth.uid() = owner)
  WITH CHECK (auth.uid() = owner);

CREATE POLICY IF NOT EXISTS "expenses_owner_delete" ON expenses
  FOR DELETE
  USING (auth.uid() = owner);

COMMIT;

-- Notes:
-- 1) `auth.uid()` is the logged-in user's UUID. The client must set `owner = auth.uid()` on inserts
--    (or your backend should set `owner` server-side). Alternatively, you can create a Postgres
--    function to auto-populate owner using `current_setting('request.jwt.claim.sub')` if you expose
--    it via a trigger and supabase settings.
-- 2) Supabase service_role bypasses RLS; server-side actions with service role are unaffected.
-- 3) If you prefer public read access but owner-only writes, change the SELECT policies to `USING (true)`.

-- Function + trigger to auto-populate `owner` from JWT `sub` claim when available
-- This uses the Postgres setting `request.jwt.claim.sub` which Supabase sets for authenticated requests.
-- Note: This only runs when the client request carries a valid JWT and Supabase populates the setting.
CREATE OR REPLACE FUNCTION public.set_owner_from_jwt()
RETURNS trigger AS $$
BEGIN
  IF NEW.owner IS NULL THEN
    BEGIN
      NEW.owner := current_setting('request.jwt.claim.sub')::uuid;
    EXCEPTION WHEN others THEN
      -- If claim not present or invalid, leave owner as NULL
      NEW.owner := NEW.owner;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to projects and expenses
DROP TRIGGER IF EXISTS set_owner_projects ON projects;
CREATE TRIGGER set_owner_projects
BEFORE INSERT ON projects
FOR EACH ROW
EXECUTE PROCEDURE public.set_owner_from_jwt();

DROP TRIGGER IF EXISTS set_owner_expenses ON expenses;
CREATE TRIGGER set_owner_expenses
BEFORE INSERT ON expenses
FOR EACH ROW
EXECUTE PROCEDURE public.set_owner_from_jwt();
