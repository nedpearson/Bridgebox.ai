import { Search, User, Menu, Video, ArrowLeft } from 'lucide-react';
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
  backTo?: string;
  backLabel?: string;
}

import { EyeOff } from 'lucide-react';

export default function AppHeader({ title, subtitle, action, backTo, backLabel }: AppHeaderProps) {
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
            {backTo && (
              <Link to={backTo} className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors uppercase tracking-widest mb-1.5 group">
                 <ArrowLeft className="w-3.5 h-3.5 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />
                 {backLabel || 'Back'}
              </Link>
            )}
            <div className="flex items-center space-x-4">
              <h1 className="text-lg md:text-xl font-semibold tracking-tight text-white">{title}</h1>
              {action && <div className="hidden sm:block">{action}</div>}
            </div>
            {subtitle && !backTo && <p className="text-slate-500 text-sm mt-0.5 tracking-wide">{subtitle}</p>}
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
