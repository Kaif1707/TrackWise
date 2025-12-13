import { Routes, Route, useLocation } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";

// Pages
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

// Auth Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";

// Components
import ProtectedRoute from "./utils/ProtectedRoute";
import Navbar from "./components/Navbar";
import SidebarDesktop from "./components/SidebarDesktop";

import "./layouts/AppLayout.css";

export default function App() {
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/forgot-password";

  return (
    <>
      {/* Show navbar + sidebar ONLY if not on auth page */}
      {!isAuthPage && <Navbar />}
      {!isAuthPage && <SidebarDesktop />}

      {/* Layout Wrapper */}
      <div className="tw-layout-content">
        <main className={!isAuthPage ? "tw-main-content" : "auth-fullscreen"}>
          <Routes>
            {/* AUTH ROUTES */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* PROTECTED ROUTES */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />

            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </>
  );
}
