import supabase from "../config/config.js";
import { nowIso, toDateOnly, sumAmounts, parseNumber, errorPayload } from "./controllerUtils.js";

const fetchTotals = async () => {
  const [paymentsResult, expensesResult] = await Promise.all([
    supabase.from("project_payments").select("amount"),
    supabase.from("expenses").select("amount")
  ]);

  const paymentRows = paymentsResult.data || [];
  const expenseRows = expensesResult.data || [];

  const revenue = sumAmounts(paymentRows || []);
  const expenses = sumAmounts(expenseRows || []);

  return {
    revenue,
    expenses,
    available: revenue - expenses
  };
};

export const profitController = {
  // Get profit summary with distributions
  async getProfitSummary(req, res) {
    try {
      const totals = await fetchTotals();

      const { data: distributions, error } = await supabase
        .from("profit_distributions")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        return res.status(400).json(errorPayload("Failed to fetch distributions", error));
      }

      return res.status(200).json({
        success: true,
        data: {
          available: totals.available,
          distributions: distributions || []
        }
      });
    } catch (error) {
      console.error("Get profit summary error:", error);
      return res.status(500).json(errorPayload("Internal server error", error));
    }
  },

  // Record distributions
  async recordDistributions(req, res) {
    try {
      const { distributions } = req.body;

      if (!Array.isArray(distributions) || distributions.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Distributions are required"
        });
      }

      const payload = distributions.map((item) => {
        const owner = typeof item.owner === "string" ? item.owner.trim() : "";
        const amount = parseNumber(item.amount) ?? 0;

        return {
          owner,
          amount,
          method: item.method || "Bank Transfer",
          date: toDateOnly(item.date),
          created_at: nowIso()
        };
      });

      const hasInvalid = payload.some((item) => !item.owner || item.amount <= 0);
      if (hasInvalid) {
        return res.status(400).json({
          success: false,
          message: "Each distribution must include an owner and positive amount"
        });
      }

      const { data, error } = await supabase
        .from("profit_distributions")
        .insert(payload)
        .select();

      if (error) {
        return res.status(400).json(errorPayload("Failed to record distributions", error));
      }

      const totals = await fetchTotals();

      return res.status(201).json({
        success: true,
        message: "Distributions recorded successfully",
        data: {
          available: totals.available,
          distributions: data || []
        }
      });
    } catch (error) {
      console.error("Record distributions error:", error);
      return res.status(500).json(errorPayload("Internal server error", error));
    }
  },

  // Delete a distribution
  async deleteDistribution(req, res) {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from("profit_distributions")
        .delete()
        .eq("id", id);

      if (error) {
        return res.status(400).json(errorPayload("Failed to delete distribution", error));
      }

      return res.status(200).json({
        success: true,
        message: "Distribution deleted successfully"
      });
    } catch (error) {
      console.error("Delete distribution error:", error);
      return res.status(500).json(errorPayload("Internal server error", error));
    }
  }
};

export default profitController;
