const STORAGE_KEY = "frame_khata_payments";

export const getProjects = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveProjects = (projects) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

export const addProject = (project) => {
  const projects = getProjects();
  const newProject = {
    ...project,
    id: Date.now(),
    payments: project.payments || [],
  };
  projects.push(newProject);
  saveProjects(projects);
  return newProject;
};

export const recordPayment = (projectId, paymentAmount, type, notes = "") => {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === projectId);
  if (index === -1) return null;

  const project = projects[index];
  const totalPaid = project.payments.reduce((sum, p) => sum + p.amount, 0) + paymentAmount;
  
  const newPayment = {
    id: Date.now(),
    amount: paymentAmount,
    date: new Date().toISOString().split("T")[0],
    type,
    notes,
  };

  project.payments.push(newPayment);
  
  // Update status
  if (totalPaid >= project.totalAmount) {
    project.status = "Paid";
  } else {
    project.status = "Partially Paid";
  }

  projects[index] = project;
  saveProjects(projects);
  return project;
};
