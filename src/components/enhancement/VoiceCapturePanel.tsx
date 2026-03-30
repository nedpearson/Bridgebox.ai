import { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  Edit3,
  Check,
  RefreshCw,
} from "lucide-react";
import type { VoiceContextMode } from "../../types/enhancement";
import { VOICE_CONTEXT_LABELS } from "../../types/enhancement";

interface VoiceCapturePanelProps {
  contextMode: VoiceContextMode;
  onTranscriptReady: (transcript: string, durationSeconds: number) => void;
  onTranscriptChange?: (transcript: string) => void;
  disabled?: boolean;
}

// Browser Speech Recognition
const SpeechRecognitionAPI =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export default function VoiceCapturePanel({
  contextMode,
  onTranscriptReady,
  onTranscriptChange,
  disabled = false,
}: VoiceCapturePanelProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedRef = useRef("");

  useEffect(() => {
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
    }
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      stopTimer();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_e) {
          /* SpeechRecognition race — safe to ignore */
        }
      }
    };
  }, [stopTimer]);

  const startRecording = useCallback(() => {
    if (!SpeechRecognitionAPI) return;
    setError(null);

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let interim = "";
      let finalPart = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalPart += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }

      if (finalPart) {
        accumulatedRef.current += finalPart;
        setTranscript(accumulatedRef.current);
        onTranscriptChange?.(accumulatedRef.current);
      }
      setInterimText(interim);
    };

    recognition.onerror = (event: any) => {
      if (event.error !== "aborted") {
        setError(
          `Microphone error: ${event.error}. Please check browser permissions.`,
        );
      }
      setIsRecording(false);
      setIsPaused(false);
      stopTimer();
    };

    recognition.onend = () => {
      // Auto-restart if still supposed to be recording (handles Chrome 60s limit)
      if (isRecording && !isPaused) {
        try {
          recognition.start();
        } catch (_e) {
          /* Chrome 60s auto-restart — safe to ignore */
        }
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
    startTimeRef.current = Date.now();
    setIsRecording(true);
    setIsPaused(false);
    startTimer();
  }, [isRecording, isPaused, startTimer, stopTimer, onTranscriptChange]);

  const pauseRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_e) {
        /* SpeechRecognition race — safe to ignore */
      }
    }
    setIsPaused(true);
    stopTimer();
  }, [stopTimer]);

  const resumeRecording = useCallback(() => {
    if (!recognitionRef.current) return;
    setIsPaused(false);
    try {
      recognitionRef.current.start();
    } catch (_e) {
      /* SpeechRecognition race — safe to ignore */
    }
    startTimer();
  }, [startTimer]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_e) {
        /* SpeechRecognition race — safe to ignore */
      }
      recognitionRef.current = null;
    }
    stopTimer();
    setIsRecording(false);
    setIsPaused(false);
    setInterimText("");
    const finalTranscript = accumulatedRef.current.trim();
    setTranscript(finalTranscript);
    onTranscriptReady(finalTranscript, elapsedSeconds);
  }, [stopTimer, elapsedSeconds, onTranscriptReady]);

  const handleReset = useCallback(() => {
    stopTimer();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_e) {
        /* SpeechRecognition race — safe to ignore */
      }
      recognitionRef.current = null;
    }
    accumulatedRef.current = "";
    setTranscript("");
    setInterimText("");
    setIsRecording(false);
    setIsPaused(false);
    setElapsedSeconds(0);
    setError(null);
    setIsEditing(false);
  }, [stopTimer]);

  const handleSaveEdit = useCallback(() => {
    setTranscript(editValue);
    accumulatedRef.current = editValue;
    setIsEditing(false);
    onTranscriptChange?.(editValue);
  }, [editValue, onTranscriptChange]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
        <p className="text-yellow-300 text-sm font-medium">
          Voice recording not supported in this browser.
        </p>
        <p className="text-yellow-400/70 text-xs mt-1">
          Please use Chrome or Edge, or type your request below.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Context label */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
          Mode:{" "}
          <span className="text-indigo-400">
            {VOICE_CONTEXT_LABELS[contextMode]}
          </span>
        </p>
        {transcript && !isRecording && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Start Over
          </button>
        )}
      </div>

      {/* Recording controls */}
      <div className="flex items-center gap-4">
        {!isRecording && !transcript && (
          <button
            onClick={startRecording}
            disabled={disabled}
            className="flex items-center gap-3 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/20"
          >
            <Mic className="w-5 h-5" />
            Start Recording
          </button>
        )}

        {isRecording && !isPaused && (
          <>
            <button
              onClick={pauseRecording}
              className="flex items-center gap-2 px-5 py-2.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/30 rounded-xl font-medium transition-all"
            >
              <Pause className="w-4 h-4" /> Pause
            </button>
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-xl font-medium transition-all"
            >
              <Square className="w-4 h-4" /> Stop
            </button>
          </>
        )}

        {isRecording && isPaused && (
          <>
            <button
              onClick={resumeRecording}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-xl font-medium transition-all"
            >
              <Play className="w-4 h-4" /> Resume
            </button>
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-xl font-medium transition-all"
            >
              <Square className="w-4 h-4" /> Stop
            </button>
          </>
        )}

        {isRecording && (
          <div className="flex items-center gap-2 ml-auto">
            <div
              className={`w-2.5 h-2.5 rounded-full ${isPaused ? "bg-yellow-400" : "bg-red-500 animate-pulse"}`}
            />
            <span className="text-white font-mono text-sm">
              {formatTime(elapsedSeconds)}
            </span>
          </div>
        )}
      </div>

      {/* Live transcript display */}
      {(isRecording || transcript) && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 min-h-[100px]">
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm resize-none min-h-[80px] focus:outline-none focus:border-indigo-500"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-sm font-medium transition-all"
                >
                  <Check className="w-3.5 h-3.5" /> Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                {transcript}
                {interimText && (
                  <span className="text-slate-400 italic"> {interimText}</span>
                )}
                {!transcript && !interimText && isRecording && (
                  <span className="text-slate-500 italic">Listening...</span>
                )}
              </p>
              {transcript && !isRecording && (
                <button
                  onClick={() => {
                    setEditValue(transcript);
                    setIsEditing(true);
                  }}
                  className="absolute top-0 right-0 p-1.5 text-slate-500 hover:text-indigo-400 transition-colors"
                  title="Edit transcript"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <MicOff className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Word count */}
      {transcript && (
        <p className="text-xs text-slate-500">
          {transcript.trim().split(/\s+/).filter(Boolean).length} words captured
        </p>
      )}
    </div>
  );
}
