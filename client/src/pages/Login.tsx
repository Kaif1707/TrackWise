import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!email || !password) {
      setErr("Please enter both email and password.");
      return;
    }

    setSubmitting(true);
    try {
      await login({ email, password });
      navigate("/", { replace: true });
    } catch (error: any) {
      setErr(error.response?.data?.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header-brand">
          <div className="auth-brand-logo">TW</div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to manage your multi-asset portfolio</p>
        </div>

        {err && (
          <div className="auth-error">
            <AlertCircle size={16} />
            <span>{err}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                placeholder="name@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                required
              />
            </div>
          </div>

          <button className="auth-btn" type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign In to Dashboard"}
          </button>
        </form>

        <div className="auth-links-row">
          <Link to="/signup" className="auth-link">Create an Account</Link>
          <Link to="/forgot-password" className="auth-link">Forgot Password?</Link>
        </div>
      </div>
    </div>
  );
}
