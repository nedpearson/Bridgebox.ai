// @ts-nocheck
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FolderKanban,
  Code,
  BarChart3,
  Smartphone,
  Network,
  Headphones as HeadphonesIcon,
  CreditCard,
  CircleUser as UserCircle,
  Settings,
  Video as LucideIcon,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function AdminSidebar({
  activeSection,
  onSectionChange,
}: AdminSidebarProps) {
  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: "Overview" },
    { icon: Users, label: "Leads" },
    { icon: Briefcase, label: "Clients" },
    { icon: FolderKanban, label: "Projects" },
    { icon: Code, label: "Custom Software" },
    { icon: BarChart3, label: "Dashboards" },
    { icon: Smartphone, label: "Mobile Apps" },
    { icon: Network, label: "Integrations" },
    { icon: HeadphonesIcon, label: "Support" },
    { icon: CreditCard, label: "Billing" },
    { icon: UserCircle, label: "Team" },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <div className="w-64 bg-slate-900/50 backdrop-blur-sm border-r border-slate-800 h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white">Bridgebox</h2>
        <p className="text-sm text-slate-400 mt-1">Command Center</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.label;

          return (
            <motion.button
              key={item.label}
              onClick={() => onSectionChange(item.label)}
              whileHover={{ x: 4 }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-indigo-500/10 text-indigo-500 border border-indigo-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center space-x-3 px-4 py-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-[#10B981] rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">A</span>
          </div>
          <div>
            <p className="text-white text-sm font-medium">Admin User</p>
            <p className="text-slate-500 text-xs">Super Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
