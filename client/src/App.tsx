import React, { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// Layouts & Global Components
import ProtectedRoute from "./utils/ProtectedRoute";
import Navbar from "./components/Navbar";
import SidebarDesktop from "./components/SidebarDesktop";
import RouteLoader from "./components/RouteLoader";

import "./layouts/AppLayout.css";

// Lazy-loaded Pages (Code Splitting)
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Reports = lazy(() => import("./pages/Reports"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Settings = lazy(() => import("./pages/Settings"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));

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
          <Suspense fallback={<RouteLoader />}>
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
          </Suspense>
        </main>
      </div>
    </>
  );
}
