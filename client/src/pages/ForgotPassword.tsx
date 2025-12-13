import { useState } from "react";
import { Link } from "react-router-dom";
import "./Auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  function handleSend() {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!user || user.email !== email) {
      setMsg("No account found with this email.");
      return;
    }

    setMsg("Password reset link sent to your email!");
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">Password Reset</h2>

        {msg && <div className="auth-error">{msg}</div>}

        <input 
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className="auth-btn" onClick={handleSend}>
          Send Reset Link
        </button>

        <Link to="/login" className="auth-link">Back to Login</Link>
      </div>
    </div>
  );
}
