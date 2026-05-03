const PROFIT_KEY = "software_khata_profits";

export const getProfits = () => {
  const data = localStorage.getItem(PROFIT_KEY);
  if (!data) {
    // Initial dummy data to match the UI look
    const initial = {
      available: 0,
      distributions: []
    };
    localStorage.setItem(PROFIT_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
};

export const recordDistributions = (newDistributions) => {
  const current = getProfits();
  const updatedDistributions = [...current.distributions];
  
  newDistributions.forEach(dist => {
    updatedDistributions.push({
      ...dist,
      amount: parseFloat(dist.amount) || 0,
      id: Date.now() + Math.random(),
      date: new Date().toISOString().split('T')[0]
    });
  });

  const updated = {
    ...current,
    distributions: updatedDistributions
  };

  localStorage.setItem(PROFIT_KEY, JSON.stringify(updated));
  return updated;
};

export const resetProfits = () => {
  localStorage.removeItem(PROFIT_KEY);
  return getProfits();
};
