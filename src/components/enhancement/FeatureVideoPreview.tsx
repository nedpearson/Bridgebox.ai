import { useState, useEffect } from "react";
import { motion, useAnimationControls } from "framer-motion";
import {
  Play,
  Pause,
  LayoutDashboard,
  Users,
  CreditCard,
  Activity,
  X,
  Video,
  Sparkles,
  MousePointer2,
  TrendingUp,
  Search,
  Bell,
  MoreHorizontal,
  ArrowUpRight,
  Database
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis } from "recharts";

const MOCK_DATA = [
  { name: 'Mon', value: 400 },
  { name: 'Tue', value: 300 },
  { name: 'Wed', value: 550 },
  { name: 'Thu', value: 450 },
  { name: 'Fri', value: 700 },
  { name: 'Sat', value: 650 },
  { name: 'Sun', value: 800 },
];

const MOCK_ROWS = [
  { id: 1, user: 'Sarah Jenkins', role: 'Enterprise Client', status: 'Active', amt: '$4,200.00' },
  { id: 2, user: 'Marcus Wright', role: 'SMB Account', status: 'Pending', amt: '$850.00' },
  { id: 3, user: 'Emma Stone', role: 'Partner', status: 'Active', amt: '$12,450.00' },
];

export default function FeatureVideoPreview({
  featureName,
  actualMediaUrl,
  brandContext,
}: {
  featureName: string;
  actualMediaUrl?: string;
  brandContext?: {
    target_url: string;
    primary_color: string;
    theme?: "light" | "dark";
  };
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const cursorControls = useAnimationControls();
  const screenControls = useAnimationControls();
  const modalControls = useAnimationControls();

  const primaryColor = brandContext?.primary_color || "#6366f1";
  let hostName = "bridgebox.ai";
  if (brandContext?.target_url) {
     try { hostName = new URL(brandContext.target_url).hostname.replace('www.',''); } catch {}
  }

  useEffect(() => {
    let active = true;

    const playSimulation = async () => {
      if (!isPlaying || !active) return;
      await modalControls.set({ opacity: 0, scale: 0.9, y: 20 });
      while (isPlaying && active) {
        // Move to Search
        await cursorControls.start({ x: -80, y: -40, transition: { duration: 1 } });
        await new Promise((r) => setTimeout(r, 400));
        await cursorControls.start({ scale: 0.8, transition: { duration: 0.1 } });
        await cursorControls.start({ scale: 1, transition: { duration: 0.1 } });
        
        // Emulate search focus
        await screenControls.start({ opacity: [1, 0.9, 1], filter: ['brightness(1)', 'brightness(1.1)', 'brightness(1)'], transition: { duration: 0.3 } });
        await new Promise((r) => setTimeout(r, 600));
        
        // Move to Data Grid Row
        await cursorControls.start({ x: 20, y: 70, transition: { duration: 1.2 } });
        await new Promise((r) => setTimeout(r, 400));
        await cursorControls.start({ scale: 0.8, transition: { duration: 0.1 } });
        await cursorControls.start({ scale: 1, transition: { duration: 0.1 } });
        
        // Open drilldown modal
        await modalControls.start({ opacity: 1, scale: 1, y: 0, zIndex: 50, transition: { duration: 0.4 } });
        
        // Move inside modal to trigger a secondary nested action
        await cursorControls.start({ x: 0, y: 50, transition: { duration: 0.8 } });
        await new Promise((r) => setTimeout(r, 2000));
        
        // Move to close modal
        await cursorControls.start({ x: 120, y: -55, transition: { duration: 0.8 } });
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
    <div className="mt-4 w-full rounded-lg min-h-[400px] overflow-hidden border border-slate-700/50 shadow-inner flex flex-col group bg-slate-950">
      
      {/* Side-by-Side Comparison Container */}
      <div className="flex flex-col lg:flex-row flex-1 bg-slate-900 overflow-hidden relative">
        <div className="absolute inset-0 bg-slate-900 lg:w-[1px] lg:left-1/2 lg:-ml-[0.5px] z-50"></div>
        
        {/* LEFT COMPONENT: Actual Live Recording */}
        <div className="relative w-full lg:w-1/2 flex flex-col group/video border-b lg:border-b-0 lg:border-r border-slate-800 bg-black min-h-[250px] lg:min-h-[400px]">
          <div className="absolute top-4 left-4 bg-red-500/90 text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest z-30 shadow flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
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
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 bg-slate-950 relative overflow-hidden">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px]"></div>
               <Video className="w-10 h-10 mb-3 opacity-30 z-10" />
               <span className="text-sm uppercase tracking-widest font-bold z-10 text-slate-500">No Recording Source</span>
               <p className="text-xs text-slate-600 mt-2 z-10 max-w-[200px] text-center">Bridgebox AI extrapolates feature intent from text if media is omitted.</p>
            </div>
          )}
        </div>

        {/* RIGHT COMPONENT: Bridgebox Replicated Feature (Virtual Walkthrough) */}
        <div className="relative w-full lg:w-1/2 flex flex-col bg-slate-950 min-h-[300px] lg:min-h-[400px]">
          <div className="absolute top-4 right-4 text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest z-30 shadow flex items-center gap-2" style={{ backgroundColor: primaryColor }}>
            <Sparkles className="w-3 h-3 text-white" />
            Autonomous Blueprint
          </div>

          <div className="h-7 bg-slate-900 border-b border-slate-800 flex items-center px-4 w-full relative z-20">
            <div className="flex gap-1.5 flex-1">
               <div className="w-3 h-3 rounded-full bg-rose-500/80" />
               <div className="w-3 h-3 rounded-full bg-amber-500/80" />
               <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="text-[10px] font-mono text-slate-400 truncate flex-1 text-center bg-slate-800/50 rounded-md py-0.5 max-w-[200px]">
               {hostName}/app/demo
            </div>
            <div className="flex-1" />
          </div>

          <div className="flex-1 flex overflow-hidden relative isolate">
            {/* Sidebar Navigation */}
            <div className="w-16 sm:w-48 bg-slate-900 border-r border-slate-800 flex flex-col py-4 z-10">
               <div className="px-4 mb-6 hidden sm:flex items-center gap-2">
                 <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                    <Database className="w-3 h-3 text-white" />
                 </div>
                 <span className="text-xs font-bold text-white tracking-wide">Nexus Data</span>
               </div>
               <div className="flex flex-col gap-1 px-2">
                 {[
                   { icon: LayoutDashboard, label: "Overview", active: true },
                   { icon: Users, label: "Workforce", active: false },
                   { icon: Activity, label: "Analytics", active: false },
                   { icon: CreditCard, label: "Billing", active: false }
                 ].map((item, i) => (
                   <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${!item.active ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : ''}`} style={item.active ? { backgroundColor: `${primaryColor}1A`, color: primaryColor } : undefined}>
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span className="text-[11px] font-medium hidden sm:block">{item.label}</span>
                   </div>
                 ))}
               </div>
            </div>

            {/* Main Application Area */}
            <motion.div animate={screenControls} className="flex-1 overflow-hidden relative bg-slate-950 flex flex-col">
                <div className="h-12 border-b border-slate-800/50 flex items-center justify-between px-4 bg-slate-900/30">
                   <div className="relative w-32 sm:w-48">
                      <Search className="w-3 h-3 absolute left-2 top-1.5 text-slate-500" />
                      <div className="h-6 w-full bg-slate-800/50 rounded-md border border-slate-700/50 pl-7 flex items-center">
                         <span className="text-[10px] text-slate-500">Search system...</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <Bell className="w-3.5 h-3.5 text-slate-400" />
                      <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[10px] font-bold text-indigo-300">
                         AD
                      </div>
                   </div>
                </div>

                <div className="p-4 flex-1 overflow-y-auto">
                   <div className="flex items-center justify-between mb-4">
                     <div>
                       <h2 className="text-white text-xs font-bold capitalize">{featureName || 'Autonomous Module'}</h2>
                       <p className="text-[9px] text-slate-400">Real-time system synchronization active</p>
                     </div>
                     <div className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[9px] font-bold flex items-center gap-1.5">
                        <TrendingUp className="w-3 h-3" />
                        +14.2%
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                         <span className="text-[9px] font-medium text-slate-400">Total Volume</span>
                         <div className="text-lg font-bold text-white mt-1">$124,500</div>
                         <div className="h-10 mt-2 -mx-1">
                           <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={MOCK_DATA}>
                               <defs>
                                 <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                                 </linearGradient>
                               </defs>
                               <Area type="monotone" dataKey="value" stroke={primaryColor} strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                             </AreaChart>
                           </ResponsiveContainer>
                         </div>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-col justify-between">
                         <span className="text-[9px] font-medium text-slate-400">Active Nodes</span>
                         <div className="text-lg font-bold text-white mt-1">1,092</div>
                         <div className="mt-auto flex items-center justify-between">
                            <span className="text-[9px] text-emerald-400 font-medium">Healthy</span>
                            <Activity className="w-3 h-3 text-emerald-400" />
                         </div>
                      </div>
                   </div>

                   <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                      <div className="px-3 py-2 border-b border-slate-800 flex justify-between items-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-900/50">
                        <span>Recent Activity Log</span>
                        <MoreHorizontal className="w-3 h-3" />
                      </div>
                      <div className="flex flex-col">
                        {MOCK_ROWS.map((row) => (
                           <div key={row.id} className="flex items-center justify-between px-3 py-2.5 border-b border-slate-800/50 last:border-0 hover:bg-slate-800/20 transition-colors">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[9px] text-slate-300 font-medium shrink-0">
                                   {row.user.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                   <div className="text-[10px] font-medium text-slate-200 truncate">{row.user}</div>
                                   <div className="text-[9px] text-slate-500 truncate">{row.role}</div>
                                </div>
                              </div>
                              <div className="text-right shrink-0 ml-2">
                                 <div className="text-[10px] font-mono text-slate-300">{row.amt}</div>
                                 <div className={`text-[8px] font-bold uppercase tracking-wider ${row.status === 'Active' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                   {row.status}
                                 </div>
                              </div>
                           </div>
                        ))}
                      </div>
                   </div>
                </div>

                {/* Highly Realistic Drilldown Modal */}
                <motion.div
                  animate={modalControls}
                  initial={{ opacity: 0, scale: 0.9, y: 20, zIndex: -1 }}
                  className="absolute p-4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] bg-slate-900/95 backdrop-blur-xl border border-slate-700 shadow-2xl shadow-black rounded-xl flex flex-col"
                >
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
                    <div>
                      <h3 className="text-xs font-bold text-white flex items-center gap-2">
                         <Database className="w-3 h-3 text-indigo-400" />
                         Entity Drilldown
                      </h3>
                      <p className="text-[9px] text-slate-400 mt-0.5">Deep inspection of row identifier #{MOCK_ROWS[0].id}</p>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 cursor-pointer transition-colors">
                      <X className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                     <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                        <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-2">Raw JSON Output</div>
                        <div className="font-mono text-[9px] leading-relaxed bg-black p-2 rounded border border-slate-800" style={{ color: primaryColor }}>
                           {`{\n  "id": "${MOCK_ROWS[0].id}",\n  "entity": "${MOCK_ROWS[0].user}",\n  "type": "enterprise_tier",\n  "status": "verified_active",\n  "metadata": {\n    "auth_token": "valid=true",\n    "last_sync": "2ms ago"\n  }\n}`}
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-800/50 rounded p-2 text-center border border-slate-700/50">
                           <div className="text-[8px] text-slate-400 uppercase">Process Time</div>
                           <div className="text-xs text-emerald-400 font-bold font-mono">24ms</div>
                        </div>
                        <div className="bg-slate-800/50 rounded p-2 text-center border border-slate-700/50">
                           <div className="text-[8px] text-slate-400 uppercase">SQL Query</div>
                           <div className="text-xs text-white font-bold font-mono">1 Table</div>
                        </div>
                     </div>
                  </div>
                </motion.div>

                {/* Animated Simulated Cursor */}
                <motion.div animate={cursorControls} initial={{ x: 0, y: 0 }} className="absolute top-1/2 left-1/2 z-[100] drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 -rotate-12">
                    <path d="M5.5 3.5L18.5 10.5C19.5 11 19.5 12.5 18.5 13L13.5 14L11 19.5C10.5 20.5 9 20.5 8.5 19.5L5.5 3.5Z" fill="white" stroke="#0f172a" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
                
                {/* Play Overlay if Not Active */}
                {!isPlaying && (
                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] z-50 flex items-center justify-center cursor-pointer group/play" onClick={() => setIsPlaying(true)}>
                    <div className="w-14 h-14 rounded-full flex items-center justify-center text-white transition-all group-hover/play:scale-110" style={{ backgroundColor: primaryColor, boxShadow: `0 0 30px ${primaryColor}99` }}>
                       <Play className="w-6 h-6 ml-1" />
                    </div>
                  </div>
                )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Sync Control Bar Below */}
      <div className="bg-black border-t border-slate-800 flex items-center justify-between px-6 py-3 z-20">
        <button
          onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
          className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg"
        >
          {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
          {isPlaying ? "Pause Engine" : "Play Engine"}
        </button>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></div>
            Render Sync {isPlaying ? 'Active' : 'Standby'}
          </span>
        </div>
      </div>
    </div>
  );
}
