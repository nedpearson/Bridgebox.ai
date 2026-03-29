import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Type, Sparkles, Loader2, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { enhancementRequestsService } from '../../lib/db/enhancementRequests';
import { buildEnhancementRecommendations } from '../../lib/enhancement/analysisEngine';

interface TypeFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (requestId: string) => void;
}

export default function TypeFeatureModal({ isOpen, onClose, onCreated }: TypeFeatureModalProps) {
  const { currentOrganization } = useAuth();
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [createdId, setCreatedId] = useState('');

  const handleClose = useCallback(() => {
    setText('');
    setError('');
    setDone(false);
    setCreatedId('');
    setIsSubmitting(false);
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(async () => {
    if (!currentOrganization || !text.trim()) return;
    setIsSubmitting(true);
    setError('');

    try {
      const request = await enhancementRequestsService.create({
        workspaceId: currentOrganization.id,
        title: text.trim().slice(0, 80) + (text.length > 80 ? '...' : ''),
        inputMethod: 'text',
        originalPrompt: text.trim(),
      });

      const recommendations = buildEnhancementRecommendations(text, 0);
      await enhancementRequestsService.submitForAnalysis(request.id, currentOrganization.id, {
        analysis_summary: recommendations.business_summary,
        recommendations_json: recommendations,
        request_type: recommendations.request_classification,
        normalized_prompt: text.trim(),
      });

      setCreatedId(request.id);
      setDone(true);
      onCreated?.(request.id);
    } catch (err: any) {
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [currentOrganization, text, onCreated]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.22 }}
            className="relative w-full max-w-xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Type className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">Type a Feature Request</h2>
                  <p className="text-slate-400 text-xs">{currentOrganization?.name}</p>
                </div>
              </div>
              <button onClick={handleClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {!done ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-slate-400 text-sm mb-3">Describe the feature, workflow, or change you want. Be as detailed as you like — the more context, the better the analysis.</p>
                    <textarea
                      value={text}
                      onChange={e => setText(e.target.value)}
                      placeholder="e.g. I want an automated invoice generation system that triggers when a project milestone is marked complete. It should pull the client billing rate, generate a PDF, and email it to the billing contact..."
                      className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm resize-none h-48 focus:outline-none focus:border-indigo-500 leading-relaxed placeholder:text-slate-600"
                      autoFocus
                    />
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-slate-500">
                        {text.trim().split(/\s+/).filter(Boolean).length} words
                      </p>
                      <p className="text-xs text-slate-600">Minimum 10 words recommended</p>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || text.trim().split(/\s+/).length < 3}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white rounded-xl font-semibold transition-all"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> Submit & Analyze</>
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl">Request Submitted</h3>
                    <p className="text-slate-400 text-sm mt-2">Your feature request has been analyzed and attached to <strong className="text-white">{currentOrganization?.name}</strong>.</p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <button onClick={handleClose} className="px-5 py-2.5 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-sm font-medium transition-all">
                      Close
                    </button>
                    <a href={`/app/enhancements/${createdId}`} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all">
                      <ChevronRight className="w-4 h-4" /> View Enhancement
                    </a>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
