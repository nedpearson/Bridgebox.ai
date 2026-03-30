import { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  CheckSquare,
  Briefcase,
  Upload,
  Menu,
  ArrowLeft,
} from "lucide-react";
import { motion } from "framer-motion";

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export default function MobileLayout({
  children,
  title,
  showBack,
  onBack,
}: MobileLayoutProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col pb-16">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="flex items-center justify-between px-4 h-14">
          {showBack ? (
            <button
              onClick={handleBack}
              className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-9" />
          )}

          {title && (
            <h1 className="text-base font-semibold text-white truncate">
              {title}
            </h1>
          )}

          <button className="p-2 -mr-2 text-slate-400 hover:text-white transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">{children}</div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50">
        <div className="flex items-center justify-around">
          <MobileNavLink to="/app/mobile" icon={Home} label="Home" />
          <MobileNavLink
            to="/app/mobile/tasks"
            icon={CheckSquare}
            label="Tasks"
          />
          <MobileNavLink
            to="/app/mobile/projects"
            icon={Briefcase}
            label="Projects"
          />
          <MobileNavLink to="/app/mobile/upload" icon={Upload} label="Upload" />
        </div>
      </nav>
    </div>
  );
}

interface MobileNavLinkProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

function MobileNavLink({ to, icon: Icon, label }: MobileNavLinkProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center py-2 px-4 min-w-[64px] transition-colors ${
          isActive ? "text-blue-400" : "text-slate-400"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className="relative">
            <Icon className="w-6 h-6" />
            {isActive && (
              <motion.div
                layoutId="mobile-nav-indicator"
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full"
              />
            )}
          </div>
          <span className="text-xs mt-1">{label}</span>
        </>
      )}
    </NavLink>
  );
}
