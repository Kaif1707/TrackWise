import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./Auth.css";
import Toast from "../components/Toast";

export default function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  function showToast(msg: string, type: "success" | "error" | "warning" = "success") {
    setToast({ msg, type });
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast("All fields are required", "error");
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      showToast("Invalid email format", "error");
      return;
    }

    if (password.length < 6) {
      showToast("Password must be at least 6 characters long", "error");
      return;
    }

    setSubmitting(true);
    try {
      await register({ name, email, password });
      showToast("Account created successfully!", "success");
      setTimeout(() => navigate("/", { replace: true }), 800);
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Registration failed. Please try again.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">Create Account</h2>

        {toast && (
          <Toast
            message={toast.msg}
            type={toast.type as any}
            onClose={() => setToast(null)}
          />
        )}

        <form onSubmit={handleSignup}>
          <input
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
            required
          />

          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
            required
          />

          <input
            placeholder="Password (min 6 characters)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
            required
          />

          <button className="auth-btn" type="submit" disabled={submitting}>
            {submitting ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <Link to="/login" className="auth-link">
          Already have an account?
        </Link>
      </div>
    </div>
  );
}
