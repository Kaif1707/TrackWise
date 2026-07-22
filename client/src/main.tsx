import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AssetProvider } from "./context/AssetContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AssetProvider>
          <App />
        </AssetProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
