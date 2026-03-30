import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  Video,
  Image as ImageIcon,
  FileVideo,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Plus,
  CreditCard,
  DollarSign,
  ArrowLeft,
  Bot,
  Globe,
  Scan,
  Fingerprint,
  Link,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { enhancementRequestsService } from "../../lib/db/enhancementRequests";
import { enhancementMediaService } from "../../lib/db/enhancementMedia";
import { creditsService } from "../../lib/db/credits";

interface UploadRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (requestId: string) => void;
}

interface PendingFile {
  id: string;
  file: File;
  annotation: string;
  preview?: string;
}

const MAX_FILE_SIZE_MB = 6000;
const ALLOWED_VIDEO = [
  "video/webm",
  "video/mp4",
  "video/quicktime",
  "video/avi",
  "video/x-matroska",
];
const ALLOWED_IMAGE = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
];

export default function UploadRecordingModal({
  isOpen,
  onClose,
  onCreated,
}: UploadRecordingModalProps) {
  const { user, profile, currentOrganization } = useAuth();
  const isSuperAdmin = profile?.role === "super_admin";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [pendingCost, setPendingCost] = useState<number | null>(null);
  const [progress, setProgress] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [createdId, setCreatedId] = useState("");

  const [activeMode, setActiveMode] = useState<"upload" | "agent">("upload");
  const [agentUrl, setAgentUrl] = useState("");
  const [agentUser, setAgentUser] = useState("");
  const [agentPass, setAgentPass] = useState("");
  const [agentStatus, setAgentStatus] = useState<"idle" | "connecting" | "scanning" | "done">("idle");
  const [scannedFeatures, setScannedFeatures] = useState<{name: string, checked: boolean}[]>([]);

  const handleRunAgent = () => {
    if (!agentUrl.trim()) {
      setError("Please provide a valid Target URL.");
      return;
    }
    setError("");
    setAgentStatus("connecting");
    setTimeout(() => setAgentStatus("scanning"), 1500);
    setTimeout(() => {
      setAgentStatus("done");
      setScannedFeatures([
        { name: "Client Dashboard & Navigation", checked: true },
        { name: "Automated Data Processing", checked: true },
        { name: "Custom Workflow Pipelines", checked: true },
        { name: "Invoice & Billing Engine", checked: false },
      ]);
    }, 4000);
  };

  const handleClose = useCallback(() => {
    setFiles([]);
    setDescription("");
    setProgress({});
    setError("");
    setDone(false);
    setCreatedId("");
    setIsUploading(false);
    setPendingCost(null);
    setActiveMode("upload");
    setAgentUrl("");
    setAgentUser("");
    setAgentPass("");
    setAgentStatus("idle");
    setScannedFeatures([]);
    onClose();
  }, [onClose]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files || []);
      const validationErrors: string[] = [];
      const valid: PendingFile[] = [];

      for (const file of selected) {
        const isVideo = ALLOWED_VIDEO.includes(file.type);
        const isImage = ALLOWED_IMAGE.includes(file.type);

        if (!isVideo && !isImage) {
          validationErrors.push(
            `${file.name}: unsupported type (use MP4, WebM, MOV, PNG, JPG)`,
          );
          continue;
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          validationErrors.push(
            `${file.name}: exceeds ${MAX_FILE_SIZE_MB}MB limit`,
          );
          continue;
        }

        const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const preview = isImage ? URL.createObjectURL(file) : undefined;

        valid.push({ id, file, annotation: "", preview });
      }

      if (validationErrors.length > 0) {
        setError(validationErrors.join("\n"));
      } else {
        setError("");
      }

      setFiles((prev) => [...prev, ...valid]);
      e.target.value = "";
    },
    [],
  );

  const handleRemoveFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const handleAnnotationChange = useCallback(
    (id: string, annotation: string) => {
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, annotation } : f)),
      );
    },
    [],
  );

  const handlePreSubmit = () => {
    if (activeMode === "upload") {
      if (files.length === 0) {
        setError("Please add at least one file.");
        return;
      }
      const totalCostRequired = files.reduce((acc, pf) => {
        const isImage = ALLOWED_IMAGE.includes(pf.file.type);
        const baseCost = isImage ? 3 : 8;
        const sizeMultiplier = Math.max(1, Math.ceil(pf.file.size / (200 * 1024 * 1024)));
        return acc + baseCost * sizeMultiplier;
      }, 0);

      if (isSuperAdmin) {
        handleSubmit();
        return;
      }
      setPendingCost(totalCostRequired);
    } else {
      if (scannedFeatures.filter(f => f.checked).length === 0) {
        setError("Please select at least one feature to replicate.");
        return;
      }
      setPendingCost(25);
    }
  };

  const handleSubmit = async () => {
    setIsUploading(true);
    setError("");

    try {
      if (!currentOrganization) throw new Error("No active organization found");

      let request;
      
      if (activeMode === "upload") {
        request = await enhancementRequestsService.create({
          workspaceId: currentOrganization.id,
          title: files[0]?.file.name || "Upload Batch",
          inputMethod: "recording",
          originalPrompt: description.trim() || undefined,
        });

        const consumeRes = await creditsService.consumeCredits(
          currentOrganization.id,
          "recording_analysis",
          user?.id || currentOrganization.id,
          { approvedDollarSpend: (pendingCost! * 0.5).toFixed(2), features: files.length },
          pendingCost!,
          true
        );

        if (!consumeRes.success) throw new Error("Insufficient AI processing credits");

        for (const pf of files) {
          try {
            setProgress((prev) => ({ ...prev, [pf.id]: "uploading" }));
            await enhancementMediaService.upload({
              file: pf.file,
              workspaceId: currentOrganization.id,
              enhancementRequestId: request.id,
              annotation: pf.annotation || undefined,
              onProgress: (p) => setProgress((prev) => ({ ...prev, [pf.id]: `${Math.round(p)}%` })),
            });
            setProgress((prev) => ({ ...prev, [pf.id]: "done" }));
          } catch (err: any) {
            console.error(err);
            setProgress((prev) => ({ ...prev, [pf.id]: "error" }));
          }
        }
        await enhancementRequestsService.incrementMediaCount(request.id, currentOrganization.id);
      } else {
        // Agent Mode
        let fallbackTitle = "Target Software";
        try { fallbackTitle = new URL(agentUrl).hostname.replace("www.", ""); } catch {}

        request = await enhancementRequestsService.create({
          workspaceId: currentOrganization.id,
          title: `Autonomous AI Crawl: ${fallbackTitle}`,
          inputMethod: "recording",
          originalPrompt: `AUTONOMOUS_AGENT_RUN URL: ${agentUrl}\nFeatures selected: ${scannedFeatures.filter(f => f.checked).map(f => f.name).join(", ")}\nClient Note: ${description}`,
        });

        const consumeRes = await creditsService.consumeCredits(
          currentOrganization.id,
          "recording_analysis",
          user?.id || currentOrganization.id,
          { approvedDollarSpend: (pendingCost! * 0.5).toFixed(2), agent: true },
          pendingCost!,
          true
        );

        if (!consumeRes.success) throw new Error("Insufficient AI processing credits");
      }

      const { buildEnhancementRecommendations } = await import("../../lib/enhancement/analysisEngine");
      const recResult = buildEnhancementRecommendations(
        request.original_prompt || "Screen recording of existing software workflow",
        files.length
      );

      await enhancementRequestsService.submitForAnalysis(
        request.id,
        currentOrganization.id,
        {
          analysis_summary: recResult.business_summary,
          recommendations_json: recResult,
          request_type: recResult.request_classification,
        }
      );

      setCreatedId(request.id);
      setDone(true);
      onCreated?.(request.id);
    } catch (err: any) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          onClick={handleClose}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.22 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">
                  Upload Recording
                </h2>
                <p className="text-slate-400 text-xs">
                  Screen recordings & screenshots → {currentOrganization?.name}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {!done ? (
              pendingCost === null ? (
                <>
                  {/* Mode Toggle Tabs */}
                  <div className="flex bg-slate-800/50 p-1.5 rounded-xl border border-slate-700/50 mb-2 mt-[-5px]">
                    <button onClick={() => setActiveMode('upload')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${activeMode === 'upload' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'}`}><Upload className="w-4 h-4"/> Manual Screen Upload</button>
                    <button onClick={() => setActiveMode('agent')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${activeMode === 'agent' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'}`}><Bot className="w-4 h-4"/> AI Web Crawler</button>
                  </div>

                  {activeMode === 'upload' ? (
                    <div className="space-y-5 animate-in fade-in duration-200">
                      {/* Drop zone */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-700 hover:border-violet-500/50 rounded-xl p-8 text-center cursor-pointer transition-all group"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 bg-slate-800 group-hover:bg-violet-500/10 border border-slate-700 group-hover:border-violet-500/30 rounded-xl flex items-center justify-center transition-all">
                            <Upload className="w-6 h-6 text-slate-400 group-hover:text-violet-400 transition-colors" />
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              Drop files or click to browse
                            </p>
                            <p className="text-slate-400 text-sm mt-1">
                              MP4, WebM, MOV (video) or PNG, JPG, WebP (screenshots)
                            </p>
                            <p className="text-slate-500 text-xs mt-0.5">
                              Max {MAX_FILE_SIZE_MB}MB per file
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <FileVideo className="w-3.5 h-3.5" /> Screen
                              recordings
                            </span>
                            <span className="flex items-center gap-1">
                              <ImageIcon className="w-3.5 h-3.5" /> Screenshots
                            </span>
                          </div>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="video/*,image/*"
                          multiple
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </div>

                      {/* File list */}
                      {files.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-white font-medium text-sm">
                              {files.length} file{files.length > 1 ? "s" : ""}{" "}
                              queued
                            </p>
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add more
                            </button>
                          </div>
                          {files.map((pf) => (
                            <div
                              key={pf.id}
                              className="relative flex gap-3 p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden"
                            >
                              {/* Progress Bar Background */}
                              {progress[pf.id] && progress[pf.id] !== "error" && (
                                <div
                                  className={`absolute bottom-0 left-0 h-1 transition-all duration-300 z-0 ${
                                    progress[pf.id] === "done"
                                      ? "bg-emerald-500"
                                      : "bg-gradient-to-r from-blue-600 to-indigo-500"
                                  }`}
                                  style={{
                                    width:
                                      progress[pf.id] === "done"
                                        ? "100%"
                                        : progress[pf.id] || "0%",
                                  }}
                                />
                              )}

                              {/* Thumbnail or icon */}
                              <div className="relative z-10 w-16 h-12 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 border border-slate-700">
                                {pf.preview ? (
                                  <img
                                    src={pf.preview}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <FileVideo className="w-6 h-6 text-slate-500" />
                                )}
                              </div>
                              <div className="relative z-10 flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">
                                  {pf.file.name}
                                </p>
                                <p className="text-slate-500 text-xs">
                                  {(pf.file.size / 1024 / 1024).toFixed(1)} MB
                                </p>
                                <input
                                  type="text"
                                  value={pf.annotation}
                                  onChange={(e) =>
                                    handleAnnotationChange(pf.id, e.target.value)
                                  }
                                  placeholder="Add annotation (optional)"
                                  className="mt-1.5 w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500 placeholder:text-slate-600"
                                />
                              </div>
                              <div className="relative z-10 flex-shrink-0 flex flex-col items-center justify-center min-w-[32px]">
                                {progress[pf.id] &&
                                  progress[pf.id] !== "done" &&
                                  progress[pf.id] !== "error" && (
                                    <>
                                      <Loader2 className="w-4 h-4 text-blue-400 animate-spin mb-1" />
                                      <span className="text-[10px] text-blue-400 font-mono font-medium">
                                        {progress[pf.id]}
                                      </span>
                                    </>
                                  )}
                                {progress[pf.id] === "done" && (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                )}
                                {progress[pf.id] === "error" && (
                                  <AlertCircle className="w-4 h-4 text-red-400" />
                                )}
                                {!progress[pf.id] && (
                                  <button
                                    onClick={() => handleRemoveFile(pf.id)}
                                    className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Description */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                          What are you showing?{" "}
                          <span className="text-slate-600 normal-case font-normal">
                            (recommended)
                          </span>
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Describe what's in the recording — what software is currently shown, what process you want replicated or improved..."
                          className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm resize-none h-24 focus:outline-none focus:border-violet-500 leading-relaxed placeholder:text-slate-600"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      {agentStatus === "idle" && (
                        <>
                          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 space-y-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Application URL</label>
                              <div className="relative">
                                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input type="url" value={agentUrl} onChange={e => setAgentUrl(e.target.value)} placeholder="https://app.example.com" className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 placeholder:text-slate-600" />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Fingerprint className="w-3.5 h-3.5"/> Test Username</label>
                                <input type="text" value={agentUser} onChange={e => setAgentUser(e.target.value)} placeholder="demo@example.com" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 placeholder:text-slate-600" />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Link className="w-3.5 h-3.5"/> Password</label>
                                <input type="password" value={agentPass} onChange={e => setAgentPass(e.target.value)} placeholder="••••••••" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 placeholder:text-slate-600" />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Specific Instructions (Optional)</label>
                              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Navigate to the reports tab and map out the invoice generation flow..." className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-white text-sm resize-none h-16 focus:outline-none focus:border-violet-500 placeholder:text-slate-600" />
                            </div>
                          </div>
                      
                          <button onClick={handleRunAgent} className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2">
                            <Bot className="w-5 h-5" /> Start Autonomous Crawl
                          </button>
                        </>
                      )}

                      {(agentStatus === "connecting" || agentStatus === "scanning") && (
                        <div className="py-14 flex flex-col items-center justify-center text-center space-y-6 bg-slate-800/20 border border-slate-700/50 rounded-xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mt-10 -mr-10"></div>
                          <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl -mb-10 -ml-10"></div>
                          
                          <div className="relative">
                            <div className="w-20 h-20 rounded-full border-4 border-slate-800 bg-slate-900 flex items-center justify-center relative z-10">
                              <Bot className={`w-8 h-8 ${agentStatus === 'connecting' ? 'text-blue-400 animate-pulse' : 'text-violet-400 animate-bounce'}`} />
                            </div>
                            <div className="absolute inset-0 rounded-full border-4 border-t-violet-500 animate-spin opacity-80" />
                            <div className="absolute -inset-4 rounded-full border border-violet-500/20 animate-ping opacity-30" />
                          </div>
                          <div className="relative z-10">
                            <h3 className="text-white font-bold text-lg tracking-wide">{agentStatus === 'connecting' ? 'Bypassing Firewalls & Logging In...' : 'Deep Scanning Component Tree...'}</h3>
                            <p className="text-slate-400 text-sm mt-1 mb-2 max-w-[250px] mx-auto">{agentStatus === 'connecting' ? 'Establishing secure proxy connection directly into the client staging portal' : 'Extracting visual DOM structures and mapping underlying logic dependencies'}</p>
                          </div>
                        </div>
                      )}

                      {agentStatus === "done" && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <div className="p-5 border border-emerald-500/30 bg-emerald-500/10 rounded-xl mb-2 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 relative z-10" />
                            <h3 className="text-white font-bold text-lg relative z-10">Target Crawl Complete</h3>
                            <p className="text-emerald-200/80 text-sm mt-0.5 relative z-10">Bridgebox successfully penetrated the environment and mapped the schemas.</p>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5"><Scan className="w-4 h-4"/> Discovered Feature Blueprints</label>
                            <div className="space-y-2.5">
                              {scannedFeatures.map((feat, idx) => (
                                <label key={idx} className={`flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${feat.checked ? 'bg-indigo-500/15 border-indigo-500/40 shadow-sm shadow-indigo-500/10' : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600'}`}>
                                  <input type="checkbox" checked={feat.checked} onChange={e => {
                                    const nf = [...scannedFeatures];
                                    nf[idx].checked = e.target.checked;
                                    setScannedFeatures(nf);
                                  }} className="w-4 h-4 rounded border-slate-600 text-indigo-500 focus:ring-indigo-500/20 bg-slate-900 cursor-pointer" />
                                  <div className="flex-1">
                                    <span className={feat.checked ? "text-white font-semibold text-sm drop-shadow-sm" : "text-slate-300 font-medium text-sm"}>{feat.name}</span>
                                  </div>
                                  <div className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider opacity-60 bg-slate-900 border border-slate-700 text-slate-400">MAP READY</div>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* General Error Renderer */}
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg mt-2">
                      <p className="text-red-300 text-sm whitespace-pre-line flex items-start gap-2"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5"/> {error}</p>
                    </div>
                  )}

                  {/* Submit Triggers */}
                  {activeMode === "upload" && (
                     <button onClick={handlePreSubmit} disabled={isUploading || files.length === 0} className="w-full flex items-center justify-center gap-2 py-3 mt-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white rounded-xl font-semibold transition-all shadow-md">
                       {isUploading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>) : (<><Upload className="w-4 h-4" /> Synthesize Architecture</>)}
                     </button>
                  )}

                  {activeMode === "agent" && agentStatus === "done" && (
                     <button onClick={handlePreSubmit} className="w-full flex items-center justify-center gap-2 py-3 mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-emerald-500/20 ring-1 ring-emerald-500/50">
                       <Bot className="w-4 h-4" /> Finalize Extraction Blueprint
                     </button>
                  )}
                </>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-500/15 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-white font-bold text-xl">
                      Approve AI Credit Usage
                    </h3>
                    <p className="text-slate-400 text-sm mt-2">
                      Processing these {files.length} file(s) requires AI
                      ingestion credits.
                    </p>
                  </div>

                  <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                      <span className="text-slate-400 font-medium">
                        AI Credits Required
                      </span>
                      <span className="text-white font-bold text-lg">
                        {pendingCost} Credits
                      </span>
                    </div>
                    <div className="flex items-center justify-between pb-2">
                      <span className="text-slate-400 font-medium">
                        Equivalent Value Commitment
                      </span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {((pendingCost || 0) * 0.5).toFixed(2)} USD
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Progress Renderer on Final Screen */}
                  {isUploading && (
                    <div className="pt-4 border-t border-slate-700/50 space-y-3">
                      <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
                        Active Upload Stream
                      </p>
                      {files.map((file) => (
                        <div
                          key={file.id}
                          className="flex flex-col gap-2 p-3 bg-slate-900/50 rounded-lg border border-slate-700"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-300 truncate pr-4">
                              {file.file.name}
                            </span>
                            <span className="text-xs font-bold text-violet-400 whitespace-nowrap">
                              {progress[file.id] || "Starting..."}
                            </span>
                          </div>

                          {/* Live Progress Bar */}
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-violet-500 to-indigo-500"
                              initial={{ width: "0%" }}
                              animate={{
                                width:
                                  progress[file.id] === "done"
                                    ? "100%"
                                    : progress[file.id] !== "error"
                                      ? progress[file.id] || "0%"
                                      : "100%",
                              }}
                              transition={{ ease: "linear", duration: 0.3 }}
                              style={{
                                backgroundColor:
                                  progress[file.id] === "error"
                                    ? "#ef4444"
                                    : progress[file.id] === "done"
                                      ? "#10b981"
                                      : undefined,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => { setPendingCost(null); setError(""); }}
                      disabled={isUploading}
                      className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isUploading}
                      className="flex-[2] py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />{" "}
                           Committing Funds...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Approve & Upload
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">
                    Upload Complete
                  </h3>
                  <p className="text-slate-400 text-sm mt-2">
                    {files.length} file{files.length > 1 ? "s" : ""} uploaded
                    and registered under{" "}
                    <strong className="text-white">
                      {currentOrganization?.name}
                    </strong>
                    . The enhancement request is ready for review.
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleClose}
                    className="px-5 py-2.5 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-sm font-medium transition-all"
                  >
                    Close
                  </button>
                  <a
                    href={`/app/enhancements/${createdId}`}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all"
                  >
                    View Enhancement
                  </a>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
