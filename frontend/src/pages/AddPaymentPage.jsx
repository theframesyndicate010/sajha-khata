import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, X, Briefcase, User, IndianRupee, Calendar, Tag, Info } from "lucide-react";
import { addProject } from "../utils/paymentStorage";

export default function AddPaymentPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    client: "",
    project: "",
    totalAmount: "",
    paidAmount: "",
    date: new Date().toISOString().split("T")[0],
    type: "Full Payment",
    notes: ""
  });

  const handleBack = () => navigate("/project-payments");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addProject({
        client: formData.client,
        project: formData.project,
        totalAmount: parseFloat(formData.totalAmount),
        paidAmount: parseFloat(formData.paidAmount),
        date: formData.date,
        type: formData.type,
        notes: formData.notes
      });
      navigate("/project-payments");
    } catch (error) {
      console.error("Failed to create project", error);
    }
  };

  return (
    <div className="page-stack">
      <section className="dash-header-row">
        <div className="dash-heading-cluster">
          <button onClick={handleBack} className="icon-btn mr-2">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h4 className="dash-main-title">Record Project Payment</h4>
            <p className="dash-date">Add a new revenue entry for software delivery</p>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto w-full">
        <div className="dash-card">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <User size={14} /> Client Name
                </label>
                <input 
                  type="text" 
                  name="client"
                  value={formData.client}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Acme Corp" 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <Briefcase size={14} /> Project Name
                </label>
                <input 
                  type="text" 
                  name="project"
                  value={formData.project}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Mobile App Development" 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <Info size={14} /> Total Project Cost
                </label>
                <input 
                  type="number" 
                  name="totalAmount"
                  value={formData.totalAmount}
                  onChange={handleChange}
                  required
                  placeholder="0.00" 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-bold text-blue-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <IndianRupee size={14} /> Amount Being Paid Now
                </label>
                <input 
                  type="number" 
                  name="paidAmount"
                  value={formData.paidAmount}
                  onChange={handleChange}
                  required
                  placeholder="0.00" 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <Calendar size={14} /> Payment Date
                </label>
                <input 
                  type="date" 
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <Tag size={14} /> Payment Type
                </label>
                <select 
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all bg-white"
                >
                  <option value="Full Payment">Full Payment</option>
                  <option value="Partial Payment">Partial Payment</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Notes / Description</label>
              <textarea 
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3" 
                placeholder="Add any specific details about this payment..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              ></textarea>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="button"
                onClick={handleBack}
                className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <X size={18} /> Cancel
              </button>
              <button 
                type="submit"
                className="flex-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Save size={18} /> Save Payment Record
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

