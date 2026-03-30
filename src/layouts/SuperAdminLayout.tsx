import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  LayoutDashboard,
  Building2,
  CreditCard,
  LayoutTemplate,
  Activity,
  ArrowLeft,
  TrendingUp,
} from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import GlobalCommandPalette from "../components/intelligence/GlobalCommandPalette";

// 5 Unified Pillars
const PILLARS = [
  {
    id: "overview",
    name: "Command Center",
    icon: LayoutDashboard,
    path: "/admin/overview",
  },
  {
    id: "tenants",
    name: "Tenant Control",
    icon: Building2,
    path: "/admin/tenants",
  },
  {
    id: "revenue",
    name: "Revenue AI Analytics",
    icon: TrendingUp,
    path: "/admin/revenue",
  },
  {
    id: "monetization",
    name: "Monetization Hub",
    icon: CreditCard,
    path: "/admin/monetization",
  },
  {
    id: "ecosystem",
    name: "Ecosystem & Store",
    icon: LayoutTemplate,
    path: "/admin/ecosystem",
  },
  {
    id: "telemetry",
    name: "AI Usage",
    icon: Activity,
    path: "/admin/ai-usage",
  },
  {
    id: "health",
    name: "System Intelligence",
    icon: Shield,
    path: "/admin/health",
  },
];

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans selection:bg-indigo-500/30">
      {/* Refactored High-Clarity Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-72 bg-slate-900/50 backdrop-blur-xl border-r border-white/10 flex flex-col flex-shrink-0 z-20"
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white tracking-tight leading-tight">
                Bridgebox
              </h2>
              <div className="text-[10px] uppercase tracking-widest text-indigo-500 font-black">
                Super Admin
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-6 scrollbar-hide">
          <div>
            <div className="text-xs font-black text-slate-500 uppercase tracking-widest pl-3 mb-3">
              Core Infrastructure
            </div>
            <div className="space-y-1">
              {PILLARS.map((item) => {
                const Icon = item.icon;
                // Check if the current route explicitly starts with the nav path to maintain active state across deep drills
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
                      isActive
                        ? "text-white"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-admin-nav"
                        className="absolute inset-0 bg-indigo-500/10 border border-indigo-500/20 rounded-lg"
                      />
                    )}
                    <Icon
                      className={`w-5 h-5 z-10 transition-colors ${isActive ? "text-indigo-500" : "text-slate-500 group-hover:text-slate-300"}`}
                    />
                    <span className="z-10">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/10">
          <Button
            variant="ghost"
            onClick={() => navigate("/app")}
            className="w-full justify-center text-slate-400 hover:text-white group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />{" "}
            Exit to Client OS
          </Button>
        </div>
      </motion.aside>

      {/* Main Content Pane */}
      <main className="flex-1 max-h-screen overflow-y-auto bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat opacity-100 mix-blend-overlay pointer-events-none absolute inset-0 z-0" />
      <main className="flex-1 max-h-screen overflow-y-auto relative z-10">
        <div className="p-8 md:p-12">{children}</div>
      </main>
      <GlobalCommandPalette />
    </div>
  );
}
