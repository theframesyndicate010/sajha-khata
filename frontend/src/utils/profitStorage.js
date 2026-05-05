import { fetchJson } from "./apiClient";

const mapDistribution = (dist) => ({
  id: dist.id,
  owner: dist.owner,
  amount: Number(dist.amount) || 0,
  method: dist.method,
  date: dist.date
});

export const getProfits = async () => {
  const response = await fetchJson("/profits", { withAuth: true });
  return {
    available: Number(response?.data?.available) || 0,
    distributions: (response?.data?.distributions || []).map(mapDistribution)
  };
};

export const recordDistributions = async (newDistributions) => {
  const response = await fetchJson("/profits/distributions", {
    method: "POST",
    withAuth: true,
    body: { distributions: newDistributions }
  });

  return {
    available: Number(response?.data?.available) || 0,
    distributions: (response?.data?.distributions || []).map(mapDistribution)
  };
};
