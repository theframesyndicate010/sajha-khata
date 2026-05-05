import { fetchJson } from "./apiClient";

const mapPayment = (payment) => ({
  id: payment.id,
  amount: Number(payment.amount) || 0,
  date: payment.date,
  type: payment.type,
  notes: payment.notes
});

const mapProject = (project) => ({
  id: project.id,
  client: project.client,
  project: project.project,
  totalAmount: Number(project.total_amount ?? project.totalAmount) || 0,
  status: project.status,
  date: project.date,
  payments: (project.payments || []).map(mapPayment)
});

export const getProjects = async () => {
  const response = await fetchJson("/projects", { withAuth: true });
  return (response.data || []).map(mapProject);
};

export const addProject = async (project) => {
  const response = await fetchJson("/projects", {
    method: "POST",
    withAuth: true,
    body: project
  });

  return mapProject(response.data);
};

export const recordPayment = async (projectId, paymentAmount, type, notes = "") => {
  const response = await fetchJson(`/projects/${projectId}/payments`, {
    method: "POST",
    withAuth: true,
    body: {
      amount: paymentAmount,
      type,
      notes
    }
  });

  return mapProject(response.data);
};
