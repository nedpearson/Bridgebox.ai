import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";

const routeGroups = [
  {
    baseMatch: [
      "/app/projects",
      "/app/tasks",
      "/app/documents",
      "/app/communications",
    ],
    tabs: [
      { label: "Projects", path: "/app/projects" },
      { label: "Tasks", path: "/app/tasks" },
      { label: "Documents", path: "/app/documents" },
      { label: "Communications", path: "/app/communications" },
    ],
  },
  {
    baseMatch: [
      "/app/clients",
      "/app/leads",
      "/app/proposals",
      "/app/pipeline",
      "/app/opportunities",
    ],
    tabs: [
      { label: "Clients", path: "/app/clients" },
      { label: "Pipeline", path: "/app/pipeline" },
      { label: "Leads", path: "/app/leads" },
      { label: "Proposals", path: "/app/proposals" },
      { label: "Opportunities", path: "/app/opportunities" },
    ],
  },
  {
    baseMatch: ["/app/delivery", "/app/implementation", "/app/client-success"],
    tabs: [
      { label: "Delivery", path: "/app/delivery" },
      { label: "Implementation", path: "/app/implementation" },
      { label: "Client Success", path: "/app/client-success" },
    ],
  },
  {
    baseMatch: ["/app/marketplace", "/app/templates"],
    tabs: [
      { label: "Marketplace", path: "/app/marketplace" },
      { label: "My Templates", path: "/app/templates" },
      { label: "AI Generator", path: "/app/templates/ai-wizard" },
    ],
  },
  {
    baseMatch: ["/app/automations", "/app/workflows"],
    tabs: [
      { label: "Automations", path: "/app/automations" },
      { label: "Workflows", path: "/app/workflows" },
    ],
  },
  {
    baseMatch: ["/app/ai-assistants", "/app/approvals", "/app/copilot"],
    tabs: [
      { label: "AI Assistants", path: "/app/ai-assistants" },
      { label: "Approval Queue", path: "/app/approvals" },
      { label: "Copilot", path: "/app/copilot" },
    ],
  },
  {
    baseMatch: [
      "/app/analytics",
      "/app/trends",
      "/app/conversions",
      "/app/data-activity",
    ],
    tabs: [
      { label: "Analytics", path: "/app/analytics" },
      { label: "Trends", path: "/app/trends" },
      { label: "Conversions", path: "/app/conversions" },
      { label: "Data Activity", path: "/app/data-activity" },
    ],
  },
];

export default function SubNav() {
  const location = useLocation();

  const activeGroup = routeGroups.find((group) =>
    group.baseMatch.some(
      (match) =>
        location.pathname === match ||
        location.pathname.startsWith(`${match}/`),
    ),
  );

  if (!activeGroup) return null;

  return (
    <div className="bg-slate-900 border-b border-slate-800 px-4 md:px-8 overflow-x-auto hide-scrollbar sticky top-[73px] z-30">
      <div className="flex space-x-1 py-2">
        {activeGroup.tabs.map((tab) => {
          const isActive =
            location.pathname === tab.path ||
            location.pathname.startsWith(`${tab.path}/`);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap relative ${
                isActive
                  ? "text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="activeSubNav"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
