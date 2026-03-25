import { Search, User, Menu, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useMobileNav } from '../../contexts/MobileNavContext';
import OrganizationSwitcher from './OrganizationSwitcher';
import NotificationBell from './NotificationBell';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function AppHeader({ title, subtitle, action }: AppHeaderProps) {
  const { profile } = useAuth();
  const { toggle } = useMobileNav();

  return (
    <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-30">
      <div className="px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 md:space-x-4">
          <button
            onClick={toggle}
            className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-4">
              <h1 className="text-xl md:text-2xl font-bold text-white">{title}</h1>
              {action && <div className="hidden sm:block">{action}</div>}
            </div>
            {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
            {action && <div className="mt-4 sm:hidden">{action}</div>}
          </div>
        </div>

        <div className="flex items-center space-x-3 md:space-x-4">
          {profile?.role === 'super_admin' && (
            <Link 
              to="/app/internal/recording-center/capture" 
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-sm font-medium transition-colors"
              title="Quick Record"
            >
              <Video className="w-4 h-4" />
              Record
            </Link>
          )}
          <OrganizationSwitcher />
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#3B82F6] transition-colors w-48 lg:w-64"
            />
          </div>

          <NotificationBell />

          <div className="flex items-center space-x-2 pl-3 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#10B981] flex items-center justify-center">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-white leading-tight">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-slate-400 leading-tight capitalize">{profile?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
