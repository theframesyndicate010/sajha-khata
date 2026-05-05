import { useNavigate } from "react-router-dom";
import { Menu, Search, Bell, User } from "lucide-react";
import { getCurrentUser, logout } from "../../utils/auth";

export default function Header({ onToggleSidebar }) {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="topbar">
      <div className="header-left">
        <button className="icon-btn sidebar-toggle" onClick={onToggleSidebar}>
          <Menu size={20} />
        </button>
      </div>

      <div className="mobile-brand">
        <h1 className="text-lg font-bold text-blue-900">Software Khata</h1>
      </div>

      <div className="header-tabs">
        <button className="nav-tab active-tab">Main Dashboard</button>
        <button className="nav-tab">Reports</button>
        <button className="nav-tab">History</button>
      </div>

      <div className="header-actions">
        <button className="icon-btn muted">
          <Search size={18} />
        </button>
        <button className="icon-btn muted">
          <Bell size={18} />
        </button>
        <div className="profile-wrap flex items-center gap-3 ml-2 pl-4 border-l border-gray-100">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider leading-none mb-1">{user?.role}</p>
            <p className="text-xs font-bold text-gray-900 leading-none">{user?.name}</p>
          </div>
          <button onClick={handleLogout} className="profile-trigger flex items-center justify-center font-bold text-white shadow-md shadow-blue-900/10 hover:scale-105 transition-all" style={{ backgroundColor: user?.color?.replace('bg-', '') || '#2563eb' }}>
            {user?.avatar || <User size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
