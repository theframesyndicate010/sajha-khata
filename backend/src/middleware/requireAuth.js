import supabase from "../config/config.js";

const requireAuth = async (req, res, next) => {
  try {
    if (req.query?.token || req.query?.access_token) {
      return res.status(400).json({
        success: false,
        message: "Use Authorization header for tokens. Query parameters are not allowed."
      });
    }

    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Missing or invalid authorization token"
      });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    req.user = user;
    req.accessToken = token;
    return next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export default requireAuth;
