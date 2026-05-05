import supabase from "../config/config.js";
import {
  nowIso,
  toDateOnly,
  sumAmounts,
  parseNumber,
  parsePagination,
  stripUndefined,
  errorPayload
} from "./controllerUtils.js";

const buildStatus = (paidTotal, totalAmount) => {
  if (paidTotal >= totalAmount) {
    return "Paid";
  }
  return paidTotal > 0 ? "Partially Paid" : "Pending";
};

const fetchProjectWithPayments = async (projectId) => {
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (!project) {
    return null;
  }

  const { data: payments } = await supabase
    .from("project_payments")
    .select("*")
    .eq("project_id", projectId)
    .order("date", { ascending: true });

  return { ...project, payments: payments || [] };
};

export const projectController = {
  // Get all projects
  async getAllProjects(req, res) {
    try {
      const { page, limit, offset } = parsePagination(req.query.page, req.query.limit, 50);
      const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
      const status = req.query.status;

      let query = supabase
        .from("projects")
        .select("*", { count: "exact" })
        .range(offset, offset + limit - 1)
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(`client.ilike.%${search}%,project.ilike.%${search}%`);
      }

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error, count } = await query;

      if (error) {
        return res.status(400).json(errorPayload("Failed to fetch projects", error));
      }

      const projectIds = (data || []).map((item) => item.id);
      const { data: payments } = await supabase
        .from("project_payments")
        .select("*")
        .in("project_id", projectIds.length ? projectIds : ["__none__"]);

      const paymentsByProject = (payments || []).reduce((acc, payment) => {
        acc[payment.project_id] = acc[payment.project_id] || [];
        acc[payment.project_id].push(payment);
        return acc;
      }, {});

      const payload = (data || []).map((project) => ({
        ...project,
        payments: paymentsByProject[project.id] || []
      }));

      return res.status(200).json({
        success: true,
        data: payload,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error("Get all projects error:", error);
      return res.status(500).json(errorPayload("Internal server error", error));
    }
  },

  // Get project by ID
  async getProjectById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Project ID is required"
        });
      }

      const project = await fetchProjectWithPayments(id);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found"
        });
      }

      return res.status(200).json({
        success: true,
        data: project
      });
    } catch (error) {
      console.error("Get project by ID error:", error);
      return res.status(500).json(errorPayload("Internal server error", error));
    }
  },

  // Create project with initial payment
  async createProject(req, res) {
    try {
      const { client, project, totalAmount, paidAmount = 0, date, type, notes } = req.body;
      const normalizedClient = typeof client === "string" ? client.trim() : "";
      const normalizedProject = typeof project === "string" ? project.trim() : "";
      const numericTotal = parseNumber(totalAmount);
      const numericPaid = parseNumber(paidAmount) ?? 0;

      if (!normalizedClient || !normalizedProject || numericTotal === null) {
        return res.status(400).json({
          success: false,
          message: "Client, project name, and total amount are required"
        });
      }

      if (numericTotal < 0 || numericPaid < 0) {
        return res.status(400).json({
          success: false,
          message: "Amounts must be positive numbers"
        });
      }
      const status = buildStatus(numericPaid, numericTotal);

      const { data: createdProject, error: projectError } = await supabase
        .from("projects")
        .insert([
          {
            client: normalizedClient,
            project: normalizedProject,
            total_amount: numericTotal,
            status,
            date: toDateOnly(date),
            created_at: nowIso(),
            updated_at: nowIso()
          }
        ])
        .select()
        .single();

      if (projectError) {
        return res.status(400).json(errorPayload("Failed to create project", projectError));
      }

      if (numericPaid > 0) {
        const { error: paymentError } = await supabase.from("project_payments").insert([
          {
            project_id: createdProject.id,
            amount: numericPaid,
            date: toDateOnly(date),
            type: type || "Full Payment",
            notes: notes || null,
            created_at: nowIso()
          }
        ]);

        if (paymentError) {
          return res
            .status(400)
            .json(errorPayload("Project created but failed to add payment", paymentError));
        }
      }

      const payload = await fetchProjectWithPayments(createdProject.id);

      return res.status(201).json({
        success: true,
        message: "Project created successfully",
        data: payload
      });
    } catch (error) {
      console.error("Create project error:", error);
      return res.status(500).json(errorPayload("Internal server error", error));
    }
  },

  // Update project details
  async updateProject(req, res) {
    try {
      const { id } = req.params;
      const { client, project, totalAmount, status, date } = req.body;

      const numericTotal = totalAmount !== undefined ? parseNumber(totalAmount) : undefined;

      if (totalAmount !== undefined && numericTotal === null) {
        return res.status(400).json({
          success: false,
          message: "Total amount must be a number"
        });
      }

      const updateData = stripUndefined({
        client: typeof client === "string" ? client.trim() : undefined,
        project: typeof project === "string" ? project.trim() : undefined,
        total_amount: numericTotal,
        status,
        date,
        updated_at: nowIso()
      });

      const { data, error } = await supabase
        .from("projects")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return res.status(400).json(errorPayload("Failed to update project", error));
      }

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Project not found"
        });
      }

      const payload = await fetchProjectWithPayments(id);

      return res.status(200).json({
        success: true,
        message: "Project updated successfully",
        data: payload
      });
    } catch (error) {
      console.error("Update project error:", error);
      return res.status(500).json(errorPayload("Internal server error", error));
    }
  },

  // Delete project
  async deleteProject(req, res) {
    try {
      const { id } = req.params;

      await supabase.from("project_payments").delete().eq("project_id", id);

      const { error } = await supabase.from("projects").delete().eq("id", id);

      if (error) {
        return res.status(400).json(errorPayload("Failed to delete project", error));
      }

      return res.status(200).json({
        success: true,
        message: "Project deleted successfully"
      });
    } catch (error) {
      console.error("Delete project error:", error);
      return res.status(500).json(errorPayload("Internal server error", error));
    }
  },

  // Record payment against a project
  async recordPayment(req, res) {
    try {
      const { id } = req.params;
      const { amount, date, type, notes } = req.body;
      const numericAmount = parseNumber(amount);

      if (numericAmount === null || numericAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Payment amount must be a positive number"
        });
      }

      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("id, total_amount")
        .eq("id", id)
        .single();

      if (projectError || !project) {
        return res.status(404).json({
          success: false,
          message: "Project not found"
        });
      }

      const { error: paymentError } = await supabase.from("project_payments").insert([
        {
          project_id: id,
          amount: numericAmount,
          date: toDateOnly(date),
          type: type || "Partial Payment",
          notes: notes || null,
          created_at: nowIso()
        }
      ]);

      if (paymentError) {
        return res.status(400).json(errorPayload("Failed to record payment", paymentError));
      }

      const { data: payments } = await supabase
        .from("project_payments")
        .select("amount")
        .eq("project_id", id);

      const paidTotal = sumAmounts(payments || []);
      const status = buildStatus(paidTotal, Number(project.total_amount));

      await supabase
        .from("projects")
        .update({
          status,
          updated_at: nowIso()
        })
        .eq("id", id);

      const payload = await fetchProjectWithPayments(id);

      return res.status(200).json({
        success: true,
        message: "Payment recorded successfully",
        data: payload
      });
    } catch (error) {
      console.error("Record payment error:", error);
      return res.status(500).json(errorPayload("Internal server error", error));
    }
  }
};

export default projectController;
