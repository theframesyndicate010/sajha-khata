import supabase from "../config/config.js";
import {
  nowIso,
  toDateOnly,
  parseNumber,
  parsePagination,
  stripUndefined,
  errorPayload
} from "./controllerUtils.js";

export const expenseController = {
  // Get expenses
  async getAllExpenses(req, res) {
    try {
      const { page, limit, offset } = parsePagination(req.query.page, req.query.limit, 50);
      const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
      const category = req.query.category;
      const from = req.query.from;
      const to = req.query.to;

      let query = supabase
        .from("expenses")
        .select("*", { count: "exact" })
        .range(offset, offset + limit - 1)
        .order("date", { ascending: false });

      if (search) {
        query = query.or(`name.ilike.%${search}%,notes.ilike.%${search}%`);
      }

      if (category) {
        query = query.eq("category", category);
      }

      if (from) {
        query = query.gte("date", from);
      }

      if (to) {
        query = query.lte("date", to);
      }

      const { data, error, count } = await query;

      if (error) {
        return res.status(400).json(errorPayload("Failed to fetch expenses", error));
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
      console.error("Get expenses error:", error);
      return res.status(500).json(errorPayload("Internal server error", error));
    }
  },

  // Create expense
  async createExpense(req, res) {
    try {
      const { name, category, amount, date, method, notes, trend } = req.body;
      const normalizedName = typeof name === "string" ? name.trim() : "";
      const normalizedCategory = typeof category === "string" ? category.trim() : "";
      const numericAmount = parseNumber(amount);

      if (!normalizedName || !normalizedCategory || numericAmount === null) {
        return res.status(400).json({
          success: false,
          message: "Name, category, and amount are required"
        });
      }

      if (numericAmount < 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be a positive number"
        });
      }

      const { data, error } = await supabase
        .from("expenses")
        .insert([
          {
            name: normalizedName,
            category: normalizedCategory,
            amount: numericAmount,
            date: toDateOnly(date),
            method: method || null,
            notes: notes || null,
            trend: trend || "0%",
            created_at: nowIso(),
            updated_at: nowIso()
          }
        ])
        .select()
        .single();

      if (error) {
        return res.status(400).json(errorPayload("Failed to create expense", error));
      }

      return res.status(201).json({
        success: true,
        message: "Expense recorded successfully",
        data
      });
    } catch (error) {
      console.error("Create expense error:", error);
      return res.status(500).json(errorPayload("Internal server error", error));
    }
  },

  // Update expense
  async updateExpense(req, res) {
    try {
      const { id } = req.params;
      const { name, category, amount, date, method, notes, trend } = req.body;

      const numericAmount = amount !== undefined ? parseNumber(amount) : undefined;

      if (amount !== undefined && numericAmount === null) {
        return res.status(400).json({
          success: false,
          message: "Amount must be a number"
        });
      }

      const updateData = stripUndefined({
        name: typeof name === "string" ? name.trim() : undefined,
        category: typeof category === "string" ? category.trim() : undefined,
        amount: numericAmount,
        date,
        method,
        notes,
        trend,
        updated_at: nowIso()
      });

      const { data, error } = await supabase
        .from("expenses")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return res.status(400).json(errorPayload("Failed to update expense", error));
      }

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Expense not found"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Expense updated successfully",
        data
      });
    } catch (error) {
      console.error("Update expense error:", error);
      return res.status(500).json(errorPayload("Internal server error", error));
    }
  },

  // Delete expense
  async deleteExpense(req, res) {
    try {
      const { id } = req.params;

      const { error } = await supabase.from("expenses").delete().eq("id", id);

      if (error) {
        return res.status(400).json(errorPayload("Failed to delete expense", error));
      }

      return res.status(200).json({
        success: true,
        message: "Expense deleted successfully"
      });
    } catch (error) {
      console.error("Delete expense error:", error);
      return res.status(500).json(errorPayload("Internal server error", error));
    }
  }
};

export default expenseController;
