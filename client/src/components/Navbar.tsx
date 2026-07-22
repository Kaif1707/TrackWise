import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import GlobalSearchModal from "./GlobalSearchModal";
import ModalPortal from "./ModalPortal";
import "./Navbar.css";

export default function Navbar() {
  const { user } = useAuth();
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowSearch((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0].toUpperCase())
      .join("") || "U";

  return (
    <>
      <header className="tw-navbar">
        <div className="nav-left-group">
          <div className="nav-app-title">TrackWise</div>
          <div className="market-status-pill">
            <span className="status-dot"></span>
            <span>Markets Active</span>
          </div>
        </div>

        <div className="nav-right-group">
          <div
            className="nav-search-bar"
            onClick={() => setShowSearch(true)}
            title="Global Asset Search (Ctrl+K)"
          >
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

      {showSearch && (
        <ModalPortal>
          <GlobalSearchModal close={() => setShowSearch(false)} />
        </ModalPortal>
      )}
    </>
  );
}
