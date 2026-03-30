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
} from "lucide-react";

export default function FeatureVideoPreview({
  featureName,
}: {
  featureName: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const cursorControls = useAnimationControls();
  const screenControls = useAnimationControls();
  const modalControls = useAnimationControls();

  useEffect(() => {
    let active = true;

    const playSimulation = async () => {
      if (!isPlaying || !active) return;

      // Reset Modal
      await modalControls.set({ opacity: 0, scale: 0.9, y: 20 });

      while (isPlaying && active) {
        // 1. Cursor moves to the Sidebar Navigation
        await cursorControls.start({
          x: -150,
          y: -40,
          transition: { duration: 1, ease: "easeInOut" },
        });
        await new Promise((r) => setTimeout(r, 400));

        // 2. Click "Customers" in Navigation
        await cursorControls.start({
          scale: 0.8,
          transition: { duration: 0.1 },
        });
        await cursorControls.start({ scale: 1, transition: { duration: 0.1 } });
        await screenControls.start({
          opacity: [1, 0.8, 1],
          transition: { duration: 0.3 },
        });
        await new Promise((r) => setTimeout(r, 600));

        // 3. Cursor moves to a Dashboard Card (Drilldown)
        await cursorControls.start({
          x: 100,
          y: 0,
          transition: { duration: 1.2, ease: "easeInOut" },
        });
        await new Promise((r) => setTimeout(r, 400));

        // 4. Click the Canvas KPI Card (Triggering Drilldown Modal)
        await cursorControls.start({
          scale: 0.8,
          transition: { duration: 0.1 },
        });
        await cursorControls.start({ scale: 1, transition: { duration: 0.1 } });

        // Open Modal Animation
        await modalControls.start({
          opacity: 1,
          scale: 1,
          y: 0,
          zIndex: 50,
          transition: { duration: 0.4, type: "spring" },
        });

        // 5. Cursor explores Modal Data
        await cursorControls.start({
          x: 80,
          y: 60,
          transition: { duration: 0.8, ease: "easeInOut" },
        });
        await new Promise((r) => setTimeout(r, 2000));

        // 6. Close Drilldown Modal
        await cursorControls.start({
          x: 220,
          y: -80,
          transition: { duration: 0.8, ease: "easeInOut" },
        });
        await cursorControls.start({
          scale: 0.8,
          transition: { duration: 0.1 },
        });
        await cursorControls.start({ scale: 1, transition: { duration: 0.1 } });
        await modalControls.start({
          opacity: 0,
          scale: 0.9,
          y: 20,
          zIndex: -1,
          transition: { duration: 0.3 },
        });

        // 7. Loop Wait
        await new Promise((r) => setTimeout(r, 1000));
      }
    };

    playSimulation();

    return () => {
      active = false;
    };
  }, [isPlaying, cursorControls, screenControls, modalControls]);

  return (
    <div className="mt-4 w-full rounded-lg overflow-hidden border border-slate-700/50 bg-[#060a13] shadow-inner relative group">
      {/* 
         GENERATED "LIVE VIDEO" FOOTAGE
         A pristine CSS recreation of a 1080p SaaS UI interface with autonomous mouse walkthrough 
      */}
      <div className="relative w-full h-64 md:h-80 overflow-hidden bg-slate-900 border-b border-slate-800">
        {/* OSX Window Header */}
        <div className="h-6 bg-slate-800 border-b border-slate-700/50 flex items-center px-3 gap-1.5 w-full absolute top-0 z-20">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          <div className="mx-auto text-[9px] text-slate-400 font-mono flex items-center gap-2">
            <span className="bg-red-500/20 text-red-400 px-1 py-0.5 rounded flex items-center gap-1 animate-pulse uppercase tracking-wider font-bold">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> REC
            </span>
            bridgebox.ai/app/walkthrough
          </div>
        </div>

        {isPlaying ? (
          <div className="absolute inset-0 pt-6 flex overflow-hidden">
            {/* SaaS Sidebar */}
            <div className="w-32 bg-slate-900 border-r border-slate-800 p-3 space-y-4">
              <div className="w-16 h-3 bg-indigo-500/20 rounded mb-6" />
              {[LayoutDashboard, Users, CreditCard, Activity].map((Icon, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 p-1.5 rounded ${i === 1 ? "bg-indigo-500/10 text-indigo-400" : "text-slate-500"}`}
                >
                  <Icon className="w-3 h-3" />
                  <div
                    className={`h-1.5 rounded w-12 ${i === 1 ? "bg-indigo-400/50" : "bg-slate-700"}`}
                  />
                </div>
              ))}
            </div>

            {/* SaaS Main Canvas */}
            <motion.div
              animate={screenControls}
              className="flex-1 bg-slate-950 p-4 relative"
            >
              <div className="h-4 w-32 bg-slate-700/50 rounded mb-4" />

              {/* Dashboard KPI Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="h-16 bg-slate-800/50 rounded border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)] p-3 relative overflow-hidden group">
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-indigo-500" />
                  <div className="text-[9px] text-slate-400 mb-1">
                    Total Conversions
                  </div>
                  <div className="text-xl font-bold text-white">42,881</div>
                </div>
                <div className="h-16 bg-slate-900 border border-slate-800 rounded p-3">
                  <div className="text-[9px] text-slate-400 mb-1">
                    Active Sessions
                  </div>
                  <div className="text-xl font-bold text-slate-300">1,092</div>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-slate-900 border border-slate-800 rounded p-3 h-24">
                <div className="h-2 w-20 bg-slate-700/50 rounded mb-3" />
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex border-b border-slate-800 pb-2"
                    >
                      <div className="h-2 w-6 bg-slate-700 rounded mr-2" />
                      <div className="h-2 w-24 bg-slate-600 rounded flex-1" />
                      <div className="h-2 w-12 bg-slate-700 rounded" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Popout Drilldown Modal */}
              <motion.div
                animate={modalControls}
                initial={{ opacity: 0, scale: 0.9, y: 20, zIndex: -1 }}
                className="absolute inset-2 bg-slate-900 border border-slate-700 shadow-2xl rounded-lg p-4 flex flex-col"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="text-xs font-bold text-white">
                    Conversion Drilldown
                  </div>
                  <X className="w-3 h-3 text-slate-400" />
                </div>
                <div className="flex-1 bg-slate-950 rounded border border-slate-800 p-3 flex flex-col gap-2">
                  <div className="text-[10px] text-indigo-400 font-mono">
                    Query Executed: SELECT * FROM conversions
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-[10px] font-bold">
                      1
                    </div>
                    <div className="flex-1 h-3 bg-slate-800 rounded" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-[10px] font-bold">
                      2
                    </div>
                    <div className="flex-1 h-3 bg-slate-800 rounded" />
                  </div>
                </div>
              </motion.div>

              {/* Animated Mouse Cursor */}
              <motion.div
                animate={cursorControls}
                initial={{ x: 0, y: 0 }}
                className="absolute top-1/2 left-1/2 z-[100] drop-shadow-lg"
              >
                <MousePointer2 className="w-5 h-5 text-white fill-slate-900 -rotate-12" />
              </motion.div>
            </motion.div>
          </div>
        ) : (
          <div
            className="relative z-10 flex flex-col items-center justify-center w-full h-full cursor-pointer bg-slate-900"
            onClick={() => setIsPlaying(true)}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
              <div className="w-80 h-40 border border-slate-700 rounded-lg scale-150 blur-[2px]" />
            </div>
            <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-[0_0_25px_rgba(99,102,241,0.5)] hover:scale-110 transition-transform relative z-20">
              <Play className="w-5 h-5 ml-1" />
            </div>
            <span className="mt-4 text-[11px] font-bold tracking-widest uppercase text-white relative z-20 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-700/50">
              Play Full Live Video Walkthrough
            </span>
          </div>
        )}
      </div>

      {/* Video Player Controls (Now standard for both actual and generated video) */}
      <div className="h-10 bg-black border-t border-slate-800 flex items-center px-4 justify-between relative z-20">
        <div className="flex items-center gap-4 w-full">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsPlaying(!isPlaying);
            }}
            className="text-slate-400 hover:text-white transition-colors outline-none"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>

          <div className="flex items-center gap-2 group/scrub cursor-pointer flex-1">
            <span className="text-[10px] tabular-nums text-slate-500 font-mono">
              {isPlaying ? (
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  ▶ PLAYING
                </motion.span>
              ) : (
                "0:00"
              )}
            </span>
            <div className="flex-1 h-1.5 bg-slate-800 rounded-full relative overflow-hidden group-hover:h-2 transition-all">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: isPlaying ? "100%" : "0%" }}
                transition={{
                  duration: 7.2,
                  ease: "linear",
                  repeat: isPlaying ? Infinity : 0,
                }}
                className="absolute left-0 top-0 bottom-0 bg-indigo-500 rounded-full"
              />
            </div>
            <span className="text-[10px] tabular-nums text-slate-500 font-mono uppercase">
              Live Link
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Volume2 className="w-3.5 h-3.5 text-slate-500 cursor-pointer hover:text-white" />
            <Settings className="w-3.5 h-3.5 text-slate-500 cursor-pointer hover:text-white" />
            <Maximize2 className="w-3.5 h-3.5 text-slate-500 cursor-pointer hover:text-white" />
          </div>
        </div>
      </div>

      {/* Context Badge */}
      <div className="absolute top-8 left-3 bg-black/80 backdrop-blur-md border border-slate-700 px-2 py-1 rounded text-[9px] uppercase font-bold tracking-widest text-indigo-300 z-30 shadow-lg">
        {featureName} Architecture Video
      </div>
    </div>
  );
}
