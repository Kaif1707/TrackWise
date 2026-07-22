import React, { useState } from "react";
import { useTheme } from "../hooks/useTheme";
import { useCurrency, CURRENCIES, CurrencyCode } from "../hooks/useCurrency";
import { useAuth } from "../hooks/useAuth";
import { useAssets } from "../hooks/useAssets";
import { Moon, Sun, DollarSign, User, Shield, AlertTriangle, Check, Trash2 } from "lucide-react";
import Toast from "../components/Toast";
import "./Settings.css";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { currency, setCurrency, formatAmount } = useCurrency();
  const { user } = useAuth();
  const { assets } = useAssets();

  const [userName, setUserName] = useState(user?.name || "Portfolio Owner");
  const [userRole, setUserRole] = useState("Lead Investor");
  const [targetGoal, setTargetGoal] = useState<number>(() => {
    const saved = localStorage.getItem("trackwise_target_goal");
    return saved ? Number(saved) : 100000;
  });

  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    localStorage.setItem("trackwise_userName", userName);
    localStorage.setItem("trackwise_userRole", userRole);
    localStorage.setItem("trackwise_target_goal", targetGoal.toString());
    setToast({ msg: "Profile preferences & portfolio goals saved successfully!", type: "success" });
  }

  function handleResetPortfolio() {
    localStorage.removeItem("trackwise_assets");
    setShowConfirm(false);
    setToast({ msg: "Portfolio holdings reset successfully.", type: "success" });
    setTimeout(() => {
      window.location.reload();
    }, 800);
  }

  return (
    <section className="settings-page">
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="settings-header">
        <h1 className="set-title">Platform Preferences & Settings</h1>
        <p className="set-sub">Manage your account profile, regional currency, theme, and portfolio rules</p>
      </div>

      <div className="set-grid">
        {/* APPEARANCE & THEME */}
        <div className="set-card glass-card">
          <div className="card-header">
            <div className="card-header-icon"><Moon size={20} /></div>
            <div>
              <h3>Appearance Theme</h3>
              <p className="card-desc">Choose your visual theme interface</p>
            </div>
          </div>

          <div className="theme-toggle-grid">
            <button
              type="button"
              className={`theme-option-btn ${theme === "dark" ? "active" : ""}`}
              onClick={() => setTheme("dark")}
            >
              <Moon size={18} />
              <span>Dark Obsidian</span>
              {theme === "dark" && <Check size={16} className="check-icon" />}
            </button>

            <button
              type="button"
              className={`theme-option-btn ${theme === "light" ? "active" : ""}`}
              onClick={() => setTheme("light")}
            >
              <Sun size={18} />
              <span>Light Slate</span>
              {theme === "light" && <Check size={16} className="check-icon" />}
            </button>
          </div>
        </div>

        {/* REGIONAL CURRENCY */}
        <div className="set-card glass-card">
          <div className="card-header">
            <div className="card-header-icon"><DollarSign size={20} /></div>
            <div>
              <h3>Global Display Currency</h3>
              <p className="card-desc">Converts asset prices & metrics across the website</p>
            </div>
          </div>

          <div className="currency-selector-wrapper">
            <select
              className="styled-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            >
              {Object.values(CURRENCIES).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
            <p className="currency-info-text">
              Current Base Conversion Rate: 1 USD = {CURRENCIES[currency].rate} {currency}
            </p>
          </div>
        </div>

        {/* USER PROFILE & GOALS */}
        <div className="set-card glass-card full-width">
          <div className="card-header">
            <div className="card-header-icon"><User size={20} /></div>
            <div>
              <h3>Account Profile & Portfolio Target</h3>
              <p className="card-desc">Verify your authentication credentials and goal milestones</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="profile-form-grid">
            <div className="input-field">
              <label>Full Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="input-field">
              <label>Registered Email Address</label>
              <input
                type="email"
                value={user?.email || "guest@trackwise.io"}
                disabled
                className="disabled-input"
              />
              <span className="field-hint">Authenticated via JWT Token</span>
            </div>

            <div className="input-field">
              <label>Portfolio Designation / Role</label>
              <input
                type="text"
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                placeholder="e.g. Senior Wealth Manager"
              />
            </div>

            <div className="input-field">
              <label>Target Portfolio Value Milestone ({CURRENCIES[currency].symbol})</label>
              <input
                type="number"
                value={targetGoal}
                onChange={(e) => setTargetGoal(Number(e.target.value))}
                placeholder="100000"
                min="0"
              />
              <span className="field-hint">Target: {formatAmount(targetGoal)}</span>
            </div>

            <div className="form-submit-wrapper">
              <button type="submit" className="save-btn">
                Save Preferences
              </button>
            </div>
          </form>
        </div>

        {/* DANGER ZONE */}
        <div className="set-card glass-card danger-zone-card full-width">
          <div className="card-header">
            <div className="card-header-icon danger-icon"><AlertTriangle size={20} /></div>
            <div>
              <h3 className="danger-title">Danger Zone</h3>
              <p className="card-desc">Irreversible portfolio administration options</p>
            </div>
          </div>

          <div className="danger-content-row">
            <div>
              <h4>Reset Portfolio Holdings</h4>
              <p className="danger-text">
                Permanently purge all tracked assets, historical trend snapshots, and transactions.
              </p>
            </div>
            <button
              type="button"
              className="reset-btn"
              onClick={() => setShowConfirm(true)}
            >
              <Trash2 size={16} />
              <span>Reset Portfolio</span>
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirm && (
        <div className="confirm-backdrop" onClick={(e) => e.target === e.currentTarget && setShowConfirm(false)}>
          <div className="confirm-box">
            <div className="confirm-header">
              <AlertTriangle size={24} className="danger-icon" />
              <h2>Reset Portfolio Data?</h2>
            </div>
            <p>This action will erase all holdings ({assets.length} assets) permanently. Are you sure you want to proceed?</p>

            <div className="confirm-actions">
              <button
                type="button"
                className="cancel"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="delete"
                onClick={handleResetPortfolio}
              >
                Yes, Purge Holdings
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
