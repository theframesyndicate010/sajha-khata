import supabase, { supabaseAdmin } from "../config/config.js";

const getSupabase = (req) => req.supabase || req.app?.locals?.supabase || supabaseAdmin || supabase;

const buildStatus = (totalAmount, totalPaid) => {
  return totalPaid >= totalAmount ? "Paid" : "Partial";
};

const attachPayments = (projects, payments) => {
  const grouped = payments.reduce((acc, payment) => {
    if (!acc[payment.project_id]) {
      acc[payment.project_id] = [];
    }
    acc[payment.project_id].push(payment);
    return acc;
  }, {});

  return projects.map((project) => ({
    ...project,
    payments: grouped[project.id] || []
  }));
};

export const listProjects = async (req, res) => {
  const sb = getSupabase(req);

  try {
    const { data: projects, error: projectError } = await sb
      .from("projects")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (projectError) {
      return res.status(500).json({
        message: projectError.message
      });
    }

    const projectIds = (projects || []).map((project) => project.id);

    if (projectIds.length === 0) {
      return res.json({
        data: []
      });
    }

    const { data: payments, error: paymentError } = await sb
      .from("project_payments")
      .select("*")
      .in("project_id", projectIds)
      .order("date", { ascending: true });

    if (paymentError) {
      return res.status(500).json({
        message: paymentError.message
      });
    }

    const result = attachPayments(projects, payments || []).map((project) => {
      const totalPaid = project.payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
      // Map DB status (stored lowercase) to UI label (capitalize)
      const computed = buildStatus(Number(project.total_amount || 0), totalPaid);
      const uiStatus = project.status ? String(project.status).charAt(0).toUpperCase() + String(project.status).slice(1) : computed;
      return {
        ...project,
        status: uiStatus
      };
    });

    return res.json({
      data: result
    });
  } catch (error) {
    console.error("List projects error:", error);
    return res.status(500).json({
      message: "Failed to load projects"
    });
  }
};

export const createProject = async (req, res) => {
  const sb = getSupabase(req);

  const totalAmount = Number(req.body.totalAmount);
  const paidAmount = Number(req.body.paidAmount || 0);
  const status = buildStatus(totalAmount, paidAmount);
  // Normalize status for DB (use lowercase) but keep original label for UI
  const dbStatus = typeof status === "string" ? status.toLowerCase() : status;
  const projectPayload = {
    client: req.body.client,
    project: req.body.project,
    total_amount: totalAmount,
    status: dbStatus,
    date: req.body.date,
    user_id: req.user.id
  };

  try {
    let project = null;
    let projectError = null;
    try {
      const insertRes = await sb.from("projects").insert([projectPayload]).select("*").single();
      project = insertRes.data;
      projectError = insertRes.error;
    } catch (e) {
      projectError = e;
    }

    // If DB check constraint on status fails, try fallback candidate statuses
    if (projectError) {
      if (projectError.message && projectError.message.includes("projects_status_check")) {
        const candidates = [dbStatus, status, String(status).toUpperCase(), "open", "pending", "partial", "paid", "unpaid"];
        let inserted = null;
        for (const cand of candidates) {
          try {
            const payloadTry = { ...projectPayload, status: cand };
            const { data: p2, error: e2 } = await sb.from("projects").insert([payloadTry]).select("*").single();
            if (!e2 && p2) {
              inserted = p2;
              break;
            }
          } catch (e) {
            // ignore and continue
          }
        }

        if (!inserted) {
          return res.status(500).json({ message: projectError.message });
        }

        // use the successfully inserted project
        project = inserted;
      } else {
        return res.status(500).json({
          message: projectError.message
        });
      }
    }

    let payments = [];

    if (paidAmount > 0) {
      const paymentPayload = {
        project_id: project.id,
        amount: paidAmount,
        date: req.body.date,
        type: req.body.type,
        notes: req.body.notes || null,
        user_id: req.user.id
      };

      const { data: payment, error: paymentError } = await sb
        .from("project_payments")
        .insert([paymentPayload])
        .select("*")
        .single();

      if (paymentError) {
        return res.status(500).json({
          message: paymentError.message
        });
      }

      payments = [payment];
    }

    // Return status as the original label (capitalized) for the UI
    const clientProject = {
      ...project,
      status,
      payments
    };

    return res.status(201).json({
      data: clientProject
    });
  } catch (error) {
    console.error("Create project error:", error);
    return res.status(500).json({
      message: "Failed to create project"
    });
  }
};

export const recordPayment = async (req, res) => {
  const sb = getSupabase(req);
  const projectId = req.params.id;

  try {
    const { data: project, error: projectError } = await sb
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", req.user.id)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    const paymentPayload = {
      project_id: projectId,
      amount: Number(req.body.amount),
      date: new Date().toISOString().split("T")[0],
      type: req.body.type,
      notes: req.body.notes || null,
      user_id: req.user.id
    };

    const { error: insertError } = await sb
      .from("project_payments")
      .insert([paymentPayload]);

    if (insertError) {
      return res.status(500).json({
        message: insertError.message
      });
    }

    const { data: payments, error: paymentsError } = await sb
      .from("project_payments")
      .select("*")
      .eq("project_id", projectId)
      .order("date", { ascending: true });

    if (paymentsError) {
      return res.status(500).json({
        message: paymentsError.message
      });
    }

    const totalPaid = (payments || []).reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const computedStatus = buildStatus(Number(project.total_amount || 0), totalPaid);
    const dbComputedStatus = typeof computedStatus === "string" ? computedStatus.toLowerCase() : computedStatus;

    if (dbComputedStatus !== project.status) {
      await sb
        .from("projects")
        .update({ status: dbComputedStatus })
        .eq("id", projectId)
        .eq("user_id", req.user.id);
    }

    // Return UI-friendly status label
    const uiStatus = computedStatus;

    return res.json({
      data: {
        ...project,
        status: uiStatus,
        payments: payments || []
      }
    });
  } catch (error) {
    console.error("Record payment error:", error);
    return res.status(500).json({
      message: "Failed to record payment"
    });
  }
};
