import { Search, User, Menu, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useMobileNav } from '../../contexts/MobileNavContext';
import OrganizationSwitcher from './OrganizationSwitcher';
import NotificationBell from './NotificationBell';
import CommandPalette from './CommandPalette';
import InstallAppPrompt from './InstallAppPrompt';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

import { EyeOff } from 'lucide-react';

export default function AppHeader({ title, subtitle, action }: AppHeaderProps) {
  const { profile, isImpersonating, stopImpersonating } = useAuth();
  const { toggle } = useMobileNav();

  return (
    <>
      {isImpersonating && (
        <div className="bg-red-500 text-white px-4 py-2 flex items-center justify-center gap-3 w-full z-50 animate-pulse relative">
          <EyeOff className="w-4 h-4" />
          <span className="text-sm font-semibold tracking-wide">IMPERSONATION MODE ACTIVE</span>
          <button 
            onClick={() => { stopImpersonating(); window.location.reload(); }}
            className="ml-4 px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-xs transition-colors font-medium border border-white/20 backdrop-blur"
          >
            Revert to Super Admin
          </button>
        </div>
      )}
      <div className="border-b border-slate-800 bg-slate-900 sticky top-0 z-40">
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
          
          <InstallAppPrompt />
          <OrganizationSwitcher />
          
          <CommandPalette />

          <NotificationBell />

          <Link to="/app/settings" className="flex items-center space-x-2 pl-3 border-l border-slate-800 hover:bg-white/5 p-2 -my-2 rounded-lg cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#10B981] flex items-center justify-center">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-white leading-tight hover:text-indigo-400 transition-colors">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-slate-400 leading-tight capitalize">{profile?.role?.replace('_', ' ')}</p>
            </div>
          </Link>
        </div>
      </div>
      </div>
    </>
  );
}
