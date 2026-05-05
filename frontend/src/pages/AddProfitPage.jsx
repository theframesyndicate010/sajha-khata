import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, X, PieChart, IndianRupee, Users, TrendingUp, Target, Plus, Trash2, User } from "lucide-react";
import { getProfits, recordDistributions } from "../utils/profitStorage";
import { getProjects } from "../utils/paymentStorage";
import { getExpenses } from "../utils/expenseStorage";

export default function AddProfitPage() {
  const navigate = useNavigate();
  const [profitData, setProfitData] = useState({ available: 0, distributions: [] });
  const [projects, setProjects] = useState([]);
  const [expenses, setExpenses] = useState([]);
  React.useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      try {
        const [profits, projectData, expenseData] = await Promise.all([
          getProfits(),
          getProjects(),
          getExpenses()
        ]);

        if (isActive) {
          setProfitData(profits);
          setProjects(projectData);
          setExpenses(expenseData);
        }
      } catch (error) {
        console.error("Failed to load profit data", error);
      }
    };

    loadData();

    return () => {
      isActive = false;
    };
  }, []);

  const totalRevenue = projects.reduce((sum, p) => {
    const paid = p.payments.reduce((pSum, pay) => pSum + (Number(pay.amount) || 0), 0);
    return sum + paid;
  }, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const availableProfit = totalRevenue - totalExpenses;
  
  const [payouts, setPayouts] = useState([
    { owner: "", amount: "", method: "Bank Transfer" }
  ]);

  const handleBack = () => navigate("/profit-dividends");

  const addPayoutRow = () => {
    setPayouts([...payouts, { owner: "", amount: "", method: "Bank Transfer" }]);
  };

  const removePayoutRow = (index) => {
    if (payouts.length > 1) {
      setPayouts(payouts.filter((_, i) => i !== index));
    }
  };

  const handlePayoutChange = (index, field, value) => {
    const nextPayouts = [...payouts];
    nextPayouts[index][field] = field === "amount" ? (value === "" ? "" : parseFloat(value)) : value;
    setPayouts(nextPayouts);
  };

  const totalDistributed = payouts.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const remaining = availableProfit - totalDistributed;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await recordDistributions(payouts);
      navigate("/profit-dividends");
    } catch (error) {
      console.error("Failed to record distributions", error);
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
            <h4 className="dash-main-title">Distribute Profits</h4>
            <p className="dash-date">Record payouts to owners and equity partners</p>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto w-full">
        <div className="dash-card">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-xl shadow-blue-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-xs font-bold text-blue-100 uppercase tracking-widest opacity-80">Available for Distribution</span>
                <div className="text-3xl font-black mt-1">Rs. {availableProfit.toLocaleString()}</div>
              </div>
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 text-right">
                <span className="text-[10px] font-bold uppercase opacity-80 block mb-1">Remaining Balance</span>
                <div className={`text-xl font-bold ${remaining < 0 ? 'text-red-300' : 'text-blue-100'}`}>
                  Rs. {remaining.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h6 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Users size={18} className="text-blue-600" />
                  Owner Payout Entries
                </h6>
                <button 
                  type="button" 
                  onClick={addPayoutRow}
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Plus size={14} /> Add Entry
                </button>
              </div>

              <div className="space-y-3">
                {payouts.map((p, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-gray-50/50 p-4 rounded-2xl border border-gray-100 group animate-in slide-in-from-top-2 duration-200">
                    <div className="md:col-span-1 text-xs font-bold text-gray-400 pb-3">
                      #{index + 1}
                    </div>
                    
                    <div className="md:col-span-4 space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Owner Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input 
                          type="text" 
                          placeholder="e.g. John Doe"
                          required
                          value={p.owner}
                          onChange={(e) => handlePayoutChange(index, "owner", e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-3 space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Amount</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">Rs.</span>
                        <input 
                          type="number" 
                          placeholder="0.00"
                          required
                          value={p.amount}
                          onChange={(e) => handlePayoutChange(index, "amount", e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-sm font-bold"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-3 space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Method</label>
                      <select 
                        value={p.method}
                        onChange={(e) => handlePayoutChange(index, "method", e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-sm bg-white"
                      >
                        <option>Bank Transfer</option>
                        <option>Cash</option>
                        <option>Check</option>
                        <option>Digital Wallet</option>
                      </select>
                    </div>

                    <div className="md:col-span-1 flex justify-end pb-1.5">
                      <button 
                        type="button" 
                        onClick={() => removePayoutRow(index)}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                        disabled={payouts.length === 1}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
              <button 
                type="button"
                onClick={handleBack}
                className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <X size={18} /> Cancel
              </button>
              <button 
                type="submit"
                disabled={remaining < 0}
                className="flex-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} /> Confirm Distribution
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

