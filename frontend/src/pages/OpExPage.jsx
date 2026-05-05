import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Plus, Cloud, Users, CreditCard, Server, TrendingUp } from "lucide-react";
import { getExpenses, addExpense } from "../utils/expenseStorage";

export default function OpExPage() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = React.useState([]);

  React.useEffect(() => {
    let isActive = true;

    const loadExpenses = async () => {
      try {
        const data = await getExpenses();
        if (isActive) {
          setExpenses(data);
        }
      } catch (error) {
        console.error("Failed to load expenses", error);
      }
    };

    loadExpenses();

    return () => {
      isActive = false;
    };
  }, []);

  const handleAdd = () => navigate("/opex-infrastructure/add");

  return (
    <div className="page-stack">
      <section className="dash-header-row">
        <div className="dash-heading-cluster">
          <div className="dash-icon-box bg-blue-icon">
            <ArrowUpRight size={24} />
          </div>
          <div>
            <h4 className="dash-main-title">OpEx / Infrastructure</h4>
            <p className="dash-date">Monitor operational spending and cloud costs</p>
          </div>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add Expense
        </button>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="dash-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Cloud size={20} />
            </div>
            <span className="text-sm font-bold text-gray-500">Cloud Hosting</span>
          </div>
          <div className="text-2xl font-black">Rs. 42,000</div>
          <p className="text-xs text-gray-400 mt-1">Total AWS/Azure bill this month</p>
        </div>

        <div className="dash-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <Users size={20} />
            </div>
            <span className="text-sm font-bold text-gray-500">Personnel</span>
          </div>
          <div className="text-2xl font-black">Rs. 1,85,000</div>
          <p className="text-xs text-gray-400 mt-1">Engineering and support salaries</p>
        </div>

        <div className="dash-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <CreditCard size={20} />
            </div>
            <span className="text-sm font-bold text-gray-500">SaaS Tools</span>
          </div>
          <div className="text-2xl font-black">Rs. 22,500</div>
          <p className="text-xs text-gray-400 mt-1">Licenses for dev & PM tools</p>
        </div>
      </div>

      <div className="dash-card mt-6">
        <h6 className="font-bold mb-4">Expense Log</h6>
        <div className="space-y-4">
          {expenses.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-400">
                  <Server size={18} />
                </div>
                <div>
                  <div className="font-bold text-sm">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.category} • {item.date}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-black text-red-600">Rs. {item.amount.toLocaleString()}</div>
                <div className="text-[10px] text-red-500 font-bold flex items-center gap-1 justify-end">
                  <TrendingUp size={10} /> {item.trend}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
