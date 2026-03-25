import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Phone, Mail, Activity, Loader2 } from 'lucide-react';
import Button from '../Button';
import { useAuth } from '../../contexts/AuthContext';
import { globalCommunicationsService, CommunicationChannel, CommunicationDirection } from '../../lib/db/globalCommunications';
import { entityLinkService, EntityType } from '../../lib/db/entityLinks';

interface InteractionLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: EntityType;
  entityId: string;
  onLogComplete: () => void;
}

export default function InteractionLogModal({ isOpen, onClose, entityType, entityId, onLogComplete }: InteractionLogModalProps) {
  const { currentOrganization, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [channel, setChannel] = useState<CommunicationChannel>('note');
  const [direction, setDirection] = useState<CommunicationDirection>('internal');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization?.id || !profile?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const newComm = await globalCommunicationsService.logCommunication({
        tenant_id: currentOrganization.id,
        channel,
        direction,
        subject: subject.trim() || undefined,
        content: content.trim(),
        author_id: profile.id,
        timestamp: new Date().toISOString()
      });

      if (newComm) {
        await entityLinkService.linkEntities({
          tenant_id: currentOrganization.id,
          source_type: entityType,
          source_id: entityId,
          target_type: 'communication',
          target_id: newComm.id,
          relationship_type: 'logged_against'
        });
      }

      onLogComplete();
      onClose();
      // Reset state for next open
      setChannel('note');
      setDirection('internal');
      setSubject('');
      setContent('');
    } catch (err: any) {
      console.error('Failed to log interaction:', err);
      setError(err.message || 'Error saving interaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const channels: { id: CommunicationChannel; label: string; icon: any }[] = [
    { id: 'note', label: 'Internal Note', icon: MessageSquare },
    { id: 'call', label: 'Phone Call', icon: Phone },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'meeting', label: 'Meeting', icon: Activity },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm shadow-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
            <div>
              <h2 className="text-xl font-bold text-white">Log Interaction</h2>
              <p className="text-sm text-slate-400 mt-1 capitalize">Binding to {entityType} Record</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Channel</label>
                  <div className="grid grid-cols-2 gap-2">
                    {channels.map(c => {
                      const Icon = c.icon;
                      const isSelected = channel === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setChannel(c.id)}
                          className={`flex justify-center items-center space-x-2 py-2 px-3 border rounded-lg text-sm transition-colors ${
                            isSelected 
                              ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' 
                              : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-300 hover:border-slate-600'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{c.label}</span>
                        </button>
                      );
                    })}
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Direction</label>
                  <select
                    value={direction}
                    onChange={(e) => setDirection(e.target.value as CommunicationDirection)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="internal">Internal (No Client Visibility)</option>
                    <option value="inbound">Inbound (Received)</option>
                    <option value="outbound">Outbound (Sent)</option>
                  </select>
               </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Subject / Title (Optional)</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Q3 Planning Call"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="flex-1 flex flex-col min-h-[150px]">
              <label className="block text-sm font-medium text-slate-300 mb-2">Details <span className="text-red-400">*</span></label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Summarize the interaction..."
                required
                className="w-full flex-1 min-h-[150px] bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
                {error}
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800 mt-2 shrink-0">
              <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={!content.trim() || loading} className="min-w-[120px]">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Log Activity'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
