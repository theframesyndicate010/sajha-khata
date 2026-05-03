const EXPENSE_KEY = "software_khata_expenses";

export const getExpenses = () => {
  const data = localStorage.getItem(EXPENSE_KEY);
  return data ? JSON.parse(data) : [];
};

export const addExpense = (expense) => {
  const current = getExpenses();
  const updated = [...current, { ...expense, id: Date.now() }];
  localStorage.setItem(EXPENSE_KEY, JSON.stringify(updated));
  return updated;
};
