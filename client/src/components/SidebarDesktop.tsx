import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  BarChart3,
  PieChart,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import "./SidebarDesktop.css";

export default function SidebarDesktop() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // true = collapsed (thin)
  const [collapsed, setCollapsed] = useState<boolean>(true);

  // Sync class on <html> for global sidebar state
  useEffect(() => {
    const html = document.documentElement;

    if (collapsed) {
      html.classList.add("tw-sidebar-collapsed");
      html.classList.remove("tw-sidebar-open");
    } else {
      html.classList.add("tw-sidebar-open");
      html.classList.remove("tw-sidebar-collapsed");
    }

    return () => {
      html.classList.remove("tw-sidebar-open");
      html.classList.remove("tw-sidebar-collapsed");
    };
  }, [collapsed]);

  // Sync body spacing for Navbar shift
  useEffect(() => {
    if (collapsed) {
      document.body.classList.remove("sidebar-expanded");
    } else {
      document.body.classList.add("sidebar-expanded");
    }
  }, [collapsed]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={`tw-sidebar-desktop ${
        collapsed ? "collapsed sidebar-collapsed" : "expanded sidebar-expanded"
      }`}
      aria-hidden={false}
      aria-expanded={!collapsed}
      role="navigation"
    >
      {/* CLICK TO TOGGLE SIDEBAR */}
      <div
        className="sidebar-brand"
        onClick={() => setCollapsed((s) => !s)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setCollapsed((s) => !s);
        }}
      >
        <div className="brand-mark">TW</div>
        <div className="brand-text">TrackWise</div>
      </div>

      {/* NAVIGATION */}
      <nav className="sidebar-nav" aria-label="Main navigation">
        <Link to="/" className={`sb-item ${pathname === "/" ? "active" : ""}`}>
          <LayoutDashboard size={18} />
          <span className="sb-text">Dashboard</span>
        </Link>

        <Link
          to="/reports"
          className={`sb-item ${pathname === "/reports" ? "active" : ""}`}
        >
          <BarChart3 size={18} />
          <span className="sb-text">Reports</span>
        </Link>

        <Link
          to="/analytics"
          className={`sb-item ${pathname === "/analytics" ? "active" : ""}`}
        >
          <PieChart size={18} />
          <span className="sb-text">Analytics</span>
        </Link>

        <Link
          to="/settings"
          className={`sb-item ${pathname === "/settings" ? "active" : ""}`}
        >
          <Settings size={18} />
          <span className="sb-text">Settings</span>
        </Link>
      </nav>

      {/* FOOTER PROFILE */}
      <div className="sidebar-footer">
        <div className="profile">
          <div className="avatar">
            <User size={18} />
          </div>

          <div className="meta">
            <div className="name">{user?.name || "User"}</div>
          </div>
        </div>

        <button className="sb-logout" onClick={handleLogout}>
          <LogOut size={16} />
          <span className="sb-text">Logout</span>
        </button>
      </div>
    </aside>
  );
}
