import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  CheckSquare,
  Upload,
  Camera,
  Mic,
  MapPin,
  TrendingUp,
  AlertCircle,
  Bell,
  Clock,
} from "lucide-react";
import MobileLayout from "../../layouts/MobileLayout";
import { useAuth } from "../../contexts/AuthContext";

export default function MobileHome() {
  const navigate = useNavigate();
  const { currentOrganization, profile } = useAuth();
  const [stats, setStats] = useState({
    tasksToday: 3,
    projectsActive: 2,
    documentsUploaded: 12,
    pendingActions: 5,
  });

  return (
    <MobileLayout title="Field Ops">
      <div className="p-4 pb-32 space-y-6">
        {/* Welcome Section */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">
              Hello, {profile?.full_name?.split(" ")[0] || "User"}
            </h2>
            <p className="text-sm text-indigo-300 font-medium">
              {currentOrganization?.name || "Your Workspace"}
            </p>
          </div>
          <button className="relative p-2 bg-slate-800/50 rounded-full border border-white/5">
            <Bell className="w-5 h-5 text-slate-300" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-950"></span>
          </button>
        </div>

        {/* Action Required Alert */}
        {stats.pendingActions > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate("/app/mobile/tasks")}
            className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center justify-between active:scale-95 transition-transform"
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-rose-400" />
              <div>
                <h4 className="text-white font-semibold text-sm">
                  Action Required
                </h4>
                <p className="text-rose-200/80 text-xs">
                  You have {stats.pendingActions} pending approvals
                </p>
              </div>
            </div>
            <div className="bg-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              Review
            </div>
          </motion.div>
        )}

        {/* KPI Grid */}
        <div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
            Field Metrics
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={CheckSquare}
              label="Tasks Today"
              value={stats.tasksToday}
              color="indigo"
              onClick={() => navigate("/app/mobile/tasks")}
            />
            <StatCard
              icon={TrendingUp}
              label="Active Jobs"
              value={stats.projectsActive}
              color="emerald"
              onClick={() => navigate("/app/mobile/projects")}
            />
          </div>
        </div>

        {/* Offline Sync Queue representation */}
        <div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
            Recent Activity
          </h3>
          <div className="space-y-3">
            <ActivityCard
              icon={CheckSquare}
              title="Equipment Inspection"
              desc="Task completed & synced"
              time="15m ago"
              status="synced"
            />
            <ActivityCard
              icon={Camera}
              title="Site Photos.jpg"
              desc="Pending wifi connection"
              time="1h ago"
              status="offline"
            />
            <ActivityCard
              icon={Mic}
              title="Client Voice Note"
              desc="Transcribed by AI"
              time="2h ago"
              status="synced"
            />
          </div>
        </div>
      </div>

      {/* 
        Phase 6 Floating Action Cluster 
        This entirely replaces the traditional "Action Grid" with a native app-like Dock 
      */}
      <div className="fixed bottom-20 left-4 right-4 z-50 flex justify-center">
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 p-2 rounded-full shadow-2xl flex items-center space-x-2">
          <DockButton
            icon={Camera}
            label="Photo"
            color="text-sky-400"
            onClick={() => navigate("/app/mobile/upload?camera=true")}
          />
          <DockButton
            icon={Mic}
            label="Note"
            color="text-indigo-400"
            onClick={() => {}}
          />
          <DockButton
            icon={MapPin}
            label="Check-In"
            color="text-emerald-400"
            onClick={() => {}}
          />
          <div className="w-px h-8 bg-white/10 mx-2" />
          <button
            onClick={() => navigate("/app/mobile/tasks/new")}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full p-4 shadow-[0_0_20px_rgba(79,70,229,0.4)] active:scale-95 transition-transform"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}

function DockButton({ icon: Icon, label, color, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center w-16 h-16 rounded-full hover:bg-white/5 active:bg-white/10 transition-colors"
    >
      <Icon className={`w-6 h-6 mb-1 ${color}`} />
      <span className="text-[10px] font-medium text-slate-400">{label}</span>
    </button>
  );
}

function StatCard({ icon: Icon, label, value, color, onClick }: any) {
  const colorClasses = {
    indigo: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`p-5 rounded-2xl border ${colorClasses[color as keyof typeof colorClasses]} text-left transition-all backdrop-blur-md`}
    >
      <div className="flex justify-between items-start mb-4">
        <Icon className="w-6 h-6" />
        <span className="text-3xl font-black">{value}</span>
      </div>
      <div className="text-sm font-semibold opacity-90">{label}</div>
    </motion.button>
  );
}

function ActivityCard({ icon: Icon, title, desc, time, status }: any) {
  return (
    <div className="flex items-center gap-4 p-4 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 active:bg-white/5 transition-colors">
      <div
        className={`p-3 rounded-xl flex-shrink-0 ${status === "offline" ? "bg-amber-500/10 text-amber-500" : "bg-slate-800 text-indigo-400"}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-medium text-sm mb-0.5 truncate">
          {title}
        </h4>
        <div className="flex items-center space-x-2">
          <p className="text-xs text-slate-400 truncate">{desc}</p>
          <span className="text-slate-600 text-xs">•</span>
          <span className="text-xs text-slate-500 flex-shrink-0">{time}</span>
        </div>
      </div>
    </div>
  );
}
