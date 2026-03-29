import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wand2, Plus, Mic, Type, Video, GitMerge, Search,
  ChevronRight, Filter, Clock, Inbox
} from 'lucide-react';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import { StatusBadgeWES, RequestTypeBadge } from '../../components/enhancement/StatusBadgeWES';
import SpeakYourAppModal from '../../components/enhancement/SpeakYourAppModal';
import TypeFeatureModal from '../../components/enhancement/TypeFeatureModal';
import UploadRecordingModal from '../../components/enhancement/UploadRecordingModal';
import MergeWorkspaceModal from '../../components/enhancement/MergeWorkspaceModal';
import { useAuth } from '../../contexts/AuthContext';
import { enhancementRequestsService } from '../../lib/db/enhancementRequests';
import { formatRelativeTime } from '../../lib/dateUtils';
import type { EnhancementRequest, EnhancementStatus } from '../../types/enhancement';
import { ENHANCEMENT_STATUS_LABELS } from '../../types/enhancement';

const INPUT_METHOD_ICONS = {
  voice: Mic,
  text: Type,
  recording: Video,
  screenshot: Video,
  mixed: Video,
};

const ALL_STATUSES: EnhancementStatus[] = [
  'draft', 'submitted', 'analyzing', 'ready_for_review', 'approved', 'rejected', 'ready_to_apply', 'applied', 'failed'
];

export default function EnhancementQueue() {
  const { currentOrganization } = useAuth();
  const [requests, setRequests] = useState<EnhancementRequest[]>([]);
  const [filtered, setFiltered] = useState<EnhancementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EnhancementStatus | 'all'>('all');

  const [showVoice, setShowVoice] = useState(false);
  const [showType, setShowType] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showMerge, setShowMerge] = useState(false);

  const loadData = useCallback(async () => {
    if (!currentOrganization) return;
    try {
      setLoading(true);
      const data = await enhancementRequestsService.list(currentOrganization.id);
      setRequests(data);
      setFiltered(data);
    } catch (err) {
      console.error('Failed to load enhancements', err);
    } finally {
      setLoading(false);
    }
  }, [currentOrganization]);

  useEffect(() => { loadData(); }, [loadData]);

  // Filter logic
  useEffect(() => {
    let result = requests;
    if (statusFilter !== 'all') result = result.filter(r => r.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r => r.title.toLowerCase().includes(q) || r.analysis_summary?.toLowerCase().includes(q));
    }
    setFiltered(result);
  }, [requests, statusFilter, search]);

  const handleCreated = useCallback(() => {
    loadData();
    setShowVoice(false);
    setShowType(false);
    setShowUpload(false);
    setShowMerge(false);
  }, [loadData]);

  return (
    <>
      <AppHeader
        title="Software Build Queue"
        subtitle="Every request, recording, and blueprint — tracked from idea to implementation."
      />

      <div className="p-6 md:p-8 space-y-6">
        {/* Quick Add row */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowVoice(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-500/20"
          >
            <Mic className="w-4 h-4" /> Start Speaking
          </button>
          <button
            onClick={() => setShowType(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-xl font-medium text-sm transition-all"
          >
            <Type className="w-4 h-4" /> Describe in Writing
          </button>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-xl font-medium text-sm transition-all"
          >
            <Video className="w-4 h-4" /> Upload Software Recording
          </button>
          <button
            onClick={() => setShowMerge(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-xl font-medium text-sm transition-all"
          >
            <GitMerge className="w-4 h-4" /> Import Feature Pack
          </button>
        </div>

        {/* Search + Filter */}
        <Card glass className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search requests..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="bg-slate-800/60 border border-slate-700 rounded-xl pl-9 pr-8 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                {ALL_STATUSES.map(s => (
                  <option key={s} value={s}>{ENHANCEMENT_STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner /></div>
        ) : filtered.length === 0 ? (
          <Card glass className="py-16 text-center">
            <Inbox className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            {requests.length > 0 ? (
              <>
                <p className="text-white font-semibold text-lg">No results match that filter</p>
                <p className="text-slate-400 text-sm mt-2">Try broadening your search or clearing the status filter.</p>
              </>
            ) : (
              <>
                <p className="text-white font-semibold text-lg">Your build queue is empty</p>
                <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto">
                  Start by describing your current software — by voice, text, or screen recording.
                  Bridgebox will analyze it and generate a custom implementation blueprint.
                </p>
                <button
                  onClick={() => setShowVoice(true)}
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-500/20"
                >
                  <Mic className="w-4 h-4" /> Start Speaking Your App
                </button>
              </>
            )}
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((req, i) => {
              const MethodIcon = INPUT_METHOD_ICONS[req.input_method] || Wand2;
              return (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link
                    to={`/app/enhancements/${req.id}`}
                    className="flex items-center gap-4 p-4 bg-slate-900/60 hover:bg-slate-800/60 border border-slate-700/50 hover:border-slate-600/50 rounded-xl transition-all group"
                  >
                    <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MethodIcon className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate group-hover:text-indigo-300 transition-colors">{req.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {req.request_type && <RequestTypeBadge type={req.request_type} size="xs" />}
                        <span className="text-slate-500 text-xs flex items-center gap-1"><Clock className="w-3 h-3" />{formatRelativeTime(req.created_at)}</span>
                        {req.media_count > 0 && <span className="text-slate-500 text-xs">{req.media_count} file{req.media_count > 1 ? 's' : ''}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <StatusBadgeWES status={req.status} size="sm" />
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <SpeakYourAppModal isOpen={showVoice} onClose={() => setShowVoice(false)} onCreated={handleCreated} />
      <TypeFeatureModal isOpen={showType} onClose={() => setShowType(false)} onCreated={handleCreated} />
      <UploadRecordingModal isOpen={showUpload} onClose={() => setShowUpload(false)} onCreated={handleCreated} />
      <MergeWorkspaceModal isOpen={showMerge} onClose={() => setShowMerge(false)} onComplete={handleCreated} />
    </>
  );
}
