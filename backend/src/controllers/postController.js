import supabase from "../config/config.js";
import { nowIso, parsePagination, stripUndefined, errorPayload } from "./controllerUtils.js";

// Post controller
export const postController = {
  // Create a new post
  async createPost(req, res) {
    try {
      const { title, content, category_id, tags = [] } = req.body;
      const normalizedTitle = typeof title === "string" ? title.trim() : "";
      const normalizedContent = typeof content === "string" ? content.trim() : "";

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated"
        });
      }

      if (!normalizedTitle || !normalizedContent) {
        return res.status(400).json({
          success: false,
          message: "Title and content are required"
        });
      }

      const postData = {
        title: normalizedTitle,
        content: normalizedContent,
        user_id: req.user.id,
        category_id,
        tags,
        created_at: nowIso(),
        updated_at: nowIso()
      };

      const { data, error } = await supabase
        .from("posts")
        .insert([postData])
        .select(
          `
          *,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url
          ),
          categories:category_id (
            id,
            name,
            slug
          )
        `
        )
        .single();

      if (error) {
        return res.status(400).json(errorPayload("Failed to create post", error));
      }

      return res.status(201).json({
        success: true,
        message: "Post created successfully",
        data
      });
    } catch (error) {
      console.error("Create post error:", error);
      return res.status(500).json(errorPayload("Internal server error", error));
    }
  },

  // Get all posts
  async getAllPosts(req, res) {
    try {
      const { category_id, user_id, sortBy = "created_at", order = "desc" } = req.query;
      const { page, limit, offset } = parsePagination(req.query.page, req.query.limit);
      const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

      let query = supabase
        .from("posts")
        .select(
          `
          *,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url
          ),
          categories:category_id (
            id,
            name,
            slug
          )
        `,
          { count: "exact" }
        )
        .range(offset, offset + limit - 1)
        .order(sortBy, { ascending: order === "asc" });

      if (category_id) {
        query = query.eq("category_id", category_id);
      }

      if (user_id) {
        query = query.eq("user_id", user_id);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        return res.status(400).json(errorPayload("Failed to fetch posts", error));
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
      console.error("Get all posts error:", error);
      return res.status(500).json(errorPayload("Internal server error", error));
    }
  },

  // Get single post by ID
  async getPostById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Post ID is required"
        });
      }

      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url
          ),
          categories:category_id (
            id,
            name,
            slug
          ),
          comments (
            id,
            content,
            created_at,
            profiles (
              id,
              username,
              full_name,
              avatar_url
            )
          )
        `
        )
        .eq("id", id)
        .single();

      if (error || !data) {
        return res.status(404).json({
          success: false,
          message: "Post not found"
        });
      }

      const { count: likesCount, error: likesError } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", id);

      if (likesError) {
        console.error("Likes count error:", likesError);
      }

      return res.status(200).json({
        success: true,
        data: {
          ...data,
          likes_count: likesCount || 0
        }
      });
    } catch (error) {
      console.error("Get post by ID error:", error);
      return res.status(500).json(errorPayload("Internal server error", error));
    }
  },

  // Update post
  async updatePost(req, res) {
    try {
      const { id } = req.params;
      const { title, content, category_id, tags } = req.body;

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated"
        });
      }

      const { data: existingPost, error: checkError } = await supabase
        .from("posts")
        .select("user_id")
        .eq("id", id)
        .single();

      if (checkError || !existingPost) {
        return res.status(404).json({
          success: false,
          message: "Post not found"
        });
      }

      if (existingPost.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to update this post"
        });
      }

      const updateData = stripUndefined({
        title: typeof title === "string" ? title.trim() : undefined,
        content: typeof content === "string" ? content.trim() : undefined,
        category_id,
        tags,
        updated_at: nowIso()
      });

      const { data, error } = await supabase
        .from("posts")
        .update(updateData)
        .eq("id", id)
        .select(
          `
          *,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url
          ),
          categories:category_id (
            id,
            name,
            slug
          )
        `
        )
        .single();

      if (error) {
        return res.status(400).json(errorPayload("Failed to update post", error));
      }

      return res.status(200).json({
        success: true,
        message: "Post updated successfully",
        data
      });
    } catch (error) {
      console.error("Update post error:", error);
      return res.status(500).json(errorPayload("Internal server error", error));
    }
  },

  // Delete post
  async deletePost(req, res) {
    try {
      const { id } = req.params;

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated"
        });
      }

      const { data: existingPost, error: checkError } = await supabase
        .from("posts")
        .select("user_id")
        .eq("id", id)
        .single();

      if (checkError || !existingPost) {
        return res.status(404).json({
          success: false,
          message: "Post not found"
        });
      }

      if (existingPost.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to delete this post"
        });
      }

      await supabase.from("likes").delete().eq("post_id", id);
      await supabase.from("comments").delete().eq("post_id", id);

      const { error } = await supabase.from("posts").delete().eq("id", id);

      if (error) {
        return res.status(400).json(errorPayload("Failed to delete post", error));
      }

      return res.status(200).json({
        success: true,
        message: "Post deleted successfully"
      });
    } catch (error) {
      console.error("Delete post error:", error);
      return res.status(500).json(errorPayload("Internal server error", error));
    }
  },

  // Toggle like on post
  async toggleLike(req, res) {
    try {
      const { id } = req.params;

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated"
        });
      }

      const { data: existingLike, error: checkError } = await supabase
        .from("likes")
        .select("*")
        .eq("post_id", id)
        .eq("user_id", req.user.id)
        .single();

      if (existingLike) {
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("id", existingLike.id);

        if (error) {
          return res.status(400).json(errorPayload("Failed to remove like", error));
        }

        return res.status(200).json({
          success: true,
          message: "Like removed"
        });
      }

      const { error } = await supabase.from("likes").insert([
        {
          post_id: id,
          user_id: req.user.id,
          created_at: new Date().toISOString()
        }
      ]);

      if (error) {
        return res.status(400).json(errorPayload("Failed to add like", error));
      }

      return res.status(200).json({
        success: true,
        message: "Like added"
      });
    } catch (error) {
      console.error("Toggle like error:", error);
      return res.status(500).json(errorPayload("Internal server error", error));
    }
  }
};

export default postController;
