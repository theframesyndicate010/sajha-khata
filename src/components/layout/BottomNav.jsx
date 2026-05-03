import React from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  ArrowDownLeft, 
  ArrowUpRight, 
  PieChart 
} from "lucide-react";

const navItems = [
  { label: "Dash", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Payments", icon: ArrowDownLeft, to: "/project-payments" },
  { label: "OpEx", icon: ArrowUpRight, to: "/opex-infrastructure" },
  { label: "Profit", icon: PieChart, to: "/profit-dividends" },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink 
            key={item.to}
            to={item.to} 
            className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}
          >
            <Icon size={20} />
            <span className="bottom-nav-label">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
