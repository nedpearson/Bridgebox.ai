import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, Type, Video, GitMerge, Wand2, ChevronRight, Clock, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { enhancementRequestsService } from '../../lib/db/enhancementRequests';
import { StatusBadgeWES } from './StatusBadgeWES';
import SpeakYourAppModal from './SpeakYourAppModal';
import TypeFeatureModal from './TypeFeatureModal';
import UploadRecordingModal from './UploadRecordingModal';
import type { EnhancementRequest } from '../../types/enhancement';
import { formatRelativeTime } from '../../lib/dateUtils';

interface WorkspaceEnhancementCardProps {
  onMergeClick?: () => void;
}

export default function WorkspaceEnhancementCard({ onMergeClick }: WorkspaceEnhancementCardProps) {
  const { currentOrganization } = useAuth();
  const [recentRequests, setRecentRequests] = useState<EnhancementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVoice, setShowVoice] = useState(false);
  const [showType, setShowType] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const loadRecent = useCallback(async () => {
    if (!currentOrganization) return;
    try {
      const data = await enhancementRequestsService.listRecent(currentOrganization.id, 4);
      setRecentRequests(data);
    } catch {
      // non-critical
    } finally {
      setLoading(false);
    }
  }, [currentOrganization]);

  useEffect(() => { loadRecent(); }, [loadRecent]);

  const handleCreated = useCallback(() => {
    loadRecent();
    setShowVoice(false);
    setShowType(false);
    setShowUpload(false);
  }, [loadRecent]);

  const quickActions = [
    { icon: Mic, label: 'Speak Feature', color: 'text-indigo-400', bg: 'bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/20', onClick: () => setShowVoice(true) },
    { icon: Type, label: 'Type Feature', color: 'text-cyan-400', bg: 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/20', onClick: () => setShowType(true) },
    { icon: Video, label: 'Upload Recording', color: 'text-violet-400', bg: 'bg-violet-500/10 hover:bg-violet-500/20 border-violet-500/20', onClick: () => setShowUpload(true) },
    { icon: GitMerge, label: 'Merge Workspace', color: 'text-amber-400', bg: 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20', onClick: onMergeClick },
  ];

  return (
    <>
      <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl overflow-hidden">
        {/* Header gradient */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-600/20 via-violet-600/10 to-transparent border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Wand2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">Enhancement Studio</h3>
                <p className="text-slate-400 text-xs">Speak, type, or record — then build</p>
              </div>
            </div>
            <Link to="/app/enhancements" className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
              View Queue <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Primary CTA */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setShowVoice(true)}
            className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-600/20 to-violet-600/10 hover:from-indigo-600/30 hover:to-violet-600/20 border border-indigo-500/30 rounded-xl transition-all group"
          >
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="text-white font-semibold">Speak Your App</p>
              <p className="text-slate-400 text-sm">Describe what you want — voice-to-software intelligence</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
              <Zap className="w-4 h-4 text-indigo-400" />
            </div>
          </motion.button>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-2">
            {quickActions.slice(1).map(action => (
              <button
                key={action.label}
                onClick={action.onClick}
                className={`flex items-center gap-2.5 p-3 ${action.bg} border rounded-xl transition-all text-left`}
              >
                <action.icon className={`w-4 h-4 ${action.color} flex-shrink-0`} />
                <span className="text-sm font-medium text-slate-300">{action.label}</span>
              </button>
            ))}
          </div>

          {/* Recent requests */}
          {!loading && recentRequests.length > 0 && (
            <div className="pt-1">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Recent Requests</p>
              </div>
              <div className="space-y-2">
                {recentRequests.map(req => (
                  <Link key={req.id} to={`/app/enhancements/${req.id}`} className="flex items-center justify-between p-3 bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/40 rounded-xl transition-all group">
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-medium truncate group-hover:text-indigo-300 transition-colors">{req.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{formatRelativeTime(req.created_at)}</p>
                    </div>
                    <StatusBadgeWES status={req.status} size="xs" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {!loading && recentRequests.length === 0 && (
            <div className="text-center py-4">
              <p className="text-slate-500 text-sm">No enhancement requests yet.</p>
              <p className="text-slate-600 text-xs mt-1">Start by speaking or typing what you want built.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <SpeakYourAppModal isOpen={showVoice} onClose={() => setShowVoice(false)} onCreated={handleCreated} />
      <TypeFeatureModal isOpen={showType} onClose={() => setShowType(false)} onCreated={handleCreated} />
      <UploadRecordingModal isOpen={showUpload} onClose={() => setShowUpload(false)} onCreated={handleCreated} />
    </>
  );
}
