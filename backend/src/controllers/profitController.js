import supabase, { supabaseAdmin } from "../config/config.js";

const getSupabase = (req) => req.supabase || req.app?.locals?.supabase || supabaseAdmin || supabase;

const buildSummary = async (sb, userId) => {
  const [{ data: payments, error: paymentError }, { data: expenses, error: expenseError }, { data: distributions, error: distError }] =
    await Promise.all([
      sb
        .from("project_payments")
        .select("amount")
        .eq("user_id", userId),
      sb
        .from("expenses")
        .select("amount")
        .eq("user_id", userId),
      sb
        .from("profit_distributions")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
    ]);

  if (paymentError) {
    throw paymentError;
  }
  if (expenseError) {
    throw expenseError;
  }
  if (distError) {
    throw distError;
  }

  const totalRevenue = (payments || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalExpenses = (expenses || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const available = totalRevenue - totalExpenses;

  return {
    available,
    distributions: distributions || []
  };
};

export const getProfitSummary = async (req, res) => {
  const sb = getSupabase(req);

  try {
    const summary = await buildSummary(sb, req.user.id);
    return res.json({
      data: summary
    });
  } catch (error) {
    console.error("Get profits error:", error);
    return res.status(500).json({
      message: "Failed to load profits"
    });
  }
};

export const recordDistributions = async (req, res) => {
  const sb = getSupabase(req);
  const today = new Date().toISOString().split("T")[0];

  const payload = (req.body.distributions || []).map((dist) => ({
    owner: dist.owner,
    amount: Number(dist.amount),
    method: dist.method,
    date: dist.date || today,
    user_id: req.user.id
  }));

  try {
    const { error } = await sb
      .from("profit_distributions")
      .insert(payload);

    if (error) {
      return res.status(500).json({
        message: error.message
      });
    }

    const summary = await buildSummary(sb, req.user.id);

    return res.json({
      data: summary
    });
  } catch (error) {
    console.error("Record distributions error:", error);
    return res.status(500).json({
      message: "Failed to record distributions"
    });
  }
};
