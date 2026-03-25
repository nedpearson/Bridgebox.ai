import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Briefcase,
  FolderKanban,
  Network,
  CreditCard,
  Settings,
  Building2,
  Users,
  FileText,
  File,
  Target,
  LogOut,
  Box,
  Rocket,
  MessageSquare,
  BarChart3,
  Crown,
  Zap,
  Heart,
  BookOpen,
  Sparkles,
  TrendingUp,
  Radar,
  X,
  Shield,
  Video,
  CheckCircle2,
  Mail
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useMobileNav } from '../../contexts/MobileNavContext';
import { permissions } from '../../lib/permissions';

interface NavItem {
  icon: typeof LayoutDashboard;
  label: string;
  path: string;
  requirePermission?: (ctx: any) => boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { can, signOut, profile } = useAuth();
  const { isOpen, setIsOpen } = useMobileNav();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navSections: NavSection[] = [
    {
      title: 'Super Admin',
      items: [
        { icon: Video, label: 'Recording Center', path: '/app/internal/recording-center', requirePermission: (ctx) => ctx.role === 'super_admin' },
      ],
    },
    {
      title: 'Executive',
      items: [
        { icon: Crown, label: 'Command Center', path: '/app/executive', requirePermission: permissions.canAccessAdminPanel },
      ],
    },
    {
      title: 'Sales',
      items: [
        { icon: Target, label: 'Pipeline', path: '/app/pipeline', requirePermission: permissions.canAccessAdminPanel },
        { icon: Users, label: 'Leads', path: '/app/leads', requirePermission: permissions.canManageLeads },
        { icon: FileText, label: 'Proposals', path: '/app/proposals', requirePermission: permissions.canManageProposals },
        { icon: Sparkles, label: 'AI Copilot', path: '/app/copilot', requirePermission: permissions.canAccessAdminPanel },
      ],
    },
    {
      title: 'Delivery',
      items: [
        { icon: FolderKanban, label: 'Projects', path: '/app/projects', requirePermission: permissions.canAccessAdminPanel },
        { icon: Rocket, label: 'Delivery OS', path: '/app/delivery', requirePermission: permissions.canAccessAdminPanel },
        { icon: Zap, label: 'Implementation', path: '/app/implementation', requirePermission: permissions.canAccessAdminPanel },
        { icon: MessageSquare, label: 'Support', path: '/app/support', requirePermission: permissions.canAccessAdminPanel },
      ],
    },
    {
      title: 'Management',
      items: [
        { icon: LayoutDashboard, label: 'Overview', path: '/app', requirePermission: permissions.canAccessAdminPanel },
        { icon: BarChart3, label: 'Analytics', path: '/app/analytics', requirePermission: permissions.canAccessAdminPanel },
        { icon: TrendingUp, label: 'Trends', path: '/app/trends', requirePermission: permissions.canAccessAdminPanel },
        { icon: Radar, label: 'Market Signals', path: '/app/market-signals', requirePermission: permissions.canAccessAdminPanel },
        { icon: Target, label: 'Opportunities', path: '/app/opportunities', requirePermission: permissions.canAccessAdminPanel },
        { icon: Zap, label: 'Agent Actions', path: '/app/agent-actions', requirePermission: permissions.canAccessAdminPanel },
        { icon: Building2, label: 'Clients', path: '/app/clients', requirePermission: permissions.canManageClients },
        { icon: CheckCircle2, label: 'Tasks', path: '/app/tasks', requirePermission: permissions.canAccessAdminPanel },
        { icon: Heart, label: 'Client Success', path: '/app/client-success', requirePermission: permissions.canAccessAdminPanel },
        { icon: Zap, label: 'Automations', path: '/app/automations', requirePermission: permissions.canAccessAdminPanel },
        { icon: Zap, label: 'Workflows', path: '/app/workflows', requirePermission: permissions.canAccessAdminPanel },
        { icon: File, label: 'Documents', path: '/app/documents', requirePermission: permissions.canAccessAdminPanel },
        { icon: Mail, label: 'Communications', path: '/app/communications', requirePermission: permissions.canAccessAdminPanel },
        { icon: BookOpen, label: 'Knowledge Base', path: '/app/knowledge', requirePermission: permissions.canAccessAdminPanel },
        { icon: Network, label: 'Integrations', path: '/app/integrations', requirePermission: permissions.canAccessAdminPanel },
        { icon: CreditCard, label: 'Billing', path: '/app/billing', requirePermission: permissions.canAccessAdminPanel },
        { icon: Users, label: 'Team', path: '/app/team', requirePermission: permissions.canAccessAdminPanel },
      ],
    },
  ];

  const settingsItem: NavItem = { icon: Settings, label: 'Settings', path: '/app/settings' };

  const filterItems = (items: NavItem[]) => {
    return items.filter(item => !item.requirePermission || can(item.requirePermission));
  };

  const isActive = (path: string) => {
    if (path === '/app') {
      return location.pathname === '/app';
    }
    return location.pathname.startsWith(path);
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
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3 group" onClick={() => setIsOpen(false)}>
            <Box className="w-7 h-7 text-[#3B82F6] group-hover:text-[#10B981] transition-colors duration-300" />
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
        {navSections.map((section, sectionIndex) => {
          const visibleItems = filterItems(section.items);
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className={sectionIndex > 0 ? 'mt-6' : ''}>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-4">
                {section.title}
              </p>
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <motion.div key={item.path} whileHover={{ x: 4 }}>
                      <Link
                        to={item.path}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                          active
                            ? 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="mt-6 pt-6 border-t border-slate-800">
          <motion.div whileHover={{ x: 4 }}>
            <Link
              to={settingsItem.path}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive(settingsItem.path)
                  ? 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">{settingsItem.label}</span>
            </Link>
          </motion.div>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-slate-800/30">
          <div className="w-9 h-9 bg-gradient-to-br from-[#3B82F6] to-[#10B981] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">
              {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{profile?.full_name || 'User'}</p>
            <p className="text-slate-400 text-xs truncate capitalize">{profile?.role?.replace('_', ' ')}</p>
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
