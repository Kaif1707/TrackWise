import { useEffect, useState } from "react";
import "./Navbar.css";

export default function Navbar() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

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
