import supabase, { supabaseAdmin } from "../config/config.js";

const getSupabase = (req) => req.supabase || req.app?.locals?.supabase || supabaseAdmin || supabase;

const normalizeExpenseMethod = (value) => {
  const normalized = String(value || "").trim().toLowerCase();

  if (["card", "corporate card", "credit"].includes(normalized)) {
    return "card";
  }

  if (["bank", "bank transfer", "cash", "upi", "online"].includes(normalized)) {
    return "bank";
  }

  return normalized;
};

export const listExpenses = async (req, res) => {
  const sb = getSupabase(req);

  try {
    const { data, error } = await sb
      .from("expenses")
      .select("*")
      .eq("user_id", req.user.id)
      .order("date", { ascending: false });

    if (error) {
      return res.status(500).json({
        message: error.message
      });
    }

    return res.json({
      data: data || []
    });
  } catch (error) {
    console.error("List expenses error:", error);
    return res.status(500).json({
      message: "Failed to load expenses"
    });
  }
};

export const createExpense = async (req, res) => {
  const sb = getSupabase(req);
  const payload = {
    name: req.body.name,
    category: req.body.category,
    amount: Number(req.body.amount),
    date: req.body.date,
    method: normalizeExpenseMethod(req.body.method),
    notes: req.body.notes || null,
    trend: req.body.trend || "0%",
    user_id: req.user.id
  };

  try {
    const { data, error } = await sb
      .from("expenses")
      .insert([payload])
      .select("*")
      .single();

    if (error) {
      return res.status(500).json({
        message: error.message
      });
    }

    return res.status(201).json({
      data
    });
  } catch (error) {
    console.error("Create expense error:", error);
    return res.status(500).json({
      message: "Failed to create expense"
    });
  }
};
