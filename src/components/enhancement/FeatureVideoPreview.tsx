import { useState, useEffect } from "react";
import { motion, useAnimationControls } from "framer-motion";
import {
  Play,
  Pause,
  Maximize2,
  Volume2,
  Settings,
  MousePointer2,
  LayoutDashboard,
  Users,
  CreditCard,
  Activity,
  ArrowRight,
  X,
  Video,
  Sparkles,
} from "lucide-react";

export default function FeatureVideoPreview({
  featureName,
  actualMediaUrl,
}: {
  featureName: string;
  actualMediaUrl?: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const cursorControls = useAnimationControls();
  const screenControls = useAnimationControls();
  const modalControls = useAnimationControls();

  useEffect(() => {
    let active = true;

    const playSimulation = async () => {
      if (!isPlaying || !active) return;
      await modalControls.set({ opacity: 0, scale: 0.9, y: 20 });
      while (isPlaying && active) {
        await cursorControls.start({ x: -100, y: -20, transition: { duration: 1 } });
        await new Promise((r) => setTimeout(r, 400));
        await cursorControls.start({ scale: 0.8, transition: { duration: 0.1 } });
        await cursorControls.start({ scale: 1, transition: { duration: 0.1 } });
        await screenControls.start({ opacity: [1, 0.8, 1], transition: { duration: 0.3 } });
        await new Promise((r) => setTimeout(r, 600));
        await cursorControls.start({ x: 80, y: 20, transition: { duration: 1.2 } });
        await new Promise((r) => setTimeout(r, 400));
        await cursorControls.start({ scale: 0.8, transition: { duration: 0.1 } });
        await cursorControls.start({ scale: 1, transition: { duration: 0.1 } });
        await modalControls.start({ opacity: 1, scale: 1, y: 0, zIndex: 50, transition: { duration: 0.4 } });
        await cursorControls.start({ x: 50, y: 50, transition: { duration: 0.8 } });
        await new Promise((r) => setTimeout(r, 2000));
        await cursorControls.start({ x: 150, y: -50, transition: { duration: 0.8 } });
        await cursorControls.start({ scale: 0.8, transition: { duration: 0.1 } });
        await cursorControls.start({ scale: 1, transition: { duration: 0.1 } });
        await modalControls.start({ opacity: 0, scale: 0.9, y: 20, zIndex: -1, transition: { duration: 0.3 } });
        await new Promise((r) => setTimeout(r, 1000));
      }
    };

    playSimulation();
    return () => {
      active = false;
    };
  }, [isPlaying, cursorControls, screenControls, modalControls]);

  return (
    <div className="mt-4 w-full rounded-lg overflow-hidden border border-slate-700/50 bg-[#060a13] shadow-inner flex flex-col group">
      {/* Side-by-Side Comparison Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-slate-800">
        
        {/* LEFT COMPONENT: Actual Live Recording */}
        <div className="relative w-full aspect-video bg-black flex flex-col group/video">
          <div className="absolute top-3 left-3 bg-red-500/90 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest z-30 shadow flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Original Recording
          </div>
          
          {actualMediaUrl ? (
            <video 
               src={actualMediaUrl} 
               autoPlay={isPlaying} 
               loop 
               muted 
               playsInline 
               className="w-full h-full object-cover opacity-90 transition-opacity duration-300 group-hover/video:opacity-100" 
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
               <Video className="w-8 h-8 mb-2 opacity-30" />
               <span className="text-xs uppercase tracking-widest font-semibold">No Recording Provided</span>
            </div>
          )}
        </div>

        {/* RIGHT COMPONENT: Bridgebox Replicated Feature (Virtual Walkthrough) */}
        <div className="relative w-full aspect-video bg-slate-900 border-l border-slate-800 overflow-hidden flex flex-col">
          <div className="absolute top-3 right-3 bg-indigo-500/90 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest z-30 shadow flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-indigo-100" />
            Replicated Feature
          </div>

          {/* OSX Window Header */}
          <div className="h-6 bg-slate-800 border-b border-slate-700/50 flex items-center px-3 gap-1.5 w-full absolute top-0 z-20">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-600/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-600/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-600/50" />
            <div className="mx-auto text-[9px] text-slate-400 font-mono truncate">
              bridgebox.ai/app/walkthrough
            </div>
          </div>

          <div className="flex-1 pt-6 relative">
          {isPlaying ? (
            <div className="absolute inset-0 pt-6 flex overflow-hidden">
              <div className="w-24 bg-slate-900 border-r border-slate-800 p-2 space-y-3 shrink-0 hidden sm:block">
                <div className="w-12 h-2 bg-indigo-500/20 rounded mb-4" />
                {[LayoutDashboard, Users, CreditCard, Activity].map((Icon, i) => (
                  <div key={i} className={`flex items-center gap-2 p-1.5 rounded ${i === 1 ? "bg-indigo-500/10 text-indigo-400" : "text-slate-500"}`}>
                    <Icon className="w-3 h-3" />
                  </div>
                ))}
              </div>

              <motion.div animate={screenControls} className="flex-1 bg-slate-950 p-4 relative min-w-0">
                <div className="h-3 w-24 bg-slate-700/50 rounded mb-4" />
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="h-14 bg-slate-800/50 rounded border border-indigo-500/20 p-2 relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-indigo-500" />
                    <div className="text-[8px] sm:text-[9px] text-slate-400 mb-0.5 truncate">Total Conversions</div>
                    <div className="text-lg font-bold text-white">42,881</div>
                  </div>
                  <div className="h-14 bg-slate-900 border border-slate-800 rounded p-2 flex flex-col justify-center">
                    <div className="text-[8px] sm:text-[9px] text-slate-400 mb-0.5 truncate">Active Sessions</div>
                    <div className="text-lg font-bold text-slate-300">1,092</div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded p-2 sm:p-3">
                  <div className="h-1.5 w-16 bg-slate-700/50 rounded mb-2 sm:mb-3" />
                  <div className="space-y-1 sm:space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex border-b border-slate-800 pb-1.5 sm:pb-2">
                        <div className="h-1.5 w-16 sm:w-24 bg-slate-600 rounded mr-2 max-w-[50%]" />
                        <div className="h-1.5 w-8 sm:w-12 bg-slate-700 rounded" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fixed Popout Modal without breaking bounds */}
                <motion.div
                  animate={modalControls}
                  initial={{ opacity: 0, scale: 0.9, y: 20, zIndex: -1 }}
                  className="absolute p-3 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] bg-slate-900 border border-slate-700 shadow-2xl rounded-lg flex flex-col max-h-[90%] overflow-hidden"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-[10px] sm:text-xs font-bold text-white truncate pr-2">Conversion Detail</div>
                    <X className="w-3 h-3 text-slate-400 shrink-0" />
                  </div>
                  <div className="flex-1 bg-slate-950 rounded border border-slate-800 p-2 overflow-hidden flex flex-col gap-2">
                    <div className="text-[8px] sm:text-[9px] text-indigo-400 font-mono truncate">SELECT * FROM queries</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-emerald-500/20 rounded" />
                    </div>
                  </div>
                </motion.div>

                <motion.div animate={cursorControls} initial={{ x: 0, y: 0 }} className="absolute top-1/2 left-1/2 z-[100] drop-shadow-lg">
                  <MousePointer2 className="w-4 h-4 text-white fill-slate-900 -rotate-12" />
                </motion.div>
              </motion.div>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 cursor-pointer p-4 text-center" onClick={() => setIsPlaying(true)}>
              <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-[0_0_25px_rgba(99,102,241,0.5)] hover:scale-110 transition-transform mb-3">
                <Play className="w-5 h-5 ml-1" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-white bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                Play Comparison
              </span>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Sync Control Bar Below */}
      <div className="h-10 bg-black border-t border-slate-800 flex items-center justify-between px-4 z-20">
        <button
          onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
          className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {isPlaying ? "Pause Sync" : "Play Sync"}
        </button>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Synchronized Playback</span>
        </div>
      </div>
    </div>
  );
}
