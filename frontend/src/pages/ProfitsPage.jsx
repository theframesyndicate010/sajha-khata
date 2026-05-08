import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, TrendingUp, Users, Zap, LifeBuoy, ArrowRight, Download, Calendar, CreditCard } from "lucide-react";
import { getProfits } from "../utils/profitStorage";
import { getProjects } from "../utils/paymentStorage";
import { getExpenses } from "../utils/expenseStorage";

export default function ProfitsPage() {
  const navigate = useNavigate();
  const [profitData, setProfitData] = useState({ available: 0, distributions: [] });
  const [projects, setProjects] = useState([]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
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

  const handleAdd = () => navigate("/profit-dividends/add");

  const totalRevenue = projects.reduce((sum, p) => {
    const paid = p.payments.reduce((pSum, pay) => pSum + (Number(pay.amount) || 0), 0);
    return sum + paid;
  }, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const availableProfit = totalRevenue - totalExpenses;
  
  const totalDistributed = profitData.distributions.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const remaining = availableProfit - totalDistributed;

  return (
    <div className="page-stack">
      <section className="dash-header-row">
        <div className="dash-heading-cluster">
          <div className="dash-icon-box bg-blue-icon">
            <PieChart size={24} />
          </div>
          <div>
            <h4 className="dash-main-title">Profit & Dividends</h4>
            <p className="dash-date">Analyze net earnings and distribute profits</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-50">
            <Download size={16} />
            Export Report
          </button>
          <button onClick={handleAdd} className="btn-primary">Distribute Profits</button>
        </div>
      </section>

      <div className="max-w-4xl mx-auto w-full space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="dash-card bg-blue-600 text-white p-4">
            <span className="text-[10px] font-bold uppercase text-green-600">Net Profit Pool</span>
            <div className="text-xl font-black text-green-700">Rs. {availableProfit.toLocaleString()}</div>
          </div>
          <div className="dash-card border-green-100 bg-green-50/50 p-4">
            <span className="text-[10px] font-bold uppercase text-green-600">Total Distributed</span>
            <div className="text-xl font-black text-green-700">Rs. {totalDistributed.toLocaleString()}</div>
          </div>
          <div className="dash-card border-blue-100 bg-blue-50/50 p-4">
            <span className="text-[10px] font-bold uppercase text-blue-600">Remaining Balance</span>
            <div className="text-xl font-black text-blue-700">Rs. {remaining.toLocaleString()}</div>
          </div>
        </div>

        <div className="dash-card">
          <div className="flex justify-between items-center mb-6">
            <h6 className="font-bold flex items-center gap-2">
              <Users size={18} className="text-blue-600" />
              Partner Payout History
            </h6>
            <span className="text-xs font-bold text-gray-400 uppercase">{profitData.distributions.length} Recorded Entries</span>
          </div>
          <div className="space-y-4">
            {profitData.distributions.length === 0 ? (
              <div className="py-12 text-center text-gray-400 italic">No payouts recorded yet.</div>
            ) : (
              profitData.distributions.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-600 font-bold text-sm">
                      {item.owner[0]}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-gray-800">{item.owner}</div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold">
                        <Calendar size={10} /> {item.date} • <CreditCard size={10} /> {item.method}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-blue-600">Rs. {item.amount.toLocaleString()}</div>
                    <div className="text-[10px] text-green-600 font-bold uppercase tracking-widest mt-0.5">Paid</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
