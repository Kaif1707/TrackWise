import { useEffect, useState } from "react";
import "./Settings.css";

export default function Settings() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [currency, setCurrency] = useState(localStorage.getItem("currency") || "USD");
  const [name, setName] = useState(localStorage.getItem("userName") || "Guest User");
  const [role, setRole] = useState(localStorage.getItem("userRole") || "Viewer");
  const [showConfirm, setShowConfirm] = useState(false);

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Save currency
  useEffect(() => {
    localStorage.setItem("currency", currency);
  }, [currency]);

  function saveProfile() {
    localStorage.setItem("userName", name);
    localStorage.setItem("userRole", role);
    alert("Profile updated!");
  }

  function resetPortfolio() {
    localStorage.removeItem("assets");
    setShowConfirm(false);
    alert("Portfolio cleared!");
    window.location.reload();
  }

  return (
    <div className="settings-page">
      <h1 className="set-title">Settings</h1>
      <p className="set-sub">Customize your TrackWise experience</p>

      <div className="set-grid">

        {/* THEME SETTING */}
        <div className="set-card glass">
          <h3>Theme</h3>
          <div className="theme-options">
            <button 
              className={theme === "dark" ? "active" : ""}
              onClick={() => setTheme("dark")}
            >
              Dark
            </button>

            <button 
              className={theme === "light" ? "active" : ""}
              onClick={() => setTheme("light")}
            >
              Light
            </button>
          </div>
        </div>

        {/* CURRENCY */}
        <div className="set-card glass">
          <h3>Currency</h3>

          <select 
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="USD">USD ($)</option>
            <option value="INR">INR (₹)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>

        {/* PROFILE */}
        <div className="set-card glass">
          <h3>Profile</h3>

          <input 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
          />

          <input 
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Your Role"
          />

          <button className="save-btn" onClick={saveProfile}>
            Save Profile
          </button>
        </div>

        {/* RESET PORTFOLIO */}
        <div className="set-card glass dangerous">
          <h3>Danger Zone</h3>
          <p className="danger-text">This will erase all your holdings permanently.</p>

          <button 
            className="reset-btn"
            onClick={() => setShowConfirm(true)}
          >
            Reset Portfolio
          </button>
        </div>

      </div>

      {showConfirm && (
        <div className="confirm-backdrop">
          <div className="confirm-box">
            <h2>Are you sure?</h2>
            <p>This action cannot be undone.</p>

            <div className="confirm-actions">
              <button
                className="cancel"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>

              <button
                className="delete"
                onClick={resetPortfolio}
              >
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
