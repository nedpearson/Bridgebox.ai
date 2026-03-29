import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, FolderKanban, DollarSign, Plus, CheckCircle2, LayoutTemplate, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppHeader from '../../components/app/AppHeader';
import KPICard from '../../components/admin/KPICard';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { analyticsService } from '../../lib/db/analytics';
import { globalTasksService } from '../../lib/db/globalTasks';
import TimelineActivity from '../../components/app/TimelineActivity';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatRelativeTime } from '../../lib/dateUtils';
import WorkspaceEnhancementCard from '../../components/enhancement/WorkspaceEnhancementCard';
import MergeWorkspaceModal from '../../components/enhancement/MergeWorkspaceModal';
import VoiceToAppHero from '../../components/dashboard/VoiceToAppHero';
import SpeakYourAppModal from '../../components/enhancement/SpeakYourAppModal';
import TypeFeatureModal from '../../components/enhancement/TypeFeatureModal';
import UploadRecordingModal from '../../components/enhancement/UploadRecordingModal';

export default function AppOverview() {
  const { currentOrganization } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMerge, setShowMerge] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [showType, setShowType] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentOrganization]);

  const loadData = async () => {
    if (!currentOrganization) return;
    try {
      setLoading(true);
      const [allAnalytics, tasks] = await Promise.all([
        analyticsService.getAllAnalytics(currentOrganization.id),
        globalTasksService.getTenantTasks(currentOrganization.id)
      ]);
      setAnalytics(allAnalytics);
      setRecentTasks((tasks || []).slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;

  const kpis = [
    { title: 'Pipeline Value', value: analytics?.sales?.pipelineValue || 0, icon: DollarSign, prefix: '$', link: '/app/pipeline' },
    { title: 'Active Clients', value: analytics?.clientHealth?.activeClients || 0, icon: Users, link: '/app/clients' },
    { title: 'Active Projects', value: analytics?.delivery?.activeProjects || 0, icon: FolderKanban, link: '/app/projects' },
    { title: 'Monthly Revenue', value: analytics?.billing?.totalRevenue || 0, prefix: '$', icon: TrendingUp, link: '/app/analytics' },
  ];

  return (
    <>
      <AppHeader title="Overview" subtitle="Here's what's happening today." />
      <div className="p-8 space-y-8">
        {/* Phase 1: Voice To App Hero */}
        <VoiceToAppHero 
          onVoiceClick={() => setShowVoice(true)}
          onRecordingClick={() => setShowUpload(true)}
          onTypeClick={() => setShowType(true)}
        />

        {/* KPI Cards (4) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, idx) => (
            <Link to={kpi.link || '#'} key={idx} className="block hover:-translate-y-1 transition-transform">
              <KPICard title={kpi.title} value={kpi.value} icon={kpi.icon} prefix={kpi.prefix} trend={{value: 0, direction: 'up'}} />
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Column: Activity Feed & Tasks */}
          <div className="lg:col-span-2 space-y-8">
             <Card glass className="p-6">
                <div className="flex items-center justify-between mb-6">
                   <h2 className="text-xl font-bold text-white">Active Work</h2>
                   <Link to="/app/tasks"><Button variant="outline" size="sm">View All</Button></Link>
                </div>
                <div className="space-y-3">
                   {recentTasks.length === 0 ? (
                       <div className="text-center py-8">
                         <CheckCircle2 className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                         <p className="text-slate-400 text-sm font-medium">No open tasks right now</p>
                         <p className="text-slate-600 text-xs mt-1">Tasks generated from your build requests will appear here.</p>
                       </div>
                   ) : (
                       recentTasks.map(task => (
                          <div key={task.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors">
                             <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-slate-500 hover:text-emerald-500 cursor-pointer transition-colors" />
                                <div className="min-w-0">
                                   <p className="text-white font-medium truncate max-w-[200px] sm:max-w-xs md:max-w-md">{task.title}</p>
                                   <p className="text-xs text-slate-400 capitalize">{task.status?.replace('_', ' ')}</p>
                                </div>
                             </div>
                             <div className="text-xs text-slate-500 flex items-center gap-1.5 font-mono">
                                <Clock className="w-3 h-3" />
                                {task.due_date ? formatRelativeTime(task.due_date) : 'No due date'}
                             </div>
                          </div>
                       ))
                   )}
                </div>
             </Card>

             <Card glass className="p-6">
                <h2 className="text-xl font-bold text-white mb-6">Activity Feed</h2>
                <TimelineActivity entityType="organization" entityId={currentOrganization?.id || ''} />
             </Card>
          </div>

          {/* Side Column: Voice-to-App Studio + Platform Quick Links */}
          <div className="space-y-6">
             <WorkspaceEnhancementCard onMergeClick={() => setShowMerge(true)} />
             <Card glass className="p-6">
                <h2 className="text-base font-bold text-white mb-1">Where to go next</h2>
                <p className="text-slate-500 text-xs mb-5">The highest-value actions in your workspace.</p>
                <div className="grid grid-cols-1 gap-2">
                   <Link to="/app/enhancements">
                     <button className="w-full flex items-center gap-3 p-3.5 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/15 hover:border-indigo-500/30 rounded-xl transition-colors text-left group">
                       <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg group-hover:scale-105 transition-transform">
                          <Plus className="w-4 h-4" />
                       </div>
                       <div>
                          <p className="text-white text-sm font-medium">Review Build Queue</p>
                          <p className="text-xs text-slate-500">See all pending software requests</p>
                       </div>
                     </button>
                   </Link>
                   <Link to="/app/clients">
                     <button className="w-full flex items-center gap-3 p-3.5 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors text-left group">
                       <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:scale-105 transition-transform">
                          <Users className="w-4 h-4" />
                       </div>
                       <div>
                          <p className="text-white text-sm font-medium">Manage Client Workspaces</p>
                          <p className="text-xs text-slate-500">View and update client profiles</p>
                       </div>
                     </button>
                   </Link>
                   <Link to="/app/projects">
                     <button className="w-full flex items-center gap-3 p-3.5 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors text-left group">
                       <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg group-hover:scale-105 transition-transform">
                          <LayoutTemplate className="w-4 h-4" />
                       </div>
                       <div>
                          <p className="text-white text-sm font-medium">Active Projects</p>
                          <p className="text-xs text-slate-500">Track deliverables and timelines</p>
                       </div>
                     </button>
                   </Link>
                </div>
             </Card>
          </div>
        </div>
      </div>
      <MergeWorkspaceModal isOpen={showMerge} onClose={() => setShowMerge(false)} />
      <SpeakYourAppModal isOpen={showVoice} onClose={() => setShowVoice(false)} />
      <TypeFeatureModal isOpen={showType} onClose={() => setShowType(false)} />
      <UploadRecordingModal isOpen={showUpload} onClose={() => setShowUpload(false)} />
    </>
  );
}
