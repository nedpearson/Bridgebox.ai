/**
 * VoiceCaptureMini — lightweight voice capture for onboarding/wizard contexts.
 * A simplified version of VoiceCapturePanel with minimal dependencies,
 * designed for contexts where a full modal/flow manages state externally.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, Square, Pause, Play, RefreshCw, Edit3, Check } from 'lucide-react';

interface VoiceCaptureMiniProps {
  transcript: string;
  onTranscriptChange: (t: string) => void;
  placeholder?: string;
}

const SpeechRecognitionAPI =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export function VoiceCaptureMini({ transcript, onTranscriptChange, placeholder }: VoiceCaptureMiniProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused]   = useState(false);
  const [interim, setInterim]     = useState('');
  const [elapsed, setElapsed]     = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [error, setError]         = useState<string | null>(null);
  const [supported]               = useState(!!SpeechRecognitionAPI);

  const recognitionRef = useRef<any>(null);
  const timerRef       = useRef<ReturnType<typeof setInterval> | null>(null);
  const accumulated    = useRef(transcript);

  // Keep accumulated in sync with external transcript on mount
  useEffect(() => { accumulated.current = transcript; }, []);

  const startTimer = () => {
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
  };
  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  useEffect(() => () => { stopTimer(); recognitionRef.current?.stop?.(); }, []);

  const startRecording = useCallback(() => {
    if (!SpeechRecognitionAPI) return;
    setError(null);
    const rec = new SpeechRecognitionAPI();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (e: any) => {
      let fin = '', inter = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        e.results[i].isFinal ? (fin += e.results[i][0].transcript + ' ') : (inter += e.results[i][0].transcript);
      }
      if (fin) { accumulated.current += fin; onTranscriptChange(accumulated.current); }
      setInterim(inter);
    };
    rec.onerror = (e: any) => {
      if (e.error !== 'aborted') setError(`Microphone error: ${e.error}`);
      setIsRecording(false); setIsPaused(false); stopTimer();
    };
    rec.onend = () => {
      if (isRecording && !isPaused) try { rec.start(); } catch {}
    };

    rec.start();
    recognitionRef.current = rec;
    setIsRecording(true); setIsPaused(false); startTimer();
  }, [isRecording, isPaused, onTranscriptChange]);

  const pause = useCallback(() => {
    recognitionRef.current?.stop?.();
    setIsPaused(true); stopTimer();
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
    try { recognitionRef.current?.start?.(); } catch {}
    startTimer();
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop?.();
    recognitionRef.current = null;
    stopTimer(); setIsRecording(false); setIsPaused(false); setInterim('');
    onTranscriptChange(accumulated.current.trim());
  }, [onTranscriptChange]);

  const reset = useCallback(() => {
    stop();
    accumulated.current = '';
    setElapsed(0); setError(null); setIsEditing(false);
    onTranscriptChange('');
  }, [stop, onTranscriptChange]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  if (!supported) {
    return (
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
        <p className="text-amber-300 text-sm font-medium">Voice recording requires Chrome or Edge.</p>
        <p className="text-amber-400/60 text-xs mt-1">You can type your response in the text area below instead.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center gap-3">
        {!isRecording && !transcript && (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-500/20"
          >
            <Mic className="w-4 h-4" /> Start Recording
          </button>
        )}
        {isRecording && !isPaused && (
          <>
            <button onClick={pause} className="flex items-center gap-2 px-4 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/25 rounded-xl text-sm font-medium transition-all">
              <Pause className="w-4 h-4" /> Pause
            </button>
            <button onClick={stop} className="flex items-center gap-2 px-4 py-2 bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/25 rounded-xl text-sm font-medium transition-all">
              <Square className="w-4 h-4" /> Stop
            </button>
          </>
        )}
        {isRecording && isPaused && (
          <>
            <button onClick={resume} className="flex items-center gap-2 px-4 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/25 rounded-xl text-sm font-medium transition-all">
              <Play className="w-4 h-4" /> Resume
            </button>
            <button onClick={stop} className="flex items-center gap-2 px-4 py-2 bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/25 rounded-xl text-sm font-medium transition-all">
              <Square className="w-4 h-4" /> Stop
            </button>
          </>
        )}
        {isRecording && (
          <div className="ml-auto flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-red-500 animate-pulse'}`} />
            <span className="text-white text-sm font-mono">{fmt(elapsed)}</span>
          </div>
        )}
        {!isRecording && transcript && (
          <button onClick={reset} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors ml-auto">
            <RefreshCw className="w-3 h-3" /> Start Over
          </button>
        )}
      </div>

      {/* Transcript / edit area */}
      {(isRecording || transcript) && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 min-h-[100px]">
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                autoFocus
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm resize-none min-h-[80px] focus:outline-none focus:border-indigo-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    accumulated.current = editValue;
                    onTranscriptChange(editValue);
                    setIsEditing(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-sm font-medium transition-all"
                >
                  <Check className="w-3.5 h-3.5" /> Save
                </button>
                <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-slate-400 hover:text-white text-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                {transcript}
                {interim && <span className="text-slate-400 italic"> {interim}</span>}
                {!transcript && !interim && isRecording && <span className="text-slate-500 italic">{placeholder || 'Listening…'}</span>}
              </p>
              {transcript && !isRecording && (
                <button
                  onClick={() => { setEditValue(transcript); setIsEditing(true); }}
                  className="absolute top-0 right-0 p-1.5 text-slate-500 hover:text-indigo-400 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <MicOff className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {transcript && (
        <p className="text-xs text-slate-500">
          {transcript.trim().split(/\s+/).filter(Boolean).length} words captured
        </p>
      )}
    </div>
  );
}
