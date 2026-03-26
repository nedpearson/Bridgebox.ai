import { useState, useEffect } from 'react';
import { internalRecordingsApi, InternalRecording } from '../../lib/internalRecordings';
import { Play, Trash2, Calendar, Clock, HardDrive, Tag, Folder, Sparkles, Send, Archive } from 'lucide-react';

export default function RecordingLibrary() {
  const [recordings, setRecordings] = useState<InternalRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [activeRecording, setActiveRecording] = useState<InternalRecording | null>(null);
  const [activeTab, setActiveTab] = useState<'standard' | 'development'>('standard');

  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    try {
      setLoading(true);
      const data = await internalRecordingsApi.listRecordings();
      setRecordings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load recordings');
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async (recording: InternalRecording) => {
    try {
      const url = await internalRecordingsApi.getRecordingUrl(recording.storage_path);
      setActiveVideoUrl(url);
      setActiveRecording(recording);
    } catch (err: any) {
      alert('Failed to load video url: ' + err.message);
    }
  };

  const handleDelete = async (recording: InternalRecording) => {
    if (!window.confirm(`Are you sure you want to delete "${recording.title}"?`)) return;

    try {
      await internalRecordingsApi.deleteRecording(recording.id, recording.storage_path);
      setRecordings((prev) => prev.filter((r) => r.id !== recording.id));
      if (activeRecording?.id === recording.id) {
        setActiveVideoUrl(null);
        setActiveRecording(null);
      }
    } catch (err: any) {
      alert('Failed to delete recording: ' + err.message);
    }
  };

  const handleArchive = async (recording: InternalRecording) => {
    if (!window.confirm(`Archive "${recording.title}"?`)) return;
    try {
      await internalRecordingsApi.updateRecording(recording.id, {
        status: 'archived',
        is_archived: true
      });
      loadRecordings();
    } catch(err: any) { alert('Failed to archive: ' + err.message); }
  };

  const handleShare = async (recording: InternalRecording) => {
    const email = window.prompt("Enter recipient email (Internal Team Only):");
    if (!email) return;
    try {
      const updatedHistory = [...(recording.email_share_history || []), { email, sent_at: new Date().toISOString() }];
      await internalRecordingsApi.updateRecording(recording.id, {
        email_share_history: updatedHistory
      });
      alert(`Simulation: Recording link sent securely to ${email}`);
      loadRecordings();
    } catch(err: any) { alert('Failed to share: ' + err.message); }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case 'bug': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'walkthrough': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'demo': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'release_testing': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'product_idea': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  const formatCategory = (category: string | null) => {
    if (!category || category === 'other') return 'Uncategorized';
    return category.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="text-slate-400 py-12 text-center">Loading inner tools storage...</div>;
  }

  if (error) {
    return <div className="text-red-400 py-12 text-center bg-red-500/5 rounded-xl border border-red-500/20">{error}</div>;
  }

  const filteredRecordings = recordings.filter(r => 
    !r.is_archived && (
      activeTab === 'standard' 
        ? r.recording_mode !== 'development' 
        : r.recording_mode === 'development'
    )
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-1 rounded-lg w-max">
         <button
            onClick={() => setActiveTab('standard')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'standard' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
         >
            Standard Library
         </button>
         <button
            onClick={() => setActiveTab('development')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'development' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
         >
            Development Notes
         </button>
      </div>

      {/* Video Player Modal/Overlay */}
      {activeVideoUrl && activeRecording && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-full">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h3 className="text-lg font-semibold text-white">{activeRecording.title}</h3>
              <button 
                onClick={() => {
                  setActiveVideoUrl(null);
                  setActiveRecording(null);
                }}
                className="text-slate-400 hover:text-white transition-colors"
                title="Close"
              >
                Close
              </button>
            </div>
            <div className="bg-black flex-1 relative min-h-0 flex items-center justify-center">
               <video 
                 src={activeVideoUrl} 
                 controls 
                 autoPlay 
                 className="w-full max-h-[70vh] object-contain"
               />
            </div>
            {activeRecording.description && (
              <div className="p-4 bg-slate-900 border-t border-slate-800 text-slate-300">
                <p className="font-semibold text-white mb-1">Description</p>
                {activeRecording.description}
              </div>
            )}
            {activeRecording.notes && (
              <div className="p-4 bg-slate-950 border-t border-slate-800 text-slate-400 text-sm">
                 <p className="font-semibold text-slate-300 mb-1">Internal Notes</p>
                {activeRecording.notes}
              </div>
            )}
            {activeRecording.intended_use && (
               <div className="p-4 bg-indigo-500/5 border-t border-indigo-500/20 text-indigo-500 text-sm">
                 <p className="font-semibold mb-1">Intended Outcome</p>
                 {activeRecording.intended_use}
               </div>
            )}
            {activeRecording.build_notes && (
               <div className="p-4 bg-slate-950 border-t border-slate-800 text-slate-400 text-sm">
                 <p className="font-semibold text-slate-300 mb-1">Architecture / Build Notes</p>
                 <pre className="whitespace-pre-wrap font-sans">{activeRecording.build_notes}</pre>
               </div>
            )}
            {activeRecording.feature_request_notes && (
               <div className="p-4 bg-slate-950 border-t border-slate-800 text-slate-400 text-sm">
                 <p className="font-semibold text-slate-300 mb-1">Feature Clarifications</p>
                 <pre className="whitespace-pre-wrap font-sans">{activeRecording.feature_request_notes}</pre>
               </div>
            )}
          </div>
        </div>
      )}

      {/* Library Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecordings.map((recording) => (
          <div key={recording.id} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden group hover:border-slate-700 transition-colors">
            
            {/* Thumbnail Placeholder */}
            <div 
              className="aspect-video bg-slate-950 border-b border-slate-800 relative cursor-pointer group-hover:bg-slate-800 transition-colors flex items-center justify-center"
              onClick={() => handlePlay(recording)}
            >
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 ml-1" />
              </div>
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur text-white text-xs font-medium rounded">
                {formatDuration(recording.duration)}
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-white line-clamp-1" title={recording.title}>
                  {recording.title}
                </h4>
                <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleShare(recording)}
                    className="text-slate-500 hover:text-blue-400 transition-colors p-1"
                    title="Share via Email"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleArchive(recording)}
                    className="text-slate-500 hover:text-amber-400 transition-colors p-1"
                    title="Archive"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(recording)}
                    className="text-slate-500 hover:text-red-400 transition-colors p-1"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {recording.description && (
                <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                  {recording.description}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {recording.category && (
                  <span className={`flex items-center gap-1 px-2 py-1 border text-xs font-semibold rounded-md ${getCategoryColor(recording.category)}`}>
                    <Folder className="w-3 h-3" />
                    {formatCategory(recording.category)}
                  </span>
                )}
                {recording.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded-md">
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
                {recording.transcript_status && recording.transcript_status !== 'pending' && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs rounded-md">
                    <Sparkles className="w-3 h-3" />
                    Transcript: {recording.transcript_status}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(recording.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <HardDrive className="w-3 h-3" />
                  {formatBytes(recording.size || 0)}
                </div>
              </div>
            </div>
          </div>
        ))}

        {recordings.length === 0 && !loading && (
          <div className="col-span-full py-16 text-center border border-dashed border-slate-800 rounded-xl">
            <h3 className="text-lg font-medium text-slate-300 mb-2">No Internal Recordings</h3>
            <p className="text-slate-500">Capture a new session to see it here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
