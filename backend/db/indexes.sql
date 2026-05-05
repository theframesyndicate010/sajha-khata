-- Indexes for frequently filtered columns
-- Run in Supabase SQL editor or psql

create index if not exists idx_posts_created_at on public.posts (created_at desc);
create index if not exists idx_posts_category_id on public.posts (category_id);
create index if not exists idx_posts_user_id on public.posts (user_id);

create index if not exists idx_categories_slug on public.categories (slug);

create index if not exists idx_projects_created_at on public.projects (created_at desc);
create index if not exists idx_projects_status on public.projects (status);

create index if not exists idx_project_payments_project_id on public.project_payments (project_id);
create index if not exists idx_project_payments_date on public.project_payments (date desc);

create index if not exists idx_expenses_date on public.expenses (date desc);
create index if not exists idx_expenses_category on public.expenses (category);

create index if not exists idx_profit_distributions_date on public.profit_distributions (date desc);
