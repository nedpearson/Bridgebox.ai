import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  Network,
  Settings,
  Users,
  LogOut,
  Box,
  Rocket,
  BarChart3,
  Zap,
  Sparkles,
  X,
  Smartphone,
  LayoutTemplate,
  Target,
  FileText,
  Store,
  Bot,
  Inbox,
  Wand2,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { useMobileNav } from "../../contexts/MobileNavContext";
import { permissions } from "../../lib/permissions";

interface NavItem {
  icon: typeof LayoutDashboard;
  label: string;
  path: string;
  requirePermission?: (ctx: any) => boolean;
}

export default function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { can, signOut, profile, currentOrganization } = useAuth();
  const { isOpen, setIsOpen } = useMobileNav();
  const [pendingActions, setPendingActions] = useState(0);

  useEffect(() => {
    if (!currentOrganization) return;
    const loadBadge = async () => {
      const { count } = await supabase
        .from("bb_agent_actions_queue")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", currentOrganization.id)
        .eq("status", "pending");
      setPendingActions(count || 0);
    };
    loadBadge();

    // Setup realtime subscription
    const sub = supabase
      .channel("agent_queue_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bb_agent_actions_queue",
          filter: `organization_id=eq.${currentOrganization.id}`,
        },
        () => {
          loadBadge();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, [currentOrganization]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Phase 2 Redesign: Exact Enforcement
  const topNav: NavItem[] = [
    {
      icon: LayoutDashboard,
      label: "Home",
      path: "/app",
      requirePermission: permissions.canAccessAdminPanel,
    },
    {
      icon: FolderKanban,
      label: "Work",
      path: "/app/projects",
      requirePermission: permissions.canAccessAdminPanel,
    },
    {
      icon: Users,
      label: "Customers / Clients",
      path: "/app/clients",
      requirePermission: permissions.canManageClients,
    },
    {
      icon: Rocket,
      label: "Operations",
      path: "/app/delivery",
      requirePermission: permissions.canAccessAdminPanel,
    },
    {
      icon: LayoutTemplate,
      label: "Templates",
      path: "/app/marketplace",
      requirePermission: permissions.canAccessAdminPanel,
    },
    {
      icon: Zap,
      label: "Automations",
      path: "/app/automations",
      requirePermission: permissions.canAccessAdminPanel,
    },
    {
      icon: Network,
      label: "Integrations",
      path: "/app/integrations",
      requirePermission: permissions.canAccessAdminPanel,
    },
    {
      icon: Sparkles,
      label: "AI Center",
      path: "/app/ai-assistants",
      requirePermission: permissions.canAccessAdminPanel,
    },
    {
      icon: Wand2,
      label: "Enhancement Studio",
      path: "/app/enhancements",
      requirePermission: permissions.canAccessAdminPanel,
    },
    {
      icon: BarChart3,
      label: "Reporting",
      path: "/app/analytics",
      requirePermission: permissions.canAccessAdminPanel,
    },
    {
      icon: Smartphone,
      label: "Mobile",
      path: "/app/mobile",
      requirePermission: permissions.canAccessAdminPanel,
    },
    {
      icon: Settings,
      label: "Admin",
      path: "/app/settings",
      requirePermission: permissions.canAccessAdminPanel,
    },
  ];

  const filterItems = (items: NavItem[]) => {
    return items.filter(
      (item) => !item.requirePermission || can(item.requirePermission),
    );
  };

  const isActive = (path: string) => {
    if (path === "/app") {
      return location.pathname === "/app";
    }
    return location.pathname.startsWith(path);
  };

  // Phase 8: Module Pre-Fetching
  const preloadModule = (path: string) => {
    switch (path) {
      case "/app":
        import("../../pages/app/AppOverview");
        break;
      case "/app/projects":
        import("../../pages/app/ProjectsList");
        break;
      case "/app/clients":
        import("../../pages/app/ClientsList");
        break;
      case "/app/copilot":
        import("../../pages/app/Copilot");
        break;
      case "/app/templates":
        import("../../pages/app/TemplateCenter");
        break;
      default:
        break;
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`w-64 bg-slate-900/95 md:bg-slate-900/50 backdrop-blur-md border-r border-slate-800 h-screen fixed left-0 top-0 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <Link
            to="/"
            className="flex items-center space-x-3 group"
            onClick={() => setIsOpen(false)}
          >
            <BridgeboxLogo className="w-7 h-7 text-indigo-500 group-hover:text-cyan-400 transition-colors duration-300" />
            <div>
              <h2 className="text-xl font-bold text-white">Bridgebox</h2>
              <p className="text-xs text-slate-400">Internal Portal</p>
            </div>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-2 -mr-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {filterItems(topNav).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <motion.div
                  key={item.path}
                  whileHover={{ x: 4 }}
                  onMouseEnter={() => preloadModule(item.path)}
                >
                  <Link
                    to={item.path}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                      active
                        ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium tracking-wide">
                        {item.label}
                      </span>
                    </div>
                    {item.label === "Approval Queue" && pendingActions > 0 && (
                      <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                        {pendingActions}
                      </span>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-slate-800/30">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">
                {profile?.full_name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {profile?.full_name || "User"}
              </p>
              <p className="text-slate-400 text-xs truncate capitalize">
                {profile?.role?.replace("_", " ")}
              </p>
            </div>
          </div>

          <motion.button
            onClick={handleSignOut}
            whileHover={{ x: 4 }}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Sign Out</span>
          </motion.button>
        </div>
      </div>
    </>
  );
}
