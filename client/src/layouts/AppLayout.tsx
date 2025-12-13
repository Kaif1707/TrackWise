import { Outlet, useLocation } from "react-router-dom";
import SidebarDesktop from "../components/SidebarDesktop";
import Navbar from "../components/Navbar";
import "./AppLayout.css";

export default function AppLayout() {
  const { pathname } = useLocation();

  // Hide layout on auth pages
  const hideLayout =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot";

  if (hideLayout) return <Outlet />;

  return (
    <div className="tw-app-layout">
      <SidebarDesktop />
      <div className="tw-main-content">
        <Navbar />
        <Outlet />
      </div>
    </div>
  );
}
