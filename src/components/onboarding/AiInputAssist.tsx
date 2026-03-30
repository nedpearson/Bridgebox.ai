import React, { useState, useRef, useEffect } from "react";
import { Mic, Sparkles, StopCircle, Loader2 } from "lucide-react";

interface AiInputAssistProps {
  value: string;
  onChange: (val: string) => void;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  type?: string;
  list?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export default function AiInputAssist({
  value,
  onChange,
  multiline = false,
  placeholder,
  className = "",
  type = "text",
  list,
  onFocus,
  onBlur,
}: AiInputAssistProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          onChange((value ? value + " " : "") + finalTranscript.trim());
        }
      };

      recognitionRef.current.onerror = () => setIsRecording(false);
      recognitionRef.current.onend = () => setIsRecording(false);
    }
    return () => recognitionRef.current?.stop();
  }, [value, onChange]);

  const handleMic = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Mic error:", err);
      }
    }
  };

  const handleEnhance = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    setIsEnhancing(true);
    try {
      // Mocking edge-function local execution for immediate UI testing.
      // In production this would invoke supabase.functions.invoke('ai-orchestrator', { ... })
      setTimeout(() => {
        onChange(
          `${value}. We operate as a distinguished, professional organization executing world-class solutions across this sector.`,
        );
        setIsEnhancing(false);
      }, 1200);
    } catch (err) {
      console.error(err);
      setIsEnhancing(false);
    }
  };

  return (
    <div className="relative group w-full">
      {multiline ? (
        <textarea
          data-lpignore="true"
          data-form-type="other"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`${className} pr-20`}
          rows={5}
        />
      ) : (
        <input
          data-lpignore="true"
          data-form-type="other"
          autoComplete="off"
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          list={list}
          className={`${className} pr-20`}
        />
      )}

      <div
        className={`absolute right-2 flex items-center space-x-1 transition-opacity ${isRecording ? "opacity-100" : "opacity-40 group-hover:opacity-100"} ${multiline ? "top-3" : "top-1/2 -translate-y-1/2"}`}
      >
        <button
          onClick={handleMic}
          type="button"
          className={`p-1.5 rounded-md transition-colors ${isRecording ? "text-red-400 animate-pulse bg-red-400/10 hover:bg-red-400/20" : "text-slate-400 hover:text-indigo-400 hover:bg-slate-700/50"}`}
          title="Voice Dictation"
        >
          {isRecording ? (
            <StopCircle className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={handleEnhance}
          type="button"
          disabled={!value.trim() || isEnhancing}
          className={`p-1.5 rounded-md hover:bg-slate-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isEnhancing ? "text-amber-400" : "text-slate-400 hover:text-amber-400"}`}
          title="AI Professionalize"
        >
          {isEnhancing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
