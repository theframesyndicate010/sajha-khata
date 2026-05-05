import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  IndianRupee, 
  TrendingUp, 
  Server, 
  Code2, 
  Globe, 
  Cloud, 
  LifeBuoy,
  Terminal,
  Cpu,
  Zap,
  Users,
  PieChart,
  ShieldCheck,
  Plus
} from "lucide-react";
import { getProjects } from "../utils/paymentStorage";
import { getExpenses } from "../utils/expenseStorage";
import { getProfits } from "../utils/profitStorage";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [profits, setProfits] = useState({ available: 0, distributions: [] });

  useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      try {
        const [projectsData, expensesData, profitsData] = await Promise.all([
          getProjects(),
          getExpenses(),
          getProfits()
        ]);

        if (isActive) {
          setProjects(projectsData);
          setExpenses(expensesData);
          setProfits(profitsData);
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
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
  
  // Available Profit is calculated as Net Revenue (Revenue - Expenses)
  const availableProfit = totalRevenue - totalExpenses;
  const totalDistributed = profits.distributions.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const remainingProfit = availableProfit - totalDistributed;

  const handleNewEntry = () => navigate("/project-payments/add");

  const revenueData = [
    { label: "Total Revenue", amount: totalRevenue, icon: IndianRupee, toneClass: "bg-green-icon" },
    { label: "Total Expenses", amount: totalExpenses, icon: Server, toneClass: "bg-red-icon" },
    { label: "Distributed", amount: totalDistributed, icon: Users, toneClass: "bg-blue-icon" },
    { label: "Remaining Profit", amount: remainingProfit, icon: PieChart, toneClass: "bg-orange-icon" },
  ];

  return (
    <div className="page-stack software-dashboard-page">
      <section className="dash-header-row">
        <div className="dash-heading-cluster">
          <div className="dash-icon-box bg-blue-icon">
            <Terminal size={24} />
          </div>
          <div>
            <h4 className="dash-main-title">Software Engineering Hub</h4>
            <p className="dash-date">Business Intelligence Dashboard</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => navigate("/opex-infrastructure/add")} className="btn-secondary flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all">
            <Server size={16} />
            Log Expense
          </button>
          <button onClick={() => navigate("/project-payments/add")} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Record Project
          </button>
        </div>

        <div className="dash-stat-group">
          <article className="dash-stat-badge bg-navy">
            <div className="dash-stat-copy">
              <span className="dash-stat-label">Total Cash Inflow</span>
              <span className="dash-stat-value">Rs. {totalRevenue.toLocaleString()}</span>
            </div>
            <div className="dash-stat-icon">
              <TrendingUp size={16} />
            </div>
          </article>

          <article className="dash-stat-badge bg-navy">
            <div className="dash-stat-copy">
              <span className="dash-stat-label">Distributed Profits</span>
              <span className="dash-stat-value">Rs. {totalDistributed.toLocaleString()}</span>
            </div>
            <div className="dash-stat-icon">
              <Users size={16} />
            </div>
          </article>

          <article className="dash-stat-badge bg-navy">
            <div className="dash-stat-copy">
              <span className="dash-stat-label">Operating Expenses</span>
              <span className="dash-stat-value text-red-400">Rs. {totalExpenses.toLocaleString()}</span>
            </div>
            <div className="dash-stat-icon">
              <Server size={16} />
            </div>
          </article>
        </div>
      </section>

      <section className="cafe-payment-grid">
        {revenueData.map((card) => {
          const Icon = card.icon;
          return (
            <article className="payment-card" key={card.label}>
              <div className={`payment-icon ${card.toneClass}`}>
                <Icon size={20} />
              </div>
              <h6 className="payment-label">{card.label}</h6>
              <h5 className="payment-amount">Rs. {card.amount.toLocaleString()}</h5>
            </article>
          );
        })}
      </section>

      <section className="cafe-main-grid">
        <article className="dash-card quick-stats-card">
          <div className="quick-stat-item">
            <div className="quick-stat-icon tone-success">
              <Code2 size={18} />
            </div>
            <div>
              <p className="quick-stat-label">Active Projects</p>
              <h5 className="quick-stat-value">{projects.length} Delivery Streams</h5>
            </div>
          </div>

          <div className="quick-stat-item">
            <div className="quick-stat-icon tone-primary">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="quick-stat-label">System Uptime</p>
              <h5 className="quick-stat-value">99.98% Healthy</h5>
            </div>
          </div>

          <div className="quick-stat-item">
            <div className="quick-stat-icon tone-warning">
              <Cpu size={18} />
            </div>
            <div>
              <p className="quick-stat-label">Cloud Infrastructure</p>
              <h5 className="quick-stat-value">32 AWS Instances</h5>
            </div>
          </div>
        </article>

        <article className="dash-card">
          <h6 className="chart-title">
            <Zap size={16} />
            <span>Recent Project Payments</span>
          </h6>
          <div className="space-y-3 mt-4">
            {projects.length > 0 ? (
              projects.slice(0, 3).map((item, i) => {
                const latestPayment = item.payments[item.payments.length - 1];
                return (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="font-semibold text-sm truncate max-w-[150px]">{item.project}</span>
                    <div className="text-right">
                      <div className="font-bold text-sm">Rs. {latestPayment?.amount.toLocaleString()}</div>
                      <span className={`text-[10px] font-bold ${item.status === 'Paid' ? 'text-green-600' : 'text-blue-600'}`}>{item.status}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-400 italic py-4 text-center">No project payments yet</p>
            )}
          </div>
        </article>

        <article className="dash-card">
          <h6 className="chart-title">
            <Server size={16} />
            <span>Recent OpEx & Infrastructure</span>
          </h6>
          <div className="space-y-3 mt-4">
            {expenses.length > 0 ? (
              expenses.slice(0, 3).map((item, i) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="font-semibold text-sm truncate max-w-[150px]">{item.name}</span>
                  <div className="font-bold text-sm text-red-600">Rs. {item.amount.toLocaleString()}</div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 italic py-4 text-center">No expenses recorded yet</p>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
