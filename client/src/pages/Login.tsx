import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  function handleLogin() {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!user) {
      setErr("No account found. Please sign up.");
      return;
    }

    if (user.email !== email || user.password !== password) {
      setErr("Invalid email or password.");
      return;
    }

    localStorage.setItem("auth", "true");
    nav("/");
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">Welcome Back</h2>

        {err && <div className="auth-error">{err}</div>}

        <input 
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input 
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="auth-btn" onClick={handleLogin}>
          Login
        </button>

        <Link to="/forgot" className="auth-link">Forgot Password?</Link>
        <Link to="/signup" className="auth-link">Create Account</Link>
      </div>
    </div>
  );
}
