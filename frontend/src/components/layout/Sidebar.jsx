import { useNavigate, NavLink } from "react-router-dom";
import { logout } from "../../utils/auth";
import { 
  LayoutDashboard, 
  Terminal, 
  ArrowDownLeft, 
  ArrowUpRight, 
  PieChart, 
  LogOut 
} from "lucide-react";

const sidebarNavigation = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Project Payments", icon: ArrowDownLeft, to: "/project-payments" },
  { label: "OpEx / Infrastructure", icon: ArrowUpRight, to: "/opex-infrastructure" },
  { label: "Profit & Dividends", icon: PieChart, to: "/profit-dividends" },
];

export default function Sidebar({ isExpanded }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className={`sidebar ${isExpanded ? "expanded" : ""}`}>
      <div className="sidebar-brand">
        <div className="brand-box">
          <Terminal size={24} />
        </div>
        <h4 className="nav-text">Software Khata</h4>
      </div>

      <ul className="sidebar-menu">
        {sidebarNavigation.map((item) => {
          const Icon = item.icon;
          return (
            <li className="nav-item" key={item.to}>
              <NavLink 
                to={item.to} 
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                <Icon size={18} strokeWidth={2.2} />
                <span className="nav-text">{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="nav-link nav-link-btn" type="button">
          <LogOut size={18} strokeWidth={2.2} />
          <span className="nav-text">Logout</span>
        </button>
      </div>
    </aside>
  );
}
