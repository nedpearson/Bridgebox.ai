import { motion } from 'framer-motion';
import { 
  BarChart3, LayoutDashboard, Settings, Users, FileText, 
  Bell, Search, Plus, MoreVertical, LayoutGrid, CheckSquare,
  ArrowRight, MousePointerClick
} from 'lucide-react';

export type MockupLayoutType = 'dashboard' | 'kanban' | 'detail' | 'table' | 'generic';

interface VirtualPrototypeCanvasProps {
  layoutType: MockupLayoutType;
  screenName: string;
  onInteract?: () => void;
  isLastScreen?: boolean;
}

export default function VirtualPrototypeCanvas({ layoutType, screenName, onInteract, isLastScreen }: VirtualPrototypeCanvasProps) {
  // Shared Header
  const Header = () => (
    <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-500/10 bg-slate-900/50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
          <LayoutGrid className="w-4 h-4 text-indigo-400" />
        </div>
        <span className="font-semibold text-white tracking-wide">{screenName}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center bg-slate-800/50 px-3 py-1.5 rounded-md border border-slate-700/50">
          <Search className="w-3.5 h-3.5 text-slate-500 mr-2" />
          <div className="w-24 h-2 bg-slate-700/50 rounded-full" />
        </div>
        <Bell className="w-4 h-4 text-slate-500" />
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border border-white/10" />
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="p-6 space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <motion.div 
            key={i}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onInteract}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-4 rounded-xl border cursor-pointer transition-colors relative overflow-hidden group ${i === 1 ? 'bg-indigo-900/40 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-slate-800/40 border-slate-700/50 hover:border-indigo-500/30 hover:bg-slate-800/60'}`}
          >
            {/* Click Ripple Indicator */}
            {i === 1 && (
               <div className="absolute inset-0 bg-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg flex items-center gap-1.5 backdrop-blur-md">
                     <MousePointerClick className="w-3 h-3" /> Click to Drilldown
                  </span>
               </div>
            )}
            <div className="w-6 h-6 rounded bg-indigo-500/10 mb-3 flex items-center justify-center relative z-10">
              <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className={`w-16 h-3 rounded mb-2 relative z-10 ${i === 1 ? 'bg-indigo-300/60' : 'bg-slate-600/50'}`} />
            <div className={`w-24 h-5 rounded relative z-10 ${i === 1 ? 'bg-white' : 'bg-white/10'}`} />
          </motion.div>
        ))}
      </div>
      {/* Charts area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="col-span-2 h-48 bg-slate-800/40 rounded-xl border border-slate-700/50 p-4 flex flex-col justify-end gap-2 overflow-hidden relative"
        >
          {/* Abstract Chart lines */}
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/5 to-transparent flex items-end px-4 gap-2 pb-4">
             {[...Array(12)].map((_, i) => (
               <motion.div 
                 key={i} 
                 initial={{ height: 0 }}
                 animate={{ height: `${Math.random() * 80 + 20}%` }}
                 transition={{ duration: 1, delay: 0.5 + (i * 0.05) }}
                 className="flex-1 bg-indigo-500/20 rounded-t-sm" 
               />
             ))}
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="h-48 bg-slate-800/40 rounded-xl border border-slate-700/50 p-4 space-y-3"
        >
          <div className="w-20 h-3 bg-slate-600/50 rounded mb-4" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-slate-700/50" />
              <div className="flex-1 space-y-1.5">
                <div className="w-full h-2 bg-slate-600/40 rounded" />
                <div className="w-2/3 h-1.5 bg-slate-700/40 rounded" />
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );

  const renderKanban = () => (
    <div className="p-6 flex gap-4 overflow-hidden h-[400px]">
      {['To-Do', 'In Progress', 'In Review', 'Done'].map((col, idx) => (
        <motion.div 
          key={col}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.15 }}
          className="flex-1 min-w-[240px] bg-slate-800/30 rounded-xl border border-slate-700/50 p-3 flex flex-col"
        >
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-sm font-semibold text-slate-300">{col}</span>
            <div className="w-5 h-5 rounded bg-slate-700/50 flex items-center justify-center text-[10px] text-slate-400">
              {3 - (idx % 2)}
            </div>
          </div>
          <div className="space-y-3 flex-1">
            {[...Array(3 - (idx % 2))].map((_, cardIdx) => (
              <motion.div 
                key={cardIdx} 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onInteract}
                className={`border rounded-lg p-3 shadow-sm transition-all cursor-pointer group relative overflow-hidden ${idx === 1 && cardIdx === 0 ? 'bg-indigo-900/30 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'bg-slate-900 border-slate-700/50 hover:border-indigo-500/30 hover:bg-slate-800/80'}`}
              >
                {/* Click Ripple Indicator */}
                {idx === 1 && cardIdx === 0 && (
                   <div className="absolute inset-0 bg-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                      <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1.5">
                         <MousePointerClick className="w-3 h-3" /> View Details
                      </span>
                   </div>
                )}
                <div className="flex flex-wrap gap-1 mb-2 relative z-10">
                   <div className="w-8 h-1.5 rounded-full bg-emerald-500/20" />
                   {cardIdx % 2 === 0 && <div className="w-10 h-1.5 rounded-full bg-purple-500/20" />}
                </div>
                <div className={`w-full h-2.5 rounded mb-2 relative z-10 ${idx === 1 && cardIdx === 0 ? 'bg-indigo-300/80' : 'bg-slate-600/60'}`} />
                <div className={`w-3/4 h-2.5 rounded mb-4 relative z-10 ${idx === 1 && cardIdx === 0 ? 'bg-indigo-300/60' : 'bg-slate-600/60'}`} />
                <div className="flex items-center justify-between mt-auto relative z-10">
                   <CheckSquare className={`w-3.5 h-3.5 ${idx === 1 && cardIdx === 0 ? 'text-indigo-400' : 'text-slate-500'}`} />
                   <div className={`w-5 h-5 rounded-full transition-colors ${idx === 1 && cardIdx === 0 ? 'bg-indigo-500/50' : 'bg-slate-700 group-hover:bg-indigo-500/20'}`} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderDetail = () => (
    <div className="flex h-[400px]">
       {/* Sidebar Sandbox */}
       <div className="w-64 border-r border-slate-700/50 bg-slate-800/20 p-4 space-y-6">
         <div>
           <div className="w-full h-32 bg-slate-800/80 border border-slate-700 rounded-xl flex items-center justify-center mb-4">
              <ImageIcon className="w-8 h-8 text-slate-600" />
           </div>
           <div className="space-y-2">
             <div className="w-3/4 h-3 bg-white/20 rounded" />
             <div className="w-1/2 h-2 bg-slate-500/50 rounded" />
           </div>
         </div>
         <div className="space-y-3">
           <div className="w-20 h-2 bg-slate-600 rounded mb-2" />
           {[1,2,3].map(i => (
             <motion.div 
                key={i} 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onInteract}
                className={`flex items-center justify-between p-2 rounded flex-wrap cursor-pointer transition-colors relative overflow-hidden group ${i === 2 ? 'bg-indigo-900/40 border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'bg-slate-800/40 hover:bg-slate-700/60'}`}
             >
               {/* Click Ripple Indicator */}
               {i === 2 && (
                  <div className="absolute inset-0 bg-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <span className="bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                        <MousePointerClick className="w-3 h-3" /> Execute
                     </span>
                  </div>
               )}
               <div className={`relative z-10 w-16 h-1.5 rounded ${i === 2 ? 'bg-indigo-300' : 'bg-slate-500'}`} />
               <div className={`relative z-10 w-12 h-1.5 rounded ${i === 2 ? 'bg-indigo-400' : 'bg-indigo-400/50'}`} />
             </motion.div>
           ))}
         </div>
       </div>
       {/* Main content */}
       <div className="flex-1 p-6 space-y-6 flex flex-col">
         <div className="flex items-center gap-4 border-b border-slate-700/50 pb-4">
           {['Overview', 'Activity Logs', 'Connections', 'Settings'].map((tab, i) => (
             <div key={tab} className={`text-sm px-2 py-1 font-medium ${i===0 ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400'}`}>
               {tab}
             </div>
           ))}
         </div>
         <div className="space-y-4 flex-1">
           {[1, 2, 3].map((i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: i * 0.1 }}
               className="p-4 rounded-xl border border-slate-700/30 bg-slate-800/20 flex gap-4"
             >
               <div className="w-10 h-10 rounded-full bg-slate-700/50 shrink-0" />
               <div className="space-y-2 flex-1 pt-1">
                 <div className="w-1/3 h-2.5 bg-slate-400/80 rounded" />
                 <div className="w-full h-1.5 bg-slate-600/40 rounded" />
                 <div className="w-5/6 h-1.5 bg-slate-600/40 rounded" />
               </div>
             </motion.div>
           ))}
         </div>

         {/* Floating Form Actions */}
         <div className="mt-auto border-t border-slate-700/50 pt-4 flex justify-end gap-3">
           <div className="px-4 py-2 rounded-lg bg-slate-800 text-slate-400 text-sm font-medium">Cancel</div>
           <motion.div 
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             onClick={onInteract}
             className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 cursor-pointer flex items-center gap-2 group"
           >
             {isLastScreen ? 'Finish Tour' : 'Save & Continue'}
             <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
           </motion.div>
         </div>
       </div>
    </div>
  );

  return (
    <div className="w-full bg-[#0a0f1c] border border-slate-700/60 rounded-xl overflow-hidden shadow-2xl relative">
      <Header />
      <div className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#0a0f1c] to-[#0a0f1c]">
        {layoutType === 'dashboard' && renderDashboard()}
        {layoutType === 'kanban' && renderKanban()}
        {layoutType === 'detail' && renderDetail()}
        {(layoutType === 'table' || layoutType === 'generic') && renderDetail()} {/* Fallback to detail mapping for generic lists */}
      </div>
      
      {/* Overlay Glow */}
      <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-xl block" />
    </div>
  );
}

const ImageIcon = ({ className }: {className: string}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
);
