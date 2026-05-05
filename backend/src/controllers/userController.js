import supabase, { supabaseAdmin } from "../config/config.js";
import { nowIso, parsePagination, stripUndefined, errorPayload } from "./controllerUtils.js";

// User profile controller
export const userController = {
  // Get all users
  async getAllUsers(req, res) {
    try {
      const { page, limit, offset } = parsePagination(req.query.page, req.query.limit);
      const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

      let query = supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .range(offset, offset + limit - 1);

      if (search) {
        query = query.or(`username.ilike.%${search}%,full_name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        return res.status(400).json({
          success: false,
          message: "Failed to fetch users",
          error: error.message
        });
      }

      return res.status(200).json({
        success: true,
        data,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error("Get all users error:", error);
      return res.status(500).json(errorPayload("Internal server error", error));
    }
  },

  // Get user by ID
  async getUserById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "User ID is required"
        });
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      console.error("Get user by ID error:", error);
      return res.status(500).json(errorPayload("Internal server error", error));
    }
  },

  // Update user profile
  async updateProfile(req, res) {
    try {
      const { id } = req.params;
      const { full_name, username, bio, avatar_url, phone } = req.body;

      if (!req.user || req.user.id !== id) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to update this profile"
        });
      }

      const updateData = stripUndefined({
        full_name,
        username,
        bio,
        avatar_url,
        phone,
        updated_at: nowIso()
      });

      const { data, error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return res.status(400).json(errorPayload("Failed to update profile", error));
      }

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data
      });
    } catch (error) {
      console.error("Update profile error:", error);
      return res.status(500).json(errorPayload("Internal server error", error));
    }
  },

  // Delete user account
  async deleteAccount(req, res) {
    try {
      const { id } = req.params;

      if (!req.user || req.user.id !== id) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to delete this account"
        });
      }

      if (!supabaseAdmin) {
        return res.status(500).json({
          success: false,
          message: "Supabase service role key is not configured"
        });
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", id);

      if (profileError) {
        return res
          .status(400)
          .json(errorPayload("Failed to delete user profile", profileError));
      }

      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

      if (authError) {
        return res
          .status(400)
          .json(errorPayload("Failed to delete user account", authError));
      }

      return res.status(200).json({
        success: true,
        message: "Account deleted successfully"
      });
    } catch (error) {
      console.error("Delete account error:", error);
      return res.status(500).json(errorPayload("Internal server error", error));
    }
  },

  // Get user statistics
  async getUserStats(req, res) {
    try {
      const { id } = req.params;

      if (!req.user || req.user.id !== id) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to view these statistics"
        });
      }

      const { count: postsCount, error: postsError } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", id);

      if (postsError) {
        console.error("Posts count error:", postsError);
      }

      const { count: commentsCount, error: commentsError } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("user_id", id);

      if (commentsError) {
        console.error("Comments count error:", commentsError);
      }

      const { count: likesCount, error: likesError } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", id);

      if (likesError) {
        console.error("Likes count error:", likesError);
      }

      return res.status(200).json({
        success: true,
        data: {
          posts_count: postsCount || 0,
          comments_count: commentsCount || 0,
          likes_count: likesCount || 0
        }
      });
    } catch (error) {
      console.error("Get user stats error:", error);
      return res.status(500).json(errorPayload("Internal server error", error));
    }
  }
};

export default userController;
