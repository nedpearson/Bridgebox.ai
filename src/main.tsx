import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";
import { Toaster } from "react-hot-toast";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import { initAnalytics } from "./lib/analytics";

// Initialize non-blocking tracking (Phase 10)
if (import.meta.env.PROD) {
  initAnalytics();
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "#1e293b", // slate-800
            color: "#fff",
            borderRadius: "12px",
            border: "1px solid #334155", // slate-700
            boxShadow: "0 4px 20px -2px rgba(0,0,0,0.4)",
            fontSize: "14px",
            fontWeight: 500,
          },
          success: {
            iconTheme: { primary: "#10B981", secondary: "#fff" },
          },
          error: {
            iconTheme: { primary: "#EF4444", secondary: "#fff" },
          },
        }}
      />
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </GlobalErrorBoundary>
  </StrictMode>,
);
