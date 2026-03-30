import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  X,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface HuddleRoomProps {
  roomName: string;
  onClose: () => void;
}

export default function HuddleRoom({ roomName, onClose }: HuddleRoomProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Fallback to deterministic Hash URL mapping bridging ephemeral rooms dynamically
  const roomHash = btoa(roomName)
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 10);
  const wherebyUrl = `https://bridgebox-demo.whereby.com/huddle-${roomHash}?minimal=true`;

  useEffect(() => {
    // Dynamically inject the whereby embed script masking strict dependencies
    const script = document.createElement("script");
    script.src = "https://cdn.whereby.com/browser-sdk/v2.js";
    script.type = "module";
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className={`fixed bottom-6 right-6 z-[60] bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl flex flex-col transition-all duration-300 ${
        isExpanded
          ? "w-[800px] h-[600px] max-w-[90vw] max-h-[90vh]"
          : "w-[360px] h-[480px]"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 backdrop-blur border-b border-slate-700/50 cursor-move">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-semibold text-white">Live Huddle</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-400">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:text-white hover:bg-slate-700 rounded transition-colors"
          >
            {isExpanded ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-1 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 bg-black relative">
        {/* @ts-ignore - Whereby Web Component */}
        <whereby-embed
          room={wherebyUrl}
          style={{ width: "100%", height: "100%" }}
          minimal="true"
          audio="on"
          video="on"
        />
      </div>
    </motion.div>
  );
}
