import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";
import Toast from "../components/Toast";

export default function Signup() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  function showToast(msg: string, type: "success" | "error" | "warning" = "success") {
    setToast({ msg, type });
  }

  function handleSignup() {
    if (!name || !email || !password) {
      showToast("All fields are required", "error");
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      showToast("Invalid email format", "error");
      return;
    }

    const passRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passRegex.test(password)) {
      showToast("Weak password. Use A-Z, a-z, numbers & symbol.", "error");
      return;
    }

    const user = { email, password, name };
    localStorage.setItem("user", JSON.stringify(user));

    showToast("Account created successfully!", "success");

    setTimeout(() => nav("/login"), 1200);
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

        <input
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

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

        <button className="auth-btn" onClick={handleSignup}>
          Sign Up
        </button>

        <Link to="/login" className="auth-link">
          Already have an account?
        </Link>
      </div>
    </div>
  );
}
