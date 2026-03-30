import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Mic,
  Type,
  Video,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Layers,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Activity,
  Lightbulb,
  Workflow,
  Target,
  Loader2,
  Image as ImageIcon,
  MonitorPlay,
  MousePointerClick,
  Database,
  LayoutTemplate,
  Play,
  Trash2,
} from "lucide-react";
import AppHeader from "../../components/app/AppHeader";
import Card from "../../components/Card";
import Button from "../../components/Button";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorState from "../../components/ErrorState";
import {
  StatusBadgeWES,
  RequestTypeBadge,
} from "../../components/enhancement/StatusBadgeWES";
import { useAuth } from "../../contexts/AuthContext";
import { enhancementRequestsService } from "../../lib/db/enhancementRequests";
import { formatRelativeTime } from "../../lib/dateUtils";
import VirtualPrototypeCanvas from "../../components/enhancement/VirtualPrototypeCanvas";
import FeatureVideoPreview from "../../components/enhancement/FeatureVideoPreview";
import type {
  EnhancementRequest,
  FeatureItem,
  RiskItem,
  ImplementationStep,
  UIStructureItem,
} from "../../types/enhancement";

const INPUT_ICONS = {
  voice: Mic,
  text: Type,
  recording: Video,
  screenshot: ImageIcon,
  mixed: Video,
};

function ConfidenceMeter({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color =
    pct >= 75
      ? "bg-emerald-500"
      : pct >= 50
        ? "bg-yellow-500"
        : "bg-orange-500";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      <span className="text-sm font-bold text-white">{pct}%</span>
    </div>
  );
}

function CollapsibleSection({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
}: any) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card glass className="p-0 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 border-b border-slate-800/50"
      >
        <div className="flex items-center gap-2.5">
          <Icon className="w-4 h-4 text-indigo-400" />
          <span className="text-white font-semibold text-sm">{title}</span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>
      {open && <div className="p-5">{children}</div>}
    </Card>
  );
}

export default function EnhancementDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentOrganization, user } = useAuth();

  const [request, setRequest] = useState<EnhancementRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTourIndex, setActiveTourIndex] = useState(0);
  const [actioning, setActioning] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const data = await enhancementRequestsService.getById(id);
      setRequest(data);
    } catch (err: any) {
      setError(err.message || "Failed to load enhancement request.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = useCallback(async () => {
    if (!request || !currentOrganization) return;
    setActioning(true);
    try {
      await enhancementRequestsService.approve(
        request.id,
        currentOrganization.id,
      );
      await load();
    } finally {
      setActioning(false);
    }
  }, [request, currentOrganization, load]);

  const handleReject = useCallback(async () => {
    if (!request || !currentOrganization) return;
    setActioning(true);
    try {
      await enhancementRequestsService.reject(
        request.id,
        currentOrganization.id,
      );
      await load();
    } finally {
      setActioning(false);
    }
  }, [request, currentOrganization, load]);

  const handleDeleteDraft = useCallback(async () => {
    if (!request || !currentOrganization) return;
    if (!window.confirm("Are you sure you want to permanently delete this stuck draft?")) return;
    
    setActioning(true);
    try {
      await enhancementRequestsService.delete(
        request.id,
        currentOrganization.id,
      );
      navigate("/app/enhancements");
    } catch (err: any) {
      setError(err.message || "Failed to delete draft");
      setActioning(false);
    }
  }, [request, currentOrganization, navigate]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  if (error || !request)
    return <ErrorState message={error || "Enhancement request not found"} />;

  const rec = request.recommendations_json;
  const MethodIcon = INPUT_ICONS[request.input_method] || Sparkles;

  return (
    <>
      <AppHeader
        title={request.title}
        backTo="/app/enhancements"
        backLabel="Enhancement Studio"
      />

      <div className="p-6 md:p-8 space-y-6">
        {/* Status header */}
        <Card glass className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center flex-shrink-0">
                <MethodIcon className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-white font-bold text-xl leading-snug">
                  {request.title}
                </h2>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <StatusBadgeWES status={request.status} />
                  {request.request_type && (
                    <RequestTypeBadge type={request.request_type} />
                  )}
                  <span className="text-slate-500 text-xs flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {formatRelativeTime(request.created_at)}
                  </span>
                  {request.media_count > 0 && (
                    <span className="text-slate-500 text-xs">
                      {request.media_count} media file
                      {request.media_count > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            {request.status === "draft" && (
              <div className="flex items-center gap-3 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDeleteDraft}
                  disabled={actioning}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  {actioning ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-1.5" />
                  )}
                  Delete Draft
                </Button>
              </div>
            )}

            {(request.status === "ready_for_review" ||
              request.status === "submitted") && (
              <div className="flex items-center gap-3 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReject}
                  disabled={actioning}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  {actioning ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-1.5" />
                  )}
                  Reject
                </Button>
                <button
                  onClick={handleApprove}
                  disabled={actioning}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white rounded-lg text-sm font-semibold transition-all"
                >
                  {actioning ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Approve
                </button>
              </div>
            )}
          </div>
        </Card>

        {/* Transcript / original prompt */}
        {(request.transcript || request.original_prompt) && (
          <CollapsibleSection title="Captured Input" icon={FileText}>
            <div className="space-y-3">
              {request.transcript && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">
                    Voice Transcript
                  </p>
                  <p className="text-slate-300 text-sm leading-relaxed bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 whitespace-pre-wrap">
                    {request.transcript}
                  </p>
                </div>
              )}
              {request.original_prompt &&
                request.original_prompt !== request.transcript && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">
                      Original Input
                    </p>
                    <p className="text-slate-300 text-sm leading-relaxed bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 whitespace-pre-wrap">
                      {request.original_prompt}
                    </p>
                  </div>
                )}
            </div>
          </CollapsibleSection>
        )}

        {rec ? (
          <div className="space-y-4">
            {/* Summary + confidence */}
            <CollapsibleSection title="Business Summary" icon={Sparkles}>
              <div className="space-y-4">
                <p className="text-slate-300 text-sm leading-relaxed">
                  {rec.business_summary}
                </p>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                      Analysis Confidence
                    </p>
                    <span className="text-xs text-slate-400">
                      {rec.confidence_score
                        ? `${Math.round(rec.confidence_score * 100)}%`
                        : "N/A"}
                    </span>
                  </div>
                  {rec.confidence_score && (
                    <ConfidenceMeter score={rec.confidence_score} />
                  )}
                </div>
              </div>
            </CollapsibleSection>

            {/* Interactive Virtual Prototype Walkthrough Player */}
            {rec.ui_structure?.length > 0 && (
              <CollapsibleSection
                title={`Virtual Software Preview (${rec.ui_structure.length} Screens)`}
                icon={MonitorPlay}
                defaultOpen={true}
              >
                <div className="bg-[#0b1121] border border-slate-700 rounded-xl overflow-hidden shadow-2xl relative flex flex-col">
                  {/* Top Pagination Control */}
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-700">
                    <div className="flex items-center gap-2">
                      <MonitorPlay className="w-4 h-4 text-indigo-400" />
                      <span className="font-semibold text-white tracking-wide">
                        Interactive Tour
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {rec.ui_structure.map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeTourIndex ? "w-6 bg-indigo-500" : "w-2 bg-slate-700 cursor-pointer hover:bg-slate-600"}`}
                          onClick={() => setActiveTourIndex(idx)}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                      Step {activeTourIndex + 1} of {rec.ui_structure.length}
                    </div>
                  </div>

                  {/* Player Canvas Area */}
                  <div className="relative">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTourIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Literal Visual Prototype Mockup */}
                        <div className="border-b border-slate-700/50 bg-[#060a13]">
                          <VirtualPrototypeCanvas
                            layoutType={
                              rec.ui_structure[activeTourIndex].layout_type ||
                              "generic"
                            }
                            screenName={
                              rec.ui_structure[activeTourIndex].screen_name
                            }
                            onInteract={() => {
                              if (
                                activeTourIndex <
                                rec.ui_structure.length - 1
                              ) {
                                setActiveTourIndex(activeTourIndex + 1);
                              } else {
                                setActiveTourIndex(0); // loop back
                              }
                            }}
                            isLastScreen={
                              activeTourIndex === rec.ui_structure.length - 1
                            }
                          />
                        </div>

                        {/* Schema Canvas Elements (Footer Context) */}
                        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-900/40">
                          {/* Layout Components */}
                          <div className="space-y-2">
                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <LayoutTemplate className="w-3.5 h-3.5" />{" "}
                              Component Architecture
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {rec.ui_structure[activeTourIndex].components.map(
                                (comp: string, cx: number) => (
                                  <div
                                    key={cx}
                                    className="px-2.5 py-1.5 bg-slate-800/80 border border-slate-700/50 rounded-md text-xs text-slate-300 whitespace-nowrap"
                                  >
                                    {comp}
                                  </div>
                                ),
                              )}
                            </div>
                          </div>

                          {/* Data Binding */}
                          <div className="space-y-2">
                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <Database className="w-3.5 h-3.5" /> Bound Model
                              Data
                            </p>
                            <div className="flex flex-col gap-1.5">
                              {rec.ui_structure[
                                activeTourIndex
                              ].data_displayed.map(
                                (data: string, dx: number) => (
                                  <div
                                    key={dx}
                                    className="flex items-center gap-2 text-xs text-emerald-200/80"
                                  >
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></div>
                                    {data}
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Interactive Logic Guide (Overlay) */}
                        <div className="px-5 py-4 bg-indigo-950/20 border-t border-indigo-500/10 flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                            <Play className="w-4 h-4 text-indigo-400 ml-0.5" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-indigo-300 font-semibold">
                              Active Interactions Mapping
                            </p>
                            <div className="flex flex-col gap-1">
                              {rec.ui_structure[
                                activeTourIndex
                              ].interactions.map(
                                (inter: string, ix: number) => (
                                  <p
                                    key={ix}
                                    className="text-xs text-indigo-200/70"
                                  >
                                    <span className="text-indigo-400 font-medium mr-1 border border-indigo-500/30 px-1 rounded">
                                      WHEN
                                    </span>{" "}
                                    {inter}
                                  </p>
                                ),
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </CollapsibleSection>
            )}

            {/* Feature list */}
            {rec.feature_list?.length > 0 && (
              <CollapsibleSection
                title={`Feature Extraction (${rec.feature_list.length})`}
                icon={Layers}
                defaultOpen={true}
              >
                <div className="space-y-2.5">
                  {rec.feature_list.map((f: FeatureItem, i: number) => (
                    <div
                      key={f.id}
                      className="flex items-start gap-3 p-3.5 bg-slate-800/40 border border-slate-700/40 rounded-xl"
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          f.priority === "critical"
                            ? "bg-red-400"
                            : f.priority === "high"
                              ? "bg-orange-400"
                              : f.priority === "medium"
                                ? "bg-yellow-400"
                                : "bg-slate-400"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-white font-semibold text-sm">
                            {f.name}
                          </p>
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                            {f.priority}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-indigo-400/70 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                            {f.source}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs mt-1">
                          {f.description}
                        </p>

                        {/* Literal localized feature video preview mockup */}
                        <FeatureVideoPreview 
                          featureName={f.name} 
                          actualMediaUrl={request.bb_enhancement_media?.find(m => m.file_type === 'video')?.storage_url}
                        />
                      </div>
                      <span className="text-xs text-slate-500 flex-shrink-0 font-mono bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
                        {Math.round(f.confidence * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Workflows */}
            {rec.workflow_breakdown?.length > 0 && (
              <CollapsibleSection
                title={`Workflows Detected (${rec.workflow_breakdown.length})`}
                icon={Workflow}
                defaultOpen={false}
              >
                <div className="space-y-4">
                  {rec.workflow_breakdown.map((wf: any) => (
                    <div
                      key={wf.id}
                      className="p-4 bg-slate-800/40 border border-slate-700/40 rounded-xl space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-semibold text-sm">
                          {wf.name}
                        </h4>
                        {wf.automation_potential && (
                          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            Automatable
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        {wf.steps.map((step: string, i: number) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-sm text-slate-300"
                          >
                            <span className="w-5 h-5 bg-slate-700 rounded-full text-xs text-slate-400 flex items-center justify-center flex-shrink-0">
                              {i + 1}
                            </span>
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Automation opportunities */}
            {rec.automation_opportunities?.length > 0 && (
              <CollapsibleSection
                title="Automation Opportunities"
                icon={Lightbulb}
                defaultOpen={false}
              >
                <div className="space-y-3">
                  {rec.automation_opportunities.map((auto: any, i: number) => (
                    <div
                      key={i}
                      className="p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-1"
                    >
                      <p className="text-emerald-300 font-medium text-sm">
                        {auto.trigger} → {auto.action}
                      </p>
                      <p className="text-slate-400 text-xs">{auto.benefit}</p>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Risks */}
            {rec.risks_and_gaps?.length > 0 && (
              <CollapsibleSection
                title="Risks & Gaps"
                icon={AlertTriangle}
                defaultOpen={false}
              >
                <div className="space-y-3">
                  {rec.risks_and_gaps.map((risk: RiskItem, i: number) => (
                    <div
                      key={i}
                      className={`p-3.5 rounded-xl border space-y-1 ${
                        risk.severity === "high"
                          ? "bg-red-500/5 border-red-500/20"
                          : risk.severity === "medium"
                            ? "bg-yellow-500/5 border-yellow-500/20"
                            : "bg-slate-800/40 border-slate-700/40"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle
                          className={`w-3.5 h-3.5 ${risk.severity === "high" ? "text-red-400" : risk.severity === "medium" ? "text-yellow-400" : "text-slate-400"}`}
                        />
                        <p className="text-white font-semibold text-sm">
                          {risk.area}
                        </p>
                        <span
                          className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${risk.severity === "high" ? "text-red-400" : risk.severity === "medium" ? "text-yellow-400" : "text-slate-400"}`}
                        >
                          {risk.severity}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs">
                        {risk.description}
                      </p>
                      <p className="text-slate-300 text-xs">
                        <span className="text-slate-500">Mitigation: </span>
                        {risk.mitigation}
                      </p>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Implementation plan */}
            {rec.implementation_plan?.length > 0 && (
              <CollapsibleSection
                title="Implementation Plan"
                icon={Target}
                defaultOpen={false}
              >
                <div className="space-y-3">
                  {rec.implementation_plan.map(
                    (step: ImplementationStep, i: number) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 bg-indigo-500/15 border border-indigo-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-indigo-400 text-xs font-bold">
                              {step.phase}
                            </span>
                          </div>
                          {i < rec.implementation_plan.length - 1 && (
                            <div className="w-px flex-1 bg-slate-700/50 mt-2 mb-1" />
                          )}
                        </div>
                        <div className="pb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-white font-semibold text-sm">
                              {step.title}
                            </p>
                            <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                              {step.estimated_effort}
                            </span>
                          </div>
                          <p className="text-slate-400 text-xs">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </CollapsibleSection>
            )}
          </div>
        ) : (
          <Card glass className="py-12 text-center">
            <Activity className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-white font-semibold">
              No analysis available yet
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Analysis will be generated when the request is submitted.
            </p>
          </Card>
        )}
      </div>
    </>
  );
}
