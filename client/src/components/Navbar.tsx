import React from "react";
import { Search } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import "./Navbar.css";

export default function Navbar() {
  const { user } = useAuth();

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0].toUpperCase())
      .join("") || "U";

  return (
    <header className="tw-navbar">
      <div className="nav-left-group">
        <div className="nav-app-title">TrackWise</div>
        <div className="market-status-pill">
          <span className="status-dot"></span>
          <span>Markets Active</span>
        </div>
      </div>

      <div className="nav-right-group">
        <div className="nav-search-bar" title="Global Asset Search">
          <Search size={16} />
          <span>Search holdings...</span>
          <span className="nav-shortcut-badge">⌘K</span>
        </div>

        {user && (
          <div className="nav-profile-card">
            <div className="nav-avatar">{initials}</div>
            <div className="nav-user-text">
              <span className="nav-name">{user.name}</span>
              <span className="nav-email">{user.email}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
