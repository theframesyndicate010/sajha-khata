import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import BottomNav from "./BottomNav";

export default function AppShell() {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="app-shell">
      <Sidebar isExpanded={isExpanded} />

      <main className="main-content">
        <Header onToggleSidebar={toggleSidebar} />

        <section className="dashboard-scroll">
          <Outlet />
        </section>

        <BottomNav />
      </main>
    </div>
  );
}
