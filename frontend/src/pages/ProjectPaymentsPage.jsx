import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDownLeft, Search, Filter, Plus, FileText, CheckCircle2, Clock, AlertCircle, History, PlusCircle, X, ChevronDown, ChevronUp } from "lucide-react";
import { getProjects, recordPayment } from "../utils/paymentStorage";

export default function ProjectPaymentsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    let isActive = true;

    const loadProjects = async () => {
      try {
        const data = await getProjects();
        if (isActive) {
          setProjects(data);
        }
      } catch (error) {
        console.error("Failed to load projects", error);
      }
    };

    loadProjects();

    return () => {
      isActive = false;
    };
  }, []);

  const handleAdd = () => navigate("/project-payments/add");

  const openPayModal = (project) => {
    setSelectedProject(project);
    setShowPayModal(true);
    setPayAmount("");
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedProject || !payAmount) return;

    try {
      await recordPayment(selectedProject.id, parseFloat(payAmount), "Partial Payment", "Additional payment");
      const data = await getProjects();
      setProjects(data);
      setShowPayModal(false);
    } catch (error) {
      console.error("Failed to record payment", error);
    }
  };

  const toggleExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const calculateRemaining = (project) => {
    if (!project) return 0;
    const paid = project.payments.reduce((sum, p) => sum + p.amount, 0);
    return project.totalAmount - paid;
  };

  return (
    <div className="page-stack">
      <section className="dash-header-row">
        <div className="dash-heading-cluster">
          <div className="dash-icon-box bg-success-icon">
            <ArrowDownLeft size={24} />
          </div>
          <div>
            <h4 className="dash-main-title">Project Payments</h4>
            <p className="dash-date">Manage incoming revenue from software projects</p>
          </div>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Record Project
        </button>
      </section>

      <div className="dash-card">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
              <Filter size={16} />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full text-left border-collapse min-w-[600px] md:min-w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-4 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider w-8"></th>
                <th className="py-4 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Client & Project</th>
                <th className="py-4 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Total Amount</th>
                <th className="py-4 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Paid</th>
                <th className="py-4 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Remaining</th>
                <th className="py-4 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="py-4 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-400 italic">No project payments recorded yet. Click 'Record Project' to start.</td>
                </tr>
              ) : (
                projects.map((item) => {
                  const paid = item.payments.reduce((sum, p) => sum + p.amount, 0);
                  const remaining = item.totalAmount - paid;
                  const isExpanded = expandedRow === item.id;
                  
                  return (
                    <React.Fragment key={item.id}>
                      <tr className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${isExpanded ? 'bg-blue-50/30' : ''}`}>
                        <td className="py-4 px-2">
                          <button onClick={() => toggleExpand(item.id)} className="text-gray-400 hover:text-blue-600 transition-colors">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </td>
                        <td className="py-4 px-3">
                          <div className="font-bold text-sm text-[#0f172a] truncate max-w-[120px] sm:max-w-none">{item.client}</div>
                          <div className="text-xs text-[#475569] truncate max-w-[120px] sm:max-w-none">{item.project}</div>
                          <div className="md:hidden text-[10px] text-gray-400 mt-1 font-bold">
                            Total: Rs. {item.totalAmount.toLocaleString()}
                          </div>
                        </td>
                        <td className="py-4 px-3 font-bold text-sm text-gray-600 hidden md:table-cell">Rs. {item.totalAmount.toLocaleString()}</td>
                        <td className="py-4 px-3">
                          <div className="font-bold text-sm text-green-600">Rs. {paid.toLocaleString()}</div>
                          <div className="lg:hidden text-[10px] text-amber-600 font-bold mt-0.5">
                            Rem: Rs. {remaining.toLocaleString()}
                          </div>
                        </td>
                        <td className="py-4 px-3 font-bold text-sm text-amber-600 hidden lg:table-cell">Rs. {remaining.toLocaleString()}</td>
                        <td className="py-4 px-3">
                          <div className={`flex items-center gap-1.5 text-[10px] sm:text-xs font-bold ${
                            item.status === 'Paid' ? 'text-green-600' : 'text-amber-600'
                          }`}>
                            {item.status === 'Paid' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                            <span className="hidden sm:inline">{item.status}</span>
                            <span className="sm:hidden">{item.status === 'Paid' ? 'Paid' : 'Part'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-3 text-right">
                          <div className="flex justify-end gap-1 sm:gap-2">
                            {item.status !== 'Paid' && (
                              <button 
                                onClick={() => openPayModal(item)}
                                className="flex items-center gap-1 px-2 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold hover:bg-blue-100 transition-colors"
                              >
                                <PlusCircle size={12} /> <span className="hidden sm:inline">Deduct</span>
                              </button>
                            )}
                            <button className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors" title="View History" onClick={() => toggleExpand(item.id)}>
                              <History size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-gray-50/50">
                          <td colSpan="7" className="py-4 px-12 border-b border-gray-100">
                            <div className="space-y-3">
                              <h6 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <History size={12} /> Payment Trace
                              </h6>
                              <div className="space-y-2">
                                {item.payments.map((p, idx) => (
                                  <div key={p.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                                        {idx + 1}
                                      </div>
                                      <div>
                                        <div className="text-xs font-bold">Rs. {p.amount.toLocaleString()}</div>
                                        <div className="text-[10px] text-gray-400">{p.date} • {p.type}</div>
                                      </div>
                                    </div>
                                    {p.notes && <div className="text-[10px] text-gray-500 italic max-w-[200px] truncate">{p.notes}</div>}
                                  </div>
                                ))}
                                {item.status !== 'Paid' && (
                                  <div className="text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-2 rounded-lg inline-block">
                                    Remaining Balance: Rs. {calculateRemaining(item).toLocaleString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-600 text-white">
              <div>
                <h5 className="font-bold">Deduct Payment</h5>
                <p className="text-xs text-blue-100 opacity-80">{selectedProject?.client} - {selectedProject?.project}</p>
              </div>
              <button onClick={() => setShowPayModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Amount to Deduct</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rs.</span>
                  <input 
                    type="number" 
                    autoFocus
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-bold text-lg"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-[10px] text-gray-400">
                  Remaining balance: <span className="font-bold text-amber-600">Rs. {calculateRemaining(selectedProject).toLocaleString()}</span>
                </p>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowPayModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

