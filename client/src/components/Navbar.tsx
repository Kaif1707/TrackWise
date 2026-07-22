import React from "react";
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
    <nav className="tw-navbar">
      <div className="nav-left">TrackWise</div>

      <div className="nav-right">
        {user && (
          <div className="nav-profile">
            <div className="nav-avatar">{initials}</div>

            <div className="nav-user-text">
              <div className="nav-name">{user.name}</div>
              <div className="nav-email">{user.email}</div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
