import supabase, { supabaseAdmin } from "../config/config.js";
import { nowIso, errorPayload } from "./controllerUtils.js";

// Authentication controller
export const authController = {
  // User registration
  async register(req, res) {
    try {
      const { email, password, username, full_name } = req.body;
      const normalizedEmail = typeof email === "string" ? email.trim() : "";
      const normalizedUsername = typeof username === "string" ? username.trim() : "";

      if (!normalizedEmail || !password || !normalizedUsername) {
        return res.status(400).json({
          success: false,
          message: "Email, password, and username are required"
        });
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            username: normalizedUsername,
            full_name: full_name || normalizedUsername
          }
        }
      });

      if (authError) {
        return res.status(400).json(errorPayload(authError.message, authError));
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            id: authData.user.id,
            username: normalizedUsername,
            email: normalizedEmail,
            full_name: full_name || normalizedUsername,
            created_at: nowIso(),
            updated_at: nowIso()
          }
        ])
        .select()
        .single();

      if (profileError) {
        return res
          .status(400)
          .json(errorPayload("Failed to create user profile", profileError));
      }

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: authData.user,
          profile: profileData,
          session: authData.session
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res
        .status(500)
        .json(errorPayload("Internal server error during registration", error));
    }
  },

  // User login
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const normalizedEmail = typeof email === "string" ? email.trim() : "";

      if (!normalizedEmail || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required"
        });
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });

      if (error) {
        return res.status(401).json(errorPayload("Invalid credentials", error));
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
      }

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: data.user,
          profile: profile || null,
          session: data.session
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      return res
        .status(500)
        .json(errorPayload("Internal server error during login", error));
    }
  },

  // User logout
  async logout(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated"
        });
      }

      if (!supabaseAdmin) {
        return res.status(500).json({
          success: false,
          message: "Supabase service role key is not configured"
        });
      }

      const { error } = await supabaseAdmin.auth.admin.signOut(req.user.id);

      if (error) {
        return res.status(400).json(errorPayload("Logout failed", error));
      }

      return res.status(200).json({
        success: true,
        message: "Logout successful"
      });
    } catch (error) {
      console.error("Logout error:", error);
      return res
        .status(500)
        .json(errorPayload("Internal server error during logout", error));
    }
  },

  // Get current user
  async getCurrentUser(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "No authenticated user found"
        });
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", req.user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
      }

      return res.status(200).json({
        success: true,
        data: {
          user: req.user,
          profile: profile || null
        }
      });
    } catch (error) {
      console.error("Get current user error:", error);
      return res.status(500).json(errorPayload("Internal server error", error));
    }
  },

  // Reset password
  async resetPassword(req, res) {
    try {
      const { email } = req.body;
      const normalizedEmail = typeof email === "string" ? email.trim() : "";

      if (!normalizedEmail) {
        return res.status(400).json({
          success: false,
          message: "Email is required"
        });
      }

      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${process.env.FRONTEND_URL}/reset-password`
      });

      if (error) {
        return res
          .status(400)
          .json(errorPayload("Failed to send reset password email", error));
      }

      return res.status(200).json({
        success: true,
        message: "Password reset email sent successfully"
      });
    } catch (error) {
      console.error("Reset password error:", error);
      return res
        .status(500)
        .json(errorPayload("Internal server error during password reset", error));
    }
  },

  // Update password
  async updatePassword(req, res) {
    try {
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          message: "New password is required"
        });
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated"
        });
      }

      if (!supabaseAdmin) {
        return res.status(500).json({
          success: false,
          message: "Supabase service role key is not configured"
        });
      }

      const { error } = await supabaseAdmin.auth.admin.updateUserById(req.user.id, {
        password
      });

      if (error) {
        return res.status(400).json(errorPayload("Failed to update password", error));
      }

      return res.status(200).json({
        success: true,
        message: "Password updated successfully"
      });
    } catch (error) {
      console.error("Update password error:", error);
      return res
        .status(500)
        .json(errorPayload("Internal server error during password update", error));
    }
  }
};

export default authController;
