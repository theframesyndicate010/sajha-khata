import supabase from "../config/config.js";

const getSupabase = (req) => req.app?.locals?.supabase || supabase;

const loadProfile = async (sb, userId) => {
  try {
    const { data, error } = await sb
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      return null;
    }

    return data || null;
  } catch (error) {
    return null;
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const sb = getSupabase(req);

  try {
    const { data, error } = await sb.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data?.session) {
      return res.status(401).json({
        message: error?.message || "Invalid credentials"
      });
    }

    const profile = data?.user?.id ? await loadProfile(sb, data.user.id) : null;

    return res.json({
      data: {
        session: data.session,
        profile,
        user: data.user
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Failed to login"
    });
  }
};

export const logout = async (req, res) => {
  return res.json({
    data: {
      success: true
    }
  });
};
