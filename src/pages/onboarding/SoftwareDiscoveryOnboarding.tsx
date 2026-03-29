import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, Type, Video, ArrowRight, ArrowLeft, CheckCircle2,
  Plus, X, Wand2, Sparkles, Layers, Zap, Users,
  ChevronRight, Upload, FileVideo, Loader2, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { workspaceProfilesService } from '../../lib/db/workspaceProfiles';
import { enhancementRequestsService } from '../../lib/db/enhancementRequests';
import { enhancementMediaService } from '../../lib/db/enhancementMedia';
import { VoiceCaptureMini } from '../../components/enhancement/VoiceCaptureMini';
import { useEntitlements } from '../../hooks/useEntitlements';
import { creditsService } from '../../lib/db/credits';
import { usageEventsService } from '../../lib/db/usageEvents';
import LockedFeaturePanel from '../../components/billing/LockedFeaturePanel';
import UpgradeNudge from '../../components/billing/UpgradeNudge';

// ─── Types ────────────────────────────────────────────────────────────────────

type EntryMode = 'voice' | 'type' | 'recording' | null;

interface SoftwareItem {
  name: string;
  category: string;
  keep: 'keep' | 'improve' | 'remove' | '';
  notes: string;
}

interface DiscoveryData {
  entryMode: EntryMode;
  voiceTranscript: string;
  recordingFiles: File[];
  currentSoftware: SoftwareItem[];
  keepFeatures: string[];
  improveFeatures: string[];
  removeFeatures: string[];
  requiredIntegrations: string[];
  workflowNotes: string;
  userRoles: string[];
  dashboardPreferences: string;
  painPoints: string;
  idealOutcome: string;
  industryContext: string;
}

const INITIAL_DATA: DiscoveryData = {
  entryMode: null,
  voiceTranscript: '',
  recordingFiles: [],
  currentSoftware: [{ name: '', category: '', keep: '', notes: '' }],
  keepFeatures: [''],
  improveFeatures: [''],
  removeFeatures: [''],
  requiredIntegrations: [''],
  workflowNotes: '',
  userRoles: [''],
  dashboardPreferences: '',
  painPoints: '',
  idealOutcome: '',
  industryContext: '',
};

const SOFTWARE_CATEGORIES = [
  'CRM', 'ERP', 'Accounting', 'Project Management', 'Communication',
  'HR / Payroll', 'Document Management', 'Analytics / BI', 'E-Commerce',
  'Customer Support', 'Marketing', 'Scheduling', 'Inventory', 'Other'
];

const DASHBOARD_PREFS = [
  'Overview / Command Center', 'Client / Customer View', 'Revenue & Financial',
  'Task & Project Board', 'Real-Time Alerts', 'Team Performance', 'Custom KPIs'
];

// ─── Step config ─────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'How do you want to start?', icon: Wand2 },
  { id: 2, label: 'Your Current Software', icon: Layers },
  { id: 3, label: 'Keep · Improve · Remove', icon: CheckCircle2 },
  { id: 4, label: 'Integrations & Workflows', icon: Zap },
  { id: 5, label: 'Your Team & Dashboard', icon: Users },
  { id: 6, label: 'Your Ideal Outcome', icon: Sparkles },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function addItem<T>(arr: T[], empty: T): T[] { return [...arr, empty]; }
function removeItem<T>(arr: T[], i: number): T[] { return arr.filter((_, idx) => idx !== i); }
function updateItem<T>(arr: T[], i: number, val: T): T[] {
  const next = [...arr]; next[i] = val; return next;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TagInput({
  items, onChange, placeholder, color = 'indigo'
}: { items: string[]; onChange: (v: string[]) => void; placeholder: string; color?: string }) {
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
    red: 'bg-red-500/10 border-red-500/20 text-red-300',
  };
  const tagStyle = colorMap[color] || colorMap.indigo;
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="text"
            value={item}
            onChange={e => onChange(updateItem(items, i, e.target.value))}
            placeholder={placeholder}
            className="flex-1 bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
          />
          {items.length > 1 && (
            <button onClick={() => onChange(removeItem(items, i))} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
      <button
        onClick={() => onChange(addItem(items, ''))}
        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border ${tagStyle} transition-colors`}
      >
        <Plus className="w-3 h-3" /> Add another
      </button>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-700 text-slate-400 uppercase tracking-widest mb-3">{children}</p>;
}

function StepCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-8"
    >
      {children}
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SoftwareDiscoveryOnboarding() {
  const navigate = useNavigate();
  const { currentOrganization, user } = useAuth();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<DiscoveryData>(INITIAL_DATA);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [creditWarning, setCreditWarning] = useState(false);

  // Entitlements
  const entitlements = useEntitlements();
  const hasRecordingAccess = entitlements.can('screen_recording_analysis');

  const update = useCallback((patch: Partial<DiscoveryData>) => {
    setData(prev => ({ ...prev, ...patch }));
  }, []);

  const goNext = () => setStep(s => Math.min(s + 1, STEPS.length));
  const goBack = () => setStep(s => Math.max(s - 1, 1));

  // ── Final submit ──
  const handleComplete = async () => {
    if (!currentOrganization) return;
    setSaving(true);
    try {
      // Consume credits for voice blueprint request
      const creditResult = await creditsService.consumeCredits(
        currentOrganization.id,
        'voice_blueprint_request',
        (user as any)?.id
      );
      if (!creditResult.success) {
        setCreditWarning(true);
        setSaving(false);
        return;
      }

      // Track usage event
      void usageEventsService.track(currentOrganization.id, 'voice_request', {
        userId: (user as any)?.id,
        creditCost: 5,
      });

      const stack = data.currentSoftware
        .filter(s => s.name.trim())
        .map(s => `${s.name}${s.category ? ` (${s.category})` : ''}`);

      await workspaceProfilesService.update(currentOrganization.id, {
        current_software_stack: stack,
        must_keep_features: data.keepFeatures.filter(Boolean),
        must_remove_features: data.removeFeatures.filter(Boolean),
        required_integrations: data.requiredIntegrations.filter(Boolean),
        preferred_ux_style: data.dashboardPreferences,
        workflow_rules: data.userRoles.filter(Boolean),
        approval_processes: data.workflowNotes ? [data.workflowNotes] : [],
        industry_context: data.industryContext || undefined,
      });

      const discoveryTranscript = buildTranscript(data);

      const req = await enhancementRequestsService.create({
        workspaceId: currentOrganization.id,
        title: `Software Discovery: ${currentOrganization.name}`,
        inputMethod: data.entryMode === 'voice' ? 'voice' : data.entryMode === 'recording' ? 'recording' : 'text',
        transcript: discoveryTranscript,
        originalPrompt: data.idealOutcome,
      });

      // Upload any recording files captured on Step 1
      if (data.recordingFiles.length > 0) {
        await Promise.allSettled(
          data.recordingFiles.map(file =>
            enhancementMediaService.upload({
              file,
              workspaceId: currentOrganization.id,
              enhancementRequestId: req.id,
              annotation: 'Uploaded via Software Discovery onboarding',
            })
          )
        );
      }

      setDone(true);
      setTimeout(() => navigate('/app/enhancements'), 2500);
    } catch (err) {
      console.error('Discovery save failed', err);
    } finally {
      setSaving(false);
    }
  };

  if (done) return <CompletionScreen orgName={currentOrganization?.name} />;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Premium top bar */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
              <Wand2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-base">Software Discovery</span>
            <span className="text-slate-500 text-sm hidden sm:inline">· Bridgebox Voice Intelligence™</span>
          </div>
          <div className="flex items-center gap-1.5">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  s.id < step ? 'bg-indigo-500' : s.id === step ? 'bg-indigo-400 w-4' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-12">
        {/* Step label */}
        <motion.div
          key={step}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-2">
            Step {step} of {STEPS.length}
          </p>
          <h1 className="text-2xl font-bold text-white">{STEPS[step - 1].label}</h1>
        </motion.div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          {step === 1 && <Step1EntryMode key="s1" data={data} update={update} onNext={goNext} />}
          {step === 2 && <Step2CurrentSoftware key="s2" data={data} update={update} />}
          {step === 3 && <Step3KeepImproveRemove key="s3" data={data} update={update} />}
          {step === 4 && <Step4Integrations key="s4" data={data} update={update} />}
          {step === 5 && <Step5TeamDashboard key="s5" data={data} update={update} />}
          {step === 6 && <Step6Outcome key="s6" data={data} update={update} />}
        </AnimatePresence>

        {/* Credit warnings */}
        {creditWarning && (
          <div className="mt-4">
            <UpgradeNudge
              trigger="critical_credits"
              creditsRemaining={0}
              onDismiss={() => setCreditWarning(false)}
            />
          </div>
        )}
        {!creditWarning && entitlements.credits.isLow && !entitlements.credits.isUnlimited && (
          <div className="mt-4">
            <UpgradeNudge
              trigger="low_credits"
              creditsRemaining={entitlements.credits.balance}
            />
          </div>
        )}

        {/* Navigation */}
        {step > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {step < STEPS.length ? (
              <button
                onClick={goNext}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-500/20"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={saving || entitlements.credits.isCritical}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-60"
                title={entitlements.credits.isCritical ? 'Insufficient AI credits' : undefined}
              >
                {saving ? 'Saving Profile...' : 'Generate My Software Blueprint'}
                <Sparkles className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Guided Voice Prompts ─────────────────────────────────────────────────────

const VOICE_PROMPTS = [
  { label: 'Start here', text: 'Tell us the names of every software tool your team uses today, even ones you dislike.' },
  { label: 'What works', text: 'Which features or workflows do you absolutely depend on and never want to lose?' },
  { label: 'What frustrates you', text: 'What wastes the most time? What\'s broken, confusing, or just painful every day?' },
  { label: 'Your team', text: 'Who uses your software? Describe each role — what do they need to see and do every day?' },
  { label: 'Ideal outcome', text: 'If your perfect system existed today, what would it let you do that you can\'t do now?' },
  { label: 'Integrations', text: 'What other tools or systems must your new software connect to? Payments, accounting, email, etc.' },
];

function GuidedPromptCards({ isRecording }: { isRecording: boolean }) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (!isRecording) return;
    const timer = setInterval(() => {
      setActiveIdx(i => (i + 1) % VOICE_PROMPTS.length);
    }, 18000); // Rotate every 18s
    return () => clearInterval(timer);
  }, [isRecording]);

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">
        {isRecording ? 'Guided prompts — rotating automatically' : 'What to cover'}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {VOICE_PROMPTS.map((p, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            className={`p-3 rounded-xl text-left border transition-all ${
              i === activeIdx
                ? 'bg-indigo-500/15 border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                : 'bg-slate-800/40 border-slate-700/40 hover:border-slate-600'
            }`}
          >
            <p className={`text-xs font-bold mb-1 ${i === activeIdx ? 'text-indigo-400' : 'text-slate-500'}`}>
              {p.label}
            </p>
            <p className={`text-xs leading-relaxed ${i === activeIdx ? 'text-slate-200' : 'text-slate-500'}`}>
              {p.text}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Recording Upload Panel ───────────────────────────────────────────────────

function RecordingUploadPanel({
  files,
  onFilesChange,
  onNext,
}: {
  files: File[];
  onFilesChange: (f: File[]) => void;
  onNext: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (newFiles: File[]) => {
    const valid = newFiles.filter(f =>
      f.type.startsWith('video/') || f.type.startsWith('image/') || f.type.startsWith('audio/')
    );
    onFilesChange([...files, ...valid]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="mt-6 space-y-5"
    >
      <div className="p-4 bg-violet-500/5 border border-violet-500/20 rounded-2xl">
        <p className="text-violet-300 text-sm font-semibold mb-1">What to record</p>
        <p className="text-slate-400 text-xs leading-relaxed">
          Screen recordings of your current software in action are most valuable.
          Show us your dashboards, workflows, forms, reports — anything your team uses daily.
          Screenshots and audio are also accepted.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          dragging
            ? 'border-violet-500/60 bg-violet-500/10'
            : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/30'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="video/*,image/*,audio/*"
          className="hidden"
          onChange={e => addFiles(Array.from(e.target.files || []))}
        />
        <Upload className="w-8 h-8 text-slate-500 mx-auto mb-3" />
        <p className="text-slate-300 text-sm font-medium">Drop recordings here, or click to browse</p>
        <p className="text-slate-600 text-xs mt-1">MP4, MOV, WebM, PNG, JPG, MP3 · Max 2GB each</p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl">
              <FileVideo className="w-4 h-4 text-violet-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">{f.name}</p>
                <p className="text-slate-500 text-xs">{formatSize(f.size)}</p>
              </div>
              <button
                onClick={() => onFilesChange(files.filter((_, idx) => idx !== i))}
                className="p-1 text-slate-600 hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={onNext}
            className="mt-2 w-full flex items-center justify-center gap-2 px-5 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold text-sm transition-all"
          >
            Continue with {files.length} recording{files.length > 1 ? 's' : ''} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {files.length === 0 && (
        <button
          onClick={onNext}
          className="w-full text-center text-xs text-slate-600 hover:text-slate-400 transition-colors py-2"
        >
          Skip and continue without uploading
        </button>
      )}
    </motion.div>
  );
}

// ─── Step 1: Entry Mode Selection ─────────────────────────────────────────────

function Step1EntryMode({
  data, update, onNext
}: { data: DiscoveryData; update: (p: Partial<DiscoveryData>) => void; onNext: () => void }) {
  const modes = [
    {
      id: 'voice' as EntryMode,
      icon: Mic,
      title: 'Talk me through it',
      desc: 'Speak naturally about your current software, workflows, and what you want. Guided prompts keep you on track.',
      badge: 'Recommended',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      iconBg: 'bg-indigo-600',
      border: 'border-indigo-500/40',
      gradient: 'from-indigo-600/10 to-violet-600/5',
    },
    {
      id: 'type' as EntryMode,
      icon: Type,
      title: 'Write it out',
      desc: 'Prefer typing? Describe your software stack, what you want to keep, and your ideal workflow at your own pace.',
      badge: 'Flexible',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      iconBg: 'bg-cyan-600',
      border: 'border-cyan-500/30',
      gradient: 'from-cyan-600/5 to-slate-900',
    },
    {
      id: 'recording' as EntryMode,
      icon: Video,
      title: 'Show us your screen',
      desc: 'Upload recordings of your current software in action. We extract workflows, features, and UI patterns automatically.',
      badge: 'Deep Analysis',
      badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
      iconBg: 'bg-violet-600',
      border: 'border-violet-500/30',
      gradient: 'from-violet-600/5 to-slate-900',
    },
  ];

  const [voiceTranscript, setVoiceTranscript] = useState(data.voiceTranscript);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);

  const handleSelect = (mode: EntryMode) => {
    update({ entryMode: mode, voiceTranscript });
    if (mode === 'type') onNext();
  };

  return (
    <StepCard>
      <p className="text-slate-400 text-sm mb-8 max-w-lg">
        Choose how you'd like to describe your current software and workflows. You can mix methods — 
        we'll combine everything into your Workspace Intelligence Profile.
      </p>
      <div className="space-y-4">
        {modes.map((m) => (
          <motion.button
            key={m.id}
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.998 }}
            onClick={() => handleSelect(m.id)}
            className={`w-full flex items-start gap-5 p-5 bg-gradient-to-r ${m.gradient} border ${
              data.entryMode === m.id ? m.border : 'border-slate-700/50'
            } rounded-2xl text-left transition-all hover:border-slate-600 group`}
          >
            <div className={`w-12 h-12 ${m.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
              <m.icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-white font-semibold">{m.title}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${m.badgeColor}`}>
                  {m.badge}
                </span>
              </div>
              <p className="text-slate-400 text-sm">{m.desc}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 flex-shrink-0 mt-0.5 transition-colors" />
          </motion.button>
        ))}
      </div>

      {/* Voice panel */}
      <AnimatePresence>
        {data.entryMode === 'voice' && (
          <motion.div
            key="voice-panel"
            id="voice-recording-panel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-6 p-5 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl space-y-6"
          >
            <div>
              <p className="text-indigo-300 text-sm font-semibold mb-1">Recording session</p>
              <p className="text-slate-500 text-xs">Speak freely — the prompts below will guide you through each topic automatically.</p>
            </div>
            <GuidedPromptCards isRecording={isVoiceRecording} />
            <VoiceCaptureMini
              transcript={voiceTranscript}
              onTranscriptChange={(t) => { setVoiceTranscript(t); update({ voiceTranscript: t }); }}
              placeholder="Follow the prompts above and speak naturally. We'll extract every detail."
            />
            {voiceTranscript.length > 30 && (
              <button
                onClick={onNext}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm transition-all"
              >
                Continue with this transcript <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording upload panel */}
      <AnimatePresence>
        {data.entryMode === 'recording' && (
          <motion.div key="recording-panel">
            <RecordingUploadPanel
              files={data.recordingFiles}
              onFilesChange={(f) => update({ recordingFiles: f })}
              onNext={onNext}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </StepCard>
  );
}

// ─── Step 2: Current Software Stack ──────────────────────────────────────────

function Step2CurrentSoftware({
  data, update
}: { data: DiscoveryData; update: (p: Partial<DiscoveryData>) => void }) {
  const setSoftware = (sw: SoftwareItem[]) => update({ currentSoftware: sw });

  return (
    <StepCard>
      <p className="text-slate-400 text-sm mb-6 max-w-xl">
        List every tool and platform your team currently uses — even ones you hate. We need the full picture
        to build something genuinely better.
      </p>
      <div className="space-y-3 mb-4">
        {data.currentSoftware.map((sw, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-start p-4 bg-slate-800/40 border border-slate-700/40 rounded-xl">
            <div className="col-span-4">
              <input
                type="text"
                placeholder="Tool name (e.g. Salesforce)"
                value={sw.name}
                onChange={e => setSoftware(updateItem(data.currentSoftware, i, { ...sw, name: e.target.value }))}
                className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
              />
            </div>
            <div className="col-span-3">
              <select
                value={sw.category}
                onChange={e => setSoftware(updateItem(data.currentSoftware, i, { ...sw, category: e.target.value }))}
                className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
              >
                <option value="">Category</option>
                {SOFTWARE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-span-4">
              <input
                type="text"
                placeholder="Notes (optional)"
                value={sw.notes}
                onChange={e => setSoftware(updateItem(data.currentSoftware, i, { ...sw, notes: e.target.value }))}
                className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
              />
            </div>
            <div className="col-span-1 flex justify-end pt-1">
              {data.currentSoftware.length > 1 && (
                <button
                  onClick={() => setSoftware(removeItem(data.currentSoftware, i))}
                  className="p-1.5 text-slate-600 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => setSoftware(addItem(data.currentSoftware, { name: '', category: '', keep: '', notes: '' }))}
        className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
      >
        <Plus className="w-4 h-4" /> Add another tool
      </button>

      <div className="mt-6 pt-5 border-t border-slate-700/50">
        <SectionLabel>Overall context</SectionLabel>
        <p className="text-slate-400 text-xs mb-3">Anything else about how your team works day-to-day?</p>
        <textarea
          rows={3}
          value={data.workflowNotes}
          onChange={e => update({ workflowNotes: e.target.value })}
          placeholder="e.g. Our team switches between 4 tools daily. Everything gets manually copied into a spreadsheet at end of day..."
          className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 placeholder:text-slate-500 resize-none"
        />
      </div>
      <NavigationHint />
    </StepCard>
  );
}

// ─── Step 3: Keep / Improve / Remove ─────────────────────────────────────────

function Step3KeepImproveRemove({
  data, update
}: { data: DiscoveryData; update: (p: Partial<DiscoveryData>) => void }) {
  return (
    <StepCard>
      <p className="text-slate-400 text-sm mb-8 max-w-xl">
        This is the most important step. Be specific — even small details here shape the entire blueprint.
      </p>
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
            <SectionLabel>What must be kept exactly as-is</SectionLabel>
          </div>
          <p className="text-slate-500 text-xs mb-3">Workflows, screen layouts, reports, or processes that work well and your team depends on.</p>
          <TagInput
            items={data.keepFeatures}
            onChange={v => update({ keepFeatures: v })}
            placeholder="e.g. The weekly invoice generation report"
            color="emerald"
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <SectionLabel>What needs to be improved or rebuilt</SectionLabel>
          </div>
          <p className="text-slate-500 text-xs mb-3">Features you like but that are slow, cumbersome, or only partially working.</p>
          <TagInput
            items={data.improveFeatures}
            onChange={v => update({ improveFeatures: v })}
            placeholder="e.g. The lead pipeline view — too many clicks to update"
            color="amber"
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
              <X className="w-3 h-3 text-white" />
            </div>
            <SectionLabel>What should be completely removed</SectionLabel>
          </div>
          <p className="text-slate-500 text-xs mb-3">Tools, screens, or workflows that nobody uses, that create confusion, or that duplicate work.</p>
          <TagInput
            items={data.removeFeatures}
            onChange={v => update({ removeFeatures: v })}
            placeholder="e.g. The manual weekly PDF export — nobody reads it"
            color="red"
          />
        </div>

        <div className="pt-4 border-t border-slate-700/50">
          <SectionLabel>Biggest pain points right now</SectionLabel>
          <textarea
            rows={3}
            value={data.painPoints}
            onChange={e => update({ painPoints: e.target.value })}
            placeholder="What frustrates your team the most on a daily basis? What wastes the most time?"
            className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 placeholder:text-slate-500 resize-none"
          />
        </div>
      </div>
      <NavigationHint />
    </StepCard>
  );
}

// ─── Step 4: Integrations & Workflows ────────────────────────────────────────

function Step4Integrations({
  data, update
}: { data: DiscoveryData; update: (p: Partial<DiscoveryData>) => void }) {
  return (
    <StepCard>
      <div className="space-y-8">
        <div>
          <SectionLabel>Required integrations</SectionLabel>
          <p className="text-slate-400 text-xs mb-4">
            What external systems must your new software connect to? APIs, payment processors, ERPs, accounting tools, etc.
          </p>
          <TagInput
            items={data.requiredIntegrations}
            onChange={v => update({ requiredIntegrations: v })}
            placeholder="e.g. QuickBooks, Stripe, Shopify, Outlook"
            color="indigo"
          />
        </div>

        <div className="pt-4 border-t border-slate-700/50">
          <SectionLabel>Industry context</SectionLabel>
          <p className="text-slate-400 text-xs mb-3">
            What industry or niche are you in? This helps us tailor terminology, compliance, and workflow patterns.
          </p>
          <input
            type="text"
            value={data.industryContext}
            onChange={e => update({ industryContext: e.target.value })}
            placeholder="e.g. Commercial Real Estate, Healthcare Staffing, E-Commerce Brand"
            className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
          />
        </div>
      </div>
      <NavigationHint />
    </StepCard>
  );
}

// ─── Step 5: Team & Dashboard Preferences ────────────────────────────────────

function Step5TeamDashboard({
  data, update
}: { data: DiscoveryData; update: (p: Partial<DiscoveryData>) => void }) {
  const togglePref = (pref: string) => {
    const current = data.dashboardPreferences.split(',').map(s => s.trim()).filter(Boolean);
    const next = current.includes(pref)
      ? current.filter(p => p !== pref)
      : [...current, pref];
    update({ dashboardPreferences: next.join(', ') });
  };

  const selectedPrefs = data.dashboardPreferences.split(',').map(s => s.trim()).filter(Boolean);

  return (
    <StepCard>
      <div className="space-y-8">
        <div>
          <SectionLabel>Who uses your software?</SectionLabel>
          <p className="text-slate-400 text-xs mb-4">
            List the roles or teams that will use this system. Be specific — a salesperson needs different views than an accountant.
          </p>
          <TagInput
            items={data.userRoles}
            onChange={v => update({ userRoles: v })}
            placeholder="e.g. Sales Manager, Customer Support, Finance Team"
            color="indigo"
          />
        </div>

        <div className="pt-4 border-t border-slate-700/50">
          <SectionLabel>What should the main dashboard show first?</SectionLabel>
          <p className="text-slate-400 text-xs mb-4">
            Select everything that matters. The most important thing should be impossible to miss on day one.
          </p>
          <div className="flex flex-wrap gap-2">
            {DASHBOARD_PREFS.map(pref => {
              const selected = selectedPrefs.includes(pref);
              return (
                <button
                  key={pref}
                  onClick={() => togglePref(pref)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition-all ${
                    selected
                      ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                >
                  {selected && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5 text-indigo-400" />}
                  {pref}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <NavigationHint />
    </StepCard>
  );
}

// ─── Step 6: Ideal Outcome ────────────────────────────────────────────────────

function Step6Outcome({
  data, update
}: { data: DiscoveryData; update: (p: Partial<DiscoveryData>) => void }) {
  return (
    <StepCard>
      <p className="text-slate-400 text-sm mb-8 max-w-xl">
        The last step. Describe exactly what success looks like for your team — in your own words.
        There are no wrong answers. This becomes the foundation of your custom software blueprint.
      </p>
      <div className="space-y-6">
        <div>
          <SectionLabel>Describe your ideal system</SectionLabel>
          <p className="text-slate-400 text-xs mb-3">
            If your perfect software already existed today — what would it do? How would your team use it differently?
            What problem would finally be solved?
          </p>
          <textarea
            rows={6}
            value={data.idealOutcome}
            onChange={e => update({ idealOutcome: e.target.value })}
            placeholder="e.g. I want a single screen where I can see all active clients, their outstanding invoices, open tasks, and last communication — without switching between 3 different tools. I want my team to be able to add notes from their phone..."
            className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 placeholder:text-slate-500 resize-none"
          />
        </div>

        {/* Summary preview */}
        <div className="p-5 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 border border-indigo-500/15 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <p className="text-indigo-300 text-sm font-semibold">Your profile snapshot</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <PreviewRow label="Software stack" value={`${data.currentSoftware.filter(s => s.name).length} tools captured`} />
            <PreviewRow label="Keep features" value={`${data.keepFeatures.filter(Boolean).length} defined`} />
            <PreviewRow label="Improve areas" value={`${data.improveFeatures.filter(Boolean).length} defined`} />
            <PreviewRow label="Remove items" value={`${data.removeFeatures.filter(Boolean).length} defined`} />
            <PreviewRow label="Integrations" value={`${data.requiredIntegrations.filter(Boolean).length} required`} />
            <PreviewRow label="User roles" value={`${data.userRoles.filter(Boolean).length} defined`} />
          </div>
        </div>
      </div>
    </StepCard>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-700/30">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-300 font-medium">{value}</span>
    </div>
  );
}

function NavigationHint() {
  return (
    <p className="text-slate-600 text-xs mt-6 text-center">
      You can go back and edit any step before submitting.
    </p>
  );
}

function CompletionScreen({ orgName }: { orgName?: string }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-lg px-8"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">
          Workspace Profile Created
        </h1>
        <p className="text-slate-400 mb-2">
          {orgName ? `${orgName}'s` : 'Your'} software intelligence profile has been saved.
          Bridgebox is generating your custom software blueprint now.
        </p>
        <p className="text-slate-600 text-sm">Redirecting to your Build Queue…</p>
      </motion.div>
    </div>
  );
}

// ─── Transcript builder ───────────────────────────────────────────────────────

function buildTranscript(data: DiscoveryData): string {
  const lines: string[] = [];
  if (data.voiceTranscript) lines.push(`[Voice Input]\n${data.voiceTranscript}\n`);
  if (data.currentSoftware.some(s => s.name)) {
    lines.push('[Current Software Stack]');
    data.currentSoftware.filter(s => s.name).forEach(s => {
      lines.push(`- ${s.name}${s.category ? ` (${s.category})` : ''}${s.notes ? `: ${s.notes}` : ''}`);
    });
    lines.push('');
  }
  if (data.keepFeatures.filter(Boolean).length) {
    lines.push('[Must Keep]');
    data.keepFeatures.filter(Boolean).forEach(f => lines.push(`- ${f}`));
    lines.push('');
  }
  if (data.improveFeatures.filter(Boolean).length) {
    lines.push('[Must Improve]');
    data.improveFeatures.filter(Boolean).forEach(f => lines.push(`- ${f}`));
    lines.push('');
  }
  if (data.removeFeatures.filter(Boolean).length) {
    lines.push('[Remove / Eliminate]');
    data.removeFeatures.filter(Boolean).forEach(f => lines.push(`- ${f}`));
    lines.push('');
  }
  if (data.painPoints) lines.push(`[Pain Points]\n${data.painPoints}\n`);
  if (data.requiredIntegrations.filter(Boolean).length) {
    lines.push('[Required Integrations]');
    data.requiredIntegrations.filter(Boolean).forEach(i => lines.push(`- ${i}`));
    lines.push('');
  }
  if (data.industryContext) lines.push(`[Industry]\n${data.industryContext}\n`);
  if (data.userRoles.filter(Boolean).length) {
    lines.push('[User Roles]');
    data.userRoles.filter(Boolean).forEach(r => lines.push(`- ${r}`));
    lines.push('');
  }
  if (data.dashboardPreferences) lines.push(`[Dashboard Preferences]\n${data.dashboardPreferences}\n`);
  if (data.idealOutcome) lines.push(`[Ideal Outcome]\n${data.idealOutcome}\n`);
  if (data.workflowNotes) lines.push(`[Workflow Context]\n${data.workflowNotes}\n`);
  return lines.join('\n');
}
