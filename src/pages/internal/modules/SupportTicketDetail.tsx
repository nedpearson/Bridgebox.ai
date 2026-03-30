import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { supportTicketsApi, SupportTicket } from "../../../lib/supportTickets";
import { supportAiApi } from "../../../lib/supportAi";
import { devTasksAiApi } from "../../../lib/devTasksAi";
import { devQaAiApi } from "../../../lib/devQaAi";
import { SupportSessionProtocol } from "../../../lib/webrtc/SupportSessionProtocol";
import {
  ArrowLeft,
  Play,
  Server,
  Clock,
  Wifi,
  LayoutDashboard,
  BrainCircuit,
  Activity,
  BookOpen,
  User,
  Shield,
  VideoOff,
  MessageSquare,
  Loader2,
  PlayCircle,
  CheckCircle,
  Code2,
  Bug,
  TestTube2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SupportTicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // AI Orchestration
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  // Playback & Session
  const [viewingVideo, setViewingVideo] = useState<string | null>(null);
  const [sessionState, setSessionState] = useState<
    RTCPeerConnectionState | "disconnected"
  >("disconnected");
  const sessionProtocolRef = useRef<SupportSessionProtocol | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (id) {
      loadTicket();
    }
  }, [id]);

  const loadTicket = async () => {
    try {
      setLoading(true);
      const tickets = await supportTicketsApi.getAllTickets();
      const match = tickets.find((t) => t.id === id);
      if (!match) throw new Error("Ticket not found or unauthorized.");
      setTicket(match);
    } catch (err: any) {
      setError(err.message || "Failed to load ticket workspace");
    } finally {
      setLoading(false);
    }
  };

  const handleRunAiTriage = async () => {
    if (!ticket) return;
    try {
      setIsAiProcessing(true);
      await supportAiApi.triggerTriage(ticket);
      await loadTicket(); // Refresh state from DB
    } catch (err: any) {
      alert(err.message || "AI Triage Engine failed.");
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleGenerateDevTask = async () => {
    if (!ticket) return;
    try {
      setIsAiProcessing(true);
      const devTask = await devTasksAiApi.generateFromSupportTicket(ticket);
      navigate(`/app/internal/recording-center/dev-tasks/${devTask.id}`);
    } catch (err: any) {
      alert(err.message || "Failed to generate Development Task context.");
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleGenerateBugReport = async () => {
    if (!ticket) return;
    try {
      setIsAiProcessing(true);
      const bug = await devQaAiApi.generateBugReportFromSource(
        ticket,
        "support_ticket",
      );
      navigate(`/app/internal/recording-center/bug-reports/${bug.id}`);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleGenerateQaTest = async () => {
    if (!ticket) return;
    try {
      setIsAiProcessing(true);
      const qa = await devQaAiApi.generateQaTestCaseFromSource(
        ticket,
        "support_ticket",
      );
      navigate(`/app/internal/recording-center/qa-test-cases/${qa.id}`);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleEscalate = async (type: string, flagField: string) => {
    if (!ticket) return;
    try {
      const updates = {
        escalation_type: type,
        [flagField]: true,
        status: "escalated_to_build",
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("bb_support_tickets")
        .update(updates)
        .eq("id", ticket.id);

      if (error) throw error;

      // Physically orchestrate the handoff into Internal Dev Notes (Command Center)
      const escalationPayload = {
        title: `[Escalation] ${ticket.title}`,
        notes: `AI Summary: ${ticket.ai_summary || ""}\n\nTenant Description: ${ticket.description}\n\nEscalated as: ${type}`,
        path: ticket.recording_path || null,
        status: "pending",
        priority: "high",
        assigned_to: (await supabase.auth.getUser()).data.user?.id,
      };

      await supabase.from("bb_internal_recordings").insert([escalationPayload]);

      await loadTicket();
    } catch (err: any) {
      alert(
        err.message || "Failed to trigger engineering escalation transfer.",
      );
    }
  };

  const handlePlayEvidence = async () => {
    if (!ticket?.recording_path) return;
    try {
      const url = await supportTicketsApi.getRecordingUrl(
        ticket.recording_path,
      );
      setViewingVideo(url);
    } catch (err: any) {
      alert(err.message || "Failed to generate secure viewing url.");
    }
  };

  const handleJoinSession = async () => {
    if (!ticket?.session_code) return;
    try {
      setSessionState("connecting");
      const protocol = new SupportSessionProtocol(ticket.session_code, "admin");
      sessionProtocolRef.current = protocol;

      protocol.onConnectionStateChange = (state) => {
        setSessionState(state);
      };

      protocol.onTrack = (stream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      };

      await protocol.initialize();
    } catch (err) {
      console.error(err);
      alert("Failed to establish WebRTC payload hook.");
    }
  };

  const handleEndSession = () => {
    if (sessionProtocolRef.current) {
      sessionProtocolRef.current.disconnect();
      sessionProtocolRef.current = null;
    }
    setSessionState("disconnected");
  };

  if (loading) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="bg-red-500/10 text-red-500 p-6 rounded-lg font-medium border border-red-500/20 max-w-2xl mt-12 mx-auto text-center">
        {error || "Ticket not found"}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/app/internal/recording-center/support")}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
              <span>{ticket.title}</span>
            </h1>
            <div className="text-slate-400 text-sm flex items-center space-x-4 mt-1">
              <span className="flex items-center space-x-1">
                <LayoutDashboard className="w-4 h-4 text-slate-500" />
                <span>
                  {(ticket as any).organizations?.name ||
                    "Unknown Organization"}
                </span>
              </span>
              <span className="flex items-center space-x-1">
                <User className="w-4 h-4 text-slate-500" />
                <span>
                  {(ticket as any).profiles?.full_name || "Unknown User"}
                </span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>{new Date(ticket.created_at).toLocaleString()}</span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={ticket.status}
            disabled // Hook up later to API call
            className="bg-slate-800 border-slate-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none"
          >
            <option value="open">Open</option>
            <option value="ai_processed">AI Processed</option>
            <option value="in_progress">In Progress</option>
            <option value="escalated_to_build">Escalated to Build</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column: Core Data & Intelligence */}
        <div className="col-span-2 space-y-6">
          {/* Tenant Submission Block */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-slate-800/50 p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-white font-semibold flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span>Tenant Context</span>
              </h3>
              <span className="uppercase tracking-wider text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                {ticket.category?.replace("_", " ")}
              </span>
            </div>
            <div className="p-6">
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {ticket.description ||
                  "No detailed issue description provided by the tenant."}
              </p>
            </div>

            {ticket.recording_path && (
              <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-between items-center">
                <div className="flex items-center space-x-2 text-slate-400 text-sm">
                  <PlayCircle className="w-4 h-4 text-emerald-400" />
                  <span>
                    Has Attached Screen Upload (
                    {((ticket.recording_size || 0) / 1024 / 1024).toFixed(1)}MB)
                  </span>
                </div>
                <button
                  onClick={handlePlayEvidence}
                  className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Parse Recording Payload</span>
                </button>
              </div>
            )}
          </div>

          {/* AI Intelligence Block */}
          <div className="bg-slate-900 border border-indigo-500/20 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.05)]">
            <div className="bg-indigo-500/10 p-4 border-b border-indigo-500/20 flex items-center justify-between">
              <h3 className="text-indigo-400 font-semibold flex items-center space-x-2">
                <BrainCircuit className="w-4 h-4" />
                <span>Automated Operations Intelligence</span>
              </h3>
              {ticket.ai_processed_at ? (
                <span className="text-indigo-500/70 text-xs flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>
                    Orchestrated at{" "}
                    {new Date(ticket.ai_processed_at).toLocaleTimeString()}
                  </span>
                </span>
              ) : (
                <button
                  onClick={handleRunAiTriage}
                  disabled={isAiProcessing}
                  className="px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded text-xs font-medium transition-colors flex items-center space-x-2"
                >
                  {isAiProcessing ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Activity className="w-3 h-3" />
                  )}
                  <span>Execute AI Triage Baseline</span>
                </button>
              )}
            </div>

            {ticket.ai_summary ? (
              <div className="p-6 space-y-4">
                <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800/50">
                  <h4 className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2">
                    Architectural Summary
                  </h4>
                  <p className="text-slate-200">{ticket.ai_summary}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                    <h4 className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">
                      Determined Severity
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`w-2 h-2 rounded-full ${ticket.ai_severity === "high" || ticket.ai_severity === "critical" ? "bg-red-500" : "bg-amber-500"}`}
                      />
                      <span className="text-white capitalize">
                        {ticket.ai_severity}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                    <h4 className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">
                      Probable Product Area
                    </h4>
                    <span className="text-white">{ticket.ai_product_area}</span>
                  </div>
                </div>

                <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800/50">
                  <h4 className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2">
                    Recommended Action Protocol
                  </h4>
                  <p className="text-slate-200">
                    {ticket.ai_recommended_action}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <BrainCircuit className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">
                  Issue has not yet been processed by the Intelligence
                  orchestrator.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Controls & Escalations */}
        <div className="space-y-6">
          {/* Live WebRTC Block */}
          {ticket.session_code && (
            <div
              className={`border rounded-xl p-5 ${sessionState === "connected" ? "bg-emerald-500/10 border-emerald-500/30" : "bg-slate-900 border-slate-800"}`}
            >
              <div className="flex items-center space-x-2 mb-4">
                <Shield
                  className={`w-5 h-5 ${sessionState === "connected" ? "text-emerald-400" : "text-purple-400"}`}
                />
                <h3 className="text-white font-semibold">
                  Active Screen Assist Hook
                </h3>
              </div>
              <p className="text-slate-400 text-xs mb-4">
                Tenant has actively broadcasted an encrypted peer string mapping
                to their viewport context.
              </p>

              <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 mb-4 text-center font-mono text-xl tracking-widest text-slate-300">
                {ticket.session_code}
              </div>

              {sessionState !== "disconnected" ? (
                <button
                  onClick={handleEndSession}
                  className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium transition-colors"
                >
                  Disconnect Peer Binding
                </button>
              ) : (
                <button
                  onClick={handleJoinSession}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Wifi className="w-4 h-4" />
                  <span>Join WebRTC Vector</span>
                </button>
              )}
            </div>
          )}

          {/* Escalation Block */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-white font-semibold flex items-center space-x-2 mb-4">
              <Server className="w-4 h-4 text-orange-400" />
              <span>Internal Build Escalation</span>
            </h3>
            <p className="text-slate-400 text-xs mb-4">
              Transform this support artifact natively into an active internal
              engineering target payload.
            </p>
            <div className="space-y-2">
              <button
                onClick={handleGenerateDevTask}
                disabled={isAiProcessing}
                className="w-full text-left px-4 py-3 bg-fuchsia-600/20 hover:bg-fuchsia-600/30 text-fuchsia-400 font-medium rounded-lg border border-fuchsia-600/30 transition-colors text-sm flex items-center justify-between"
              >
                <span className="flex items-center space-x-2">
                  {isAiProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Code2 className="w-4 h-4" />
                  )}
                  <span>Generate AI Dev Task</span>
                </span>
                <Activity className="w-3 h-3" />
              </button>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  onClick={handleGenerateBugReport}
                  disabled={isAiProcessing}
                  className="flex-1 text-center justify-center px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 font-medium rounded border border-rose-600/30 transition-colors text-sm flex items-center"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  Bug Report
                </button>
                <button
                  onClick={handleGenerateQaTest}
                  disabled={isAiProcessing}
                  className="flex-1 text-center justify-center px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 font-medium rounded border border-indigo-600/30 transition-colors text-sm flex items-center"
                >
                  <TestTube2 className="w-4 h-4 mr-2" />
                  QA Pack
                </button>
              </div>
              <div className="pt-2 mt-2 border-t border-slate-800"></div>
              <button
                onClick={() =>
                  handleEscalate("Product Feature Gap", "feature_gap_flag")
                }
                className="w-full text-left px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors text-sm flex items-center justify-between"
              >
                <span>Mark as Product Gap</span>
                <Activity className="w-3 h-3" />
              </button>
              <button
                onClick={() =>
                  handleEscalate(
                    "Internal Development Focus",
                    "build_candidate_flag",
                  )
                }
                className="w-full text-left px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors text-sm flex items-center justify-between"
              >
                <span>Create Manual Dev Note</span>
                <BookOpen className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Media Playback Modals (WebRTC Video & VOD Video) */}
      <AnimatePresence>
        {sessionState !== "disconnected" && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={handleEndSession}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl max-w-5xl w-full"
            >
              <div className="bg-slate-950 p-4 flex justify-between items-center border-b border-slate-800">
                <div className="flex items-center space-x-4">
                  <h3 className="text-white font-medium flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span>Live Isolation Viewer</span>
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                      sessionState === "connected"
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse"
                    } uppercase tracking-wider`}
                  >
                    {sessionState}
                  </span>
                </div>
                <button
                  onClick={handleEndSession}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1 rounded-md text-sm transition-colors border border-red-500/20 font-medium"
                >
                  Terminate
                </button>
              </div>
              <div className="aspect-video bg-black flex items-center justify-center relative">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-contain"
                />
                {sessionState !== "connected" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm">
                    <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-4" />
                    <p className="text-slate-400 font-medium">
                      Establishing secure Handshake...
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingVideo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setViewingVideo(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl max-w-5xl w-full"
            >
              <div className="bg-slate-950 p-4 flex justify-between items-center border-b border-slate-800">
                <h3 className="text-white font-medium flex items-center space-x-2">
                  <Play className="w-4 h-4 text-blue-400" />
                  <span>Evidence Player</span>
                </h3>
                <button
                  onClick={() => setViewingVideo(null)}
                  className="text-slate-400 hover:text-white px-3 py-1 bg-slate-800 rounded-md text-sm"
                >
                  Close
                </button>
              </div>
              <div className="aspect-video bg-black flex items-center justify-center">
                <video
                  src={viewingVideo}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
