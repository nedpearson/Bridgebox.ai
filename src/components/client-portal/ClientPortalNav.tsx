import { motion } from 'framer-motion';
import { LayoutDashboard, FolderKanban, Package, Headphones, CreditCard, Settings, LogOut, Box } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  icon: typeof LayoutDashboard;
  label: string;
  path: string;
}

export default function ClientPortalNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, currentOrganization, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Home', path: '/portal' },
    { icon: FolderKanban, label: 'Projects', path: '/portal/projects' },
    { icon: Package, label: 'Deliverables', path: '/portal/deliverables' },
    { icon: Headphones, label: 'Support', path: '/portal/support' },
    { icon: CreditCard, label: 'Billing', path: '/portal/billing' },
    { icon: Settings, label: 'Settings', path: '/portal/settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/portal') {
      return location.pathname === '/portal';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-64 bg-slate-900/50 backdrop-blur-sm border-r border-slate-800 h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <Link to="/" className="flex items-center space-x-3 group">
          <Box className="w-7 h-7 text-indigo-500 group-hover:text-[#10B981] transition-colors duration-300" />
          <div>
            <h2 className="text-xl font-bold text-white">Bridgebox</h2>
            <p className="text-xs text-slate-400">Client Portal</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <motion.div key={item.path} whileHover={{ x: 4 }}>
              <Link
                to={item.path}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <div className="px-4 py-3 rounded-lg bg-slate-800/30">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-[#10B981] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">
                {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{profile?.full_name || 'User'}</p>
              <p className="text-slate-400 text-xs truncate">{currentOrganization?.name || 'Organization'}</p>
            </div>
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
  );
}
