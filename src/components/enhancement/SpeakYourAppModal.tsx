import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, Type, X, ChevronRight, Sparkles, Upload,
  Loader2, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import VoiceCapturePanel from './VoiceCapturePanel';
import { voiceSessionsService } from '../../lib/db/voiceSessions';
import { enhancementRequestsService } from '../../lib/db/enhancementRequests';
import { buildEnhancementRecommendations } from '../../lib/enhancement/analysisEngine';
import type { VoiceContextMode } from '../../types/enhancement';
import { VOICE_CONTEXT_LABELS } from '../../types/enhancement';

interface SpeakYourAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (requestId: string) => void;
}

type Step = 'mode' | 'capture' | 'submit' | 'done';

const CONTEXT_MODE_DESCRIPTIONS: Record<VoiceContextMode, string> = {
  describe_current_software: 'Tell us about the software you use today — what it does, how you use it.',
  describe_feature: 'Describe a specific feature or capability you want added.',
  describe_workflow: 'Walk through a workflow or process step by step.',
  describe_final_vision: "Paint the picture of your ideal system — don't hold back.",
  describe_changes: 'Explain what you want changed, improved, or removed.',
  describe_pain_points: "Tell us what's broken, slow, or frustrating about current tools.",
  free_form: "Speak freely — say whatever's on your mind about your software needs.",
};

const ORDERED_MODES: VoiceContextMode[] = [
  'describe_current_software',
  'describe_final_vision',
  'describe_feature',
  'describe_workflow',
  'describe_pain_points',
  'describe_changes',
  'free_form',
];

export default function SpeakYourAppModal({ isOpen, onClose, onCreated }: SpeakYourAppModalProps) {
  const { currentOrganization } = useAuth();
  const [step, setStep] = useState<Step>('mode');
  const [contextMode, setContextMode] = useState<VoiceContextMode>('free_form');
  const [transcript, setTranscript] = useState('');
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdId, setCreatedId] = useState('');

  const handleReset = useCallback(() => {
    setStep('mode');
    setContextMode('free_form');
    setTranscript('');
    setDurationSeconds(0);
    setError('');
    setCreatedId('');
    setIsSubmitting(false);
  }, []);

  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  const handleTranscriptReady = useCallback((t: string, duration: number) => {
    setTranscript(t);
    setDurationSeconds(duration);
    if (t.trim()) {
      setStep('submit');
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!currentOrganization || !transcript.trim()) return;
    setIsSubmitting(true);
    setError('');

    try {
      // 1. Create enhancement request
      const request = await enhancementRequestsService.create({
        workspaceId: currentOrganization.id,
        title: transcript.trim().slice(0, 80) + (transcript.length > 80 ? '...' : ''),
        inputMethod: 'voice',
        originalPrompt: transcript,
        transcript,
      });

      // 2. Save voice session
      const session = await voiceSessionsService.create({
        workspaceId: currentOrganization.id,
        contextMode,
        rawTranscript: transcript,
        durationSeconds,
        enhancementRequestId: request.id,
      });

      await voiceSessionsService.linkToRequest(session.id, request.id);

      // 3. Run local analysis
      const recommendations = buildEnhancementRecommendations(transcript, 0);
      await enhancementRequestsService.submitForAnalysis(request.id, currentOrganization.id, {
        analysis_summary: recommendations.business_summary,
        recommendations_json: recommendations,
        request_type: recommendations.request_classification,
        normalized_prompt: transcript.trim(),
      });

      setCreatedId(request.id);
      setStep('done');
      onCreated?.(request.id);
    } catch (err: any) {
      setError(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [currentOrganization, transcript, contextMode, durationSeconds, onCreated]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">Speak Your App</h2>
                  <p className="text-slate-400 text-xs">Voice-to-App capture for {currentOrganization?.name}</p>
                </div>
              </div>
              <button onClick={handleClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 px-6 pt-4 pb-0">
              {(['mode', 'capture', 'submit', 'done'] as Step[]).map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                    step === s ? 'bg-indigo-500 border-indigo-500 text-white' :
                    ['mode', 'capture', 'submit', 'done'].indexOf(step) > i ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' :
                    'bg-slate-800 border-slate-700 text-slate-500'
                  }`}>
                    {['mode', 'capture', 'submit', 'done'].indexOf(step) > i ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  {i < 3 && <div className={`h-px w-6 ${['mode', 'capture', 'submit', 'done'].indexOf(step) > i ? 'bg-emerald-500/50' : 'bg-slate-700'}`} />}
                </div>
              ))}
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* STEP: mode selection */}
              {step === 'mode' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-white font-semibold mb-1">What would you like to describe?</h3>
                    <p className="text-slate-400 text-sm">Choose a capture mode. Each mode prompts deeper, more useful output.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {ORDERED_MODES.map(mode => (
                      <button
                        key={mode}
                        onClick={() => setContextMode(mode)}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                          contextMode === mode
                            ? 'bg-indigo-500/10 border-indigo-500/50 text-white'
                            : 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded-full border-2 mt-0.5 flex-shrink-0 transition-all ${contextMode === mode ? 'border-indigo-400 bg-indigo-400' : 'border-slate-600'}`} />
                        <div>
                          <p className="font-medium text-sm">{VOICE_CONTEXT_LABELS[mode]}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{CONTEXT_MODE_DESCRIPTIONS[mode]}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setStep('capture')}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all"
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* STEP: capture */}
              {step === 'capture' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-white font-semibold mb-1">Start speaking</h3>
                    <p className="text-slate-400 text-sm">Press the mic and speak naturally. You can pause, resume, and edit afterwards.</p>
                  </div>
                  <VoiceCapturePanel
                    contextMode={contextMode}
                    onTranscriptReady={handleTranscriptReady}
                    onTranscriptChange={setTranscript}
                  />
                  {transcript.trim() && (
                    <button
                      onClick={() => setStep('submit')}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all mt-2"
                    >
                      Review & Submit <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <Type className="w-3.5 h-3.5" />
                    Prefer to type? You can also{' '}
                    <button className="text-indigo-400 hover:text-indigo-300 underline" onClick={() => setStep('submit')}>
                      type your request
                    </button>
                  </div>
                </div>
              )}

              {/* STEP: review & submit */}
              {step === 'submit' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-white font-semibold mb-1">Review your request</h3>
                    <p className="text-slate-400 text-sm">Edit if needed, then submit for analysis.</p>
                  </div>
                  <textarea
                    value={transcript}
                    onChange={e => setTranscript(e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm resize-none h-40 focus:outline-none focus:border-indigo-500 leading-relaxed"
                    placeholder="Your request will appear here. You can also type it directly."
                  />
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep('capture')}
                      className="px-4 py-2.5 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 rounded-xl text-sm font-medium transition-all"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !transcript.trim()}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white rounded-xl font-semibold transition-all"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                      ) : (
                        <><Sparkles className="w-4 h-4" /> Submit for Analysis</>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP: done */}
              {step === 'done' && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl">Request Submitted</h3>
                    <p className="text-slate-400 text-sm mt-2">Your voice request has been captured, analyzed, and attached to <strong className="text-white">{currentOrganization?.name}</strong>. Review it in the Enhancement Queue.</p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <button onClick={handleClose} className="px-5 py-2.5 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-sm font-medium transition-all">
                      Close
                    </button>
                    <a href={`/app/enhancements/${createdId}`} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all">
                      <Upload className="w-4 h-4" /> View Enhancement
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
