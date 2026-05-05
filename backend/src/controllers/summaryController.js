import supabase from "../config/config.js";
import { sumAmounts, errorPayload } from "./controllerUtils.js";

export const summaryController = {
  // Get dashboard summary
  async getSummary(req, res) {
    try {
      const [paymentsResult, expensesResult, distributionsResult, projectsResult, expensesListResult] =
        await Promise.all([
          supabase.from("project_payments").select("amount"),
          supabase.from("expenses").select("amount"),
          supabase.from("profit_distributions").select("amount"),
          supabase
            .from("projects")
            .select("id,client,project,total_amount,status,date,created_at")
            .order("created_at", { ascending: false })
            .limit(3),
          supabase
            .from("expenses")
            .select("id,name,category,amount,date,method,trend,created_at")
            .order("date", { ascending: false })
            .limit(3)
        ]);

      const payments = paymentsResult.data || [];
      const expenses = expensesResult.data || [];
      const distributions = distributionsResult.data || [];
      const recentProjects = projectsResult.data || [];
      const recentExpenses = expensesListResult.data || [];

      const totalRevenue = sumAmounts(payments || []);
      const totalExpenses = sumAmounts(expenses || []);
      const totalDistributed = sumAmounts(distributions || []);
      const remainingProfit = totalRevenue - totalExpenses - totalDistributed;

      return res.status(200).json({
        success: true,
        data: {
          totalRevenue,
          totalExpenses,
          totalDistributed,
          remainingProfit,
          recentProjects,
          recentExpenses
        }
      });
    } catch (error) {
      console.error("Get summary error:", error);
      return res.status(500).json(errorPayload("Internal server error", error));
    }
  }
};

export default summaryController;
