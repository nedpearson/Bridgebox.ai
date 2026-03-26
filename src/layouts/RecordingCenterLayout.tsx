import { Link, useLocation } from 'react-router-dom';
import { MobileNavProvider } from '../contexts/MobileNavContext';
import { 
  Building2, 
  Terminal, 
  Video, 
  Activity, 
  Brain, 
  Link2, 
  Settings2, 
  BookOpen, 
  Globe, 
  Flame, 
  Shield,
  ArrowLeft,
  PieChart,
  Code2,
  Bug,
  TestTube2,
  Database,
  DollarSign,
  LayoutTemplate
} from 'lucide-react';

export default function RecordingCenterLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const navLinks = [
    { name: 'Overview', path: '/app/internal/recording-center', icon: Building2 },
    { name: 'Start Recording', path: '/app/internal/recording-center/capture', icon: Video },
    { name: 'Recording Library', path: '/app/internal/recording-center/library', icon: Terminal },
    { name: 'Support Inquiries', path: '/app/internal/recording-center/support', icon: Activity },
    { name: 'Dev Tasks Inbox', path: '/app/internal/recording-center/dev-tasks', icon: Code2 },
    { name: 'Bug Reports', path: '/app/internal/recording-center/bug-reports', icon: Bug },
    { name: 'QA Test Cases', path: '/app/internal/recording-center/qa-test-cases', icon: TestTube2 },
    { name: 'Support Analytics', path: '/app/internal/recording-center/support-analytics', icon: PieChart },
    { name: 'Web Access', path: '/app/internal/recording-center/web', icon: Globe },
    { name: 'AI Capability Editor', path: '/app/internal/recording-center/ai-knowledge', icon: Brain },
    { name: 'AI Validation Suite', path: '/app/internal/recording-center/ai-validation', icon: Database },
    { name: 'Template Studio', path: '/app/internal/recording-center/templates', icon: LayoutTemplate },
    { name: 'Pricing Command Center', path: '/app/internal/recording-center/pricing', icon: DollarSign },
  ];

  return (
    <MobileNavProvider>
    <div className="flex w-full min-h-screen bg-slate-950">
      
      {/* Sidebar Navigation */}
      <div className="w-64 shrink-0 border-r border-slate-800 bg-slate-900 flex flex-col h-screen fixed left-0 top-0 shadow-2xl z-50">
        <div className="p-6 border-b border-slate-800">
           <h1 className="text-xl font-bold text-white tracking-tight">Recording Center</h1>
           <p className="text-xs text-slate-500 font-mono mt-1 uppercase">Super Admin Environment</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navLinks.map((link: any) => {
             const Icon = link.icon;
             const isActive = location.pathname === link.path;
             return (
               <Link 
                 key={link.path}
                 to={link.path}
                 className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                   isActive 
                   ? (link.danger ? 'bg-red-500/20 text-red-400' : 'bg-indigo-500/20 text-indigo-500')
                   : 'text-slate-400 hover:text-white hover:bg-slate-800'
                 }`}
               >
                 <Icon className="w-4 h-4" />
                 {link.name}
               </Link>
             )
          })}
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-4">
          <Link 
            to="/app"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors w-full"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to App
          </Link>
          <div className="bg-amber-500/5 text-amber-500/80 text-xs text-center font-mono py-2 rounded-md">
             RESTRICTED ACCESS
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-screen bg-slate-950 p-8 ml-64 overflow-y-auto relative z-10">
         <div className="max-w-7xl mx-auto">
           {children}
         </div>
      </div>
      
    </div>
    </MobileNavProvider>
  );
}
