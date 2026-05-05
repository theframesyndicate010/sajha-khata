import supabase from "../config/config.js";
import { nowIso, parsePagination, stripUndefined, errorPayload } from "./controllerUtils.js";

// Category controller
export const categoryController = {
  // Get all categories
  async getAllCategories(req, res) {
    try {
      const { page, limit, offset } = parsePagination(req.query.page, req.query.limit, 50);
      const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

      let query = supabase
        .from("categories")
        .select("id,name,slug,description,color,created_at,updated_at", { count: "exact" })
        .range(offset, offset + limit - 1)
        .order("name", { ascending: true });

      if (search) {
        query = query.ilike("name", `%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        return res.status(400).json(errorPayload("Failed to fetch categories", error));
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
      console.error("Get all categories error:", error);
      return res.status(500).json(errorPayload("Internal server error", error));
    }
  },

  // Get category by ID
  async getCategoryById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Category ID is required"
        });
      }

      const { data, error } = await supabase
        .from("categories")
        .select("id,name,slug,description,color,created_at,updated_at")
        .eq("id", id)
        .single();

      if (error || !data) {
        return res.status(404).json({
          success: false,
          message: "Category not found"
        });
      }

      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      console.error("Get category by ID error:", error);
      return res.status(500).json(errorPayload("Internal server error", error));
    }
  },

  // Get category by slug
  async getCategoryBySlug(req, res) {
    try {
      const { slug } = req.params;

      if (!slug) {
        return res.status(400).json({
          success: false,
          message: "Category slug is required"
        });
      }

      const { data, error } = await supabase
        .from("categories")
        .select("id,name,slug,description,color,created_at,updated_at")
        .eq("slug", slug)
        .single();

      if (error || !data) {
        return res.status(404).json({
          success: false,
          message: "Category not found"
        });
      }

      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      console.error("Get category by slug error:", error);
      return res.status(500).json(errorPayload("Internal server error", error));
    }
  },

  // Create new category
  async createCategory(req, res) {
    try {
      const { name, description, slug, color = "#000000" } = req.body;
      const normalizedName = typeof name === "string" ? name.trim() : "";
      const normalizedSlug = typeof slug === "string" ? slug.trim() : "";

      if (!normalizedName || !normalizedSlug) {
        return res.status(400).json({
          success: false,
          message: "Name and slug are required"
        });
      }

      const { data: existingCategory } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", normalizedSlug)
        .single();

      if (existingCategory) {
        return res.status(409).json({
          success: false,
          message: "Category with this slug already exists"
        });
      }

      const categoryData = {
        name: normalizedName,
        slug: normalizedSlug,
        description,
        color,
        created_at: nowIso(),
        updated_at: nowIso()
      };

      const { data, error } = await supabase
        .from("categories")
        .insert([categoryData])
        .select()
        .single();

      if (error) {
        return res.status(400).json(errorPayload("Failed to create category", error));
      }

      return res.status(201).json({
        success: true,
        message: "Category created successfully",
        data
      });
    } catch (error) {
      console.error("Create category error:", error);
      return res.status(500).json(errorPayload("Internal server error", error));
    }
  },

  // Update category
  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { name, description, slug, color } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Category ID is required"
        });
      }

      const updateData = stripUndefined({
        name: typeof name === "string" ? name.trim() : undefined,
        description,
        slug: typeof slug === "string" ? slug.trim() : undefined,
        color,
        updated_at: nowIso()
      });

      const { data, error } = await supabase
        .from("categories")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return res.status(400).json(errorPayload("Failed to update category", error));
      }

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Category not found"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data
      });
    } catch (error) {
      console.error("Update category error:", error);
      return res.status(500).json(errorPayload("Internal server error", error));
    }
  },

  // Delete category
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Category ID is required"
        });
      }

      const { count, error: countError } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("category_id", id);

      if (countError) {
        console.error("Posts count error:", countError);
      }

      if (count > 0) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete category with existing posts"
        });
      }

      const { error } = await supabase.from("categories").delete().eq("id", id);

      if (error) {
        return res.status(400).json(errorPayload("Failed to delete category", error));
      }

      return res.status(200).json({
        success: true,
        message: "Category deleted successfully"
      });
    } catch (error) {
      console.error("Delete category error:", error);
      return res.status(500).json(errorPayload("Internal server error", error));
    }
  },

  // Get posts by category
  async getPostsByCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const { page, limit, offset } = parsePagination(req.query.page, req.query.limit);

      if (!categoryId) {
        return res.status(400).json({
          success: false,
          message: "Category ID is required"
        });
      }

      const { data, error, count } = await supabase
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
        .eq("category_id", categoryId)
        .range(offset, offset + limit - 1)
        .order("created_at", { ascending: false });

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
      console.error("Get posts by category error:", error);
      return res.status(500).json(errorPayload("Internal server error", error));
    }
  }
};

export default categoryController;
