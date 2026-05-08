import { fetchJson } from "./apiClient";

const formatMethod = (method) => {
  if (method === "card") {
    return "Corporate Card";
  }
  if (method === "bank") {
    return "Bank Transfer";
  }
  return method;
};

const mapExpense = (expense) => ({
  id: expense.id,
  name: expense.name,
  category: expense.category,
  amount: Number(expense.amount) || 0,
  date: expense.date,
  method: formatMethod(expense.method),
  notes: expense.notes,
  trend: expense.trend || "0%"
});

export const getExpenses = async () => {
  const response = await fetchJson("/expenses", { withAuth: true });
  return (response.data || []).map(mapExpense);
};

export const addExpense = async (expense) => {
  const response = await fetchJson("/expenses", {
    method: "POST",
    withAuth: true,
    body: expense
  });

  return mapExpense(response.data);
};
