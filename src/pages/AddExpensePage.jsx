import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, X, Server, IndianRupee, Calendar, Layers, Tag } from "lucide-react";
import { addExpense } from "../utils/expenseStorage";

export default function AddExpensePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    category: "Infrastructure (Cloud/Server)",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    method: "Corporate Card",
    notes: ""
  });

  const handleBack = () => navigate("/opex-infrastructure");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addExpense({
      ...formData,
      amount: parseFloat(formData.amount) || 0,
      trend: "0%" // Default trend for new entries
    });
    navigate("/opex-infrastructure");
  };

  return (
    <div className="page-stack">
      <section className="dash-header-row">
        <div className="dash-heading-cluster">
          <button onClick={handleBack} className="icon-btn mr-2">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h4 className="dash-main-title">Add OpEx / Infrastructure Expense</h4>
            <p className="dash-date">Record a new operational cost or cloud bill</p>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto w-full">
        <div className="dash-card">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <Server size={14} /> Item Name
                </label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. AWS Cloud Hosting" 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <Layers size={14} /> Category
                </label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all bg-white"
                >
                  <option>Infrastructure (Cloud/Server)</option>
                  <option>Personnel (Salaries/Bonuses)</option>
                  <option>SaaS Tools / Licenses</option>
                  <option>Office & Utilities</option>
                  <option>Marketing & R&D</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <IndianRupee size={14} /> Amount
                </label>
                <input 
                  type="number" 
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  placeholder="0.00" 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-bold text-blue-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <Calendar size={14} /> Billing Date
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
                  <Tag size={14} /> Payment Method
                </label>
                <select 
                  name="method"
                  value={formData.method}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all bg-white"
                >
                  <option>Corporate Card</option>
                  <option>Bank Transfer</option>
                  <option>Cash</option>
                  <option>Credit</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Expense Description</label>
              <textarea 
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3" 
                placeholder="Add any specific details about this expense..."
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
                <Save size={18} /> Record Expense
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
