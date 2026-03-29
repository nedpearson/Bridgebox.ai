import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Maximize2, Volume2, Settings } from 'lucide-react';

export default function FeatureVideoPreview({ featureName }: { featureName: string }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="mt-4 w-full rounded-lg overflow-hidden border border-slate-700/50 bg-[#060a13] shadow-inner relative group">
      {/* Abstract Animated "Video" Content */}
      <div className="relative w-full h-32 md:h-48 overflow-hidden bg-slate-900 flex items-center justify-center">
        {/* Generative UI abstractions playing out */}
        <div className="absolute inset-0 opacity-20">
           <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-indigo-500/20 to-transparent" />
           <motion.div 
              animate={{ 
                backgroundPosition: isPlaying ? ['0% 0%', '100% 100%'] : '0% 0%',
              }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-transparent to-transparent opacity-50" 
           />
        </div>

        {/* Floating animated UI elements */}
        {isPlaying ? (
          <div className="flex flex-col items-center justify-center gap-3 w-full px-12">
            <motion.div 
               initial={{ width: 0, opacity: 0 }}
               animate={{ width: "100%", opacity: 1 }}
               transition={{ duration: 0.8 }}
               className="h-2 bg-indigo-500/30 rounded-full"
            />
            <div className="flex gap-3 w-full justify-center">
               <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="w-1/3 h-12 bg-white/5 rounded-md border border-white/10" />
               <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="w-1/3 h-12 bg-white/5 rounded-md border border-white/10" />
               <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="w-1/3 h-12 bg-white/5 rounded-md border border-white/10" />
            </div>
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
               className="text-[10px] text-indigo-300 font-mono tracking-widest mt-2 uppercase"
            >
               Simulating Workflow...
            </motion.div>
          </div>
        ) : (
          <div className="relative z-10 flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/50 text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/40 transition-all cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              <Play className="w-4 h-4 ml-1" />
            </div>
            <span className="mt-3 text-[10px] font-bold tracking-widest uppercase text-slate-400">Play Demo Preview</span>
          </div>
        )}

        {/* Ghost Overlay when paused */}
        {!isPlaying && (
           <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] pointer-events-none" />
        )}
      </div>

      {/* Video Player Controls */}
      <div className="h-10 bg-slate-900 border-t border-slate-700/50 flex items-center px-4 justify-between relative z-20">
        <div className="flex items-center gap-4">
          <button 
             onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }} 
             className="text-slate-400 hover:text-white transition-colors outline-none"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          
          <div className="flex items-center gap-2 group/scrub cursor-pointer">
             <span className="text-[10px] tabular-nums text-slate-500 font-mono">{isPlaying ? '0:03' : '0:00'}</span>
             <div className="w-24 md:w-48 h-1 bg-slate-700 rounded-full relative overflow-hidden">
                <motion.div 
                  initial={{ width: '0%' }}
                  animate={{ width: isPlaying ? '100%' : '0%' }}
                  transition={{ duration: 5, ease: 'linear', repeat: isPlaying ? Infinity : 0 }}
                  className="absolute left-0 top-0 bottom-0 bg-indigo-500" 
                />
             </div>
             <span className="text-[10px] tabular-nums text-slate-500 font-mono">0:05</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <Volume2 className="w-3.5 h-3.5 text-slate-500 cursor-pointer hover:text-white" />
           <Settings className="w-3.5 h-3.5 text-slate-500 cursor-pointer hover:text-white" />
           <Maximize2 className="w-3.5 h-3.5 text-slate-500 cursor-pointer hover:text-white" />
        </div>
      </div>
      
      {/* Context Badge */}
      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded text-[9px] uppercase font-bold tracking-widest text-white/80 z-20 shadow-lg">
        {featureName} Walkthrough
      </div>
    </div>
  );
}
