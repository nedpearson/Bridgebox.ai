import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  Sliders,
  CheckCircle2,
  Clock,
  Building2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Sparkles,
  Edit3,
  Save,
  X,
  BarChart3,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Eye,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import {
  calculatePricing,
  fmtCurrency,
  fmtTokens,
} from "../../lib/billing/pricingEngine";
import { calibrateAllActiveModels } from "../../lib/billing/pricingCalibrator";
import CalibrationPanel from "../../components/billing/CalibrationPanel";
import LoadingSpinner from "../../components/LoadingSpinner";

interface PricingModel {
  id: string;
  organization_id: string;
  tier: string;
  status: string;
  base_platform_fee: number;
  estimated_tokens_per_month: number;
  ai_margin_multiplier: number;
  cost_per_1k_tokens: number;
  estimated_ai_monthly_cost: number;
  workflow_count: number;
  estimated_workflow_monthly_cost: number;
  integration_count: number;
  estimated_integration_monthly_cost: number;
  estimated_storage_gb: number;
  estimated_storage_monthly_cost: number;
  custom_feature_count: number;
  estimated_feature_monthly_cost: number;
  support_agent_usage: string;
  estimated_support_monthly_cost: number;
  estimated_total_monthly_cost: number;
  approved_total_monthly_cost: number | null;
  admin_notes: string | null;
  admin_override_applied: boolean;
  ai_inputs_snapshot: any;
  created_at: string;
  organizations?: { name: string; industry: string };
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  draft: { label: "Draft", color: "text-slate-400", bg: "bg-slate-400/10" },
  pending_review: {
    label: "Pending",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  approved: {
    label: "Approved",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  active: { label: "Active", color: "text-blue-400", bg: "bg-blue-400/10" },
  archived: { label: "Archived", color: "text-slate-600", bg: "bg-slate-800" },
};

export default function PricingCommandCenter() {
  const [models, setModels] = useState<PricingModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [overrideValues, setOverrideValues] = useState<Partial<PricingModel>>(
    {},
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedTab, setExpandedTab] = useState<"detail" | "calibration">(
    "detail",
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [bulkCalibrating, setBulkCalibrating] = useState(false);
  const [bulkResult, setBulkResult] = useState<string | null>(null);

  // Summary stats
  const totalPipeline = models.reduce(
    (s, m) => s + (m.estimated_total_monthly_cost || 0),
    0,
  );
  const approvedRevenue = models
    .filter((m) => ["approved", "active"].includes(m.status))
    .reduce(
      (s, m) =>
        s +
        (m.approved_total_monthly_cost || m.estimated_total_monthly_cost || 0),
      0,
    );
  const pendingModels = models.filter(
    (m) => m.status === "pending_review",
  ).length;

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const { data, error } = await supabase
        .from("bb_pricing_models")
        .select("*, bb_organizations(name, industry)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setModels(data || []);
    } catch (err) {
      console.error("Failed to load pricing models", err);
    } finally {
      setLoading(false);
    }
  };

  const runBulkCalibration = async () => {
    setBulkCalibrating(true);
    setBulkResult(null);
    try {
      const result = await calibrateAllActiveModels();
      setBulkResult(
        `Calibrated ${result.processed} model(s). ${result.failed} failed.`,
      );
      await loadModels();
    } catch (err: any) {
      setBulkResult(`Failed: ${err.message}`);
    } finally {
      setBulkCalibrating(false);
    }
  };

  const startEdit = (model: PricingModel) => {
    setEditingId(model.id);
    setOverrideValues({
      base_platform_fee: model.base_platform_fee,
      ai_margin_multiplier: model.ai_margin_multiplier,
      approved_total_monthly_cost:
        model.approved_total_monthly_cost ?? model.estimated_total_monthly_cost,
      admin_notes: model.admin_notes || "",
    });
  };

  const saveOverride = async (modelId: string) => {
    setSavingId(modelId);
    try {
      const overriddenTotal = overrideValues.approved_total_monthly_cost;
      await supabase
        .from("bb_pricing_models")
        .update({
          base_platform_fee: overrideValues.base_platform_fee,
          ai_margin_multiplier: overrideValues.ai_margin_multiplier,
          approved_total_monthly_cost: overriddenTotal,
          admin_notes: overrideValues.admin_notes,
          admin_override_applied: true,
        })
        .eq("id", modelId);
      setEditingId(null);
      await loadModels();
    } catch (err) {
      console.error("Failed to save override", err);
    } finally {
      setSavingId(null);
    }
  };

  const updateStatus = async (modelId: string, status: string) => {
    try {
      const updates: any = { status };
      if (status === "approved") {
        updates.approved_at = new Date().toISOString();
      }
      await supabase
        .from("bb_pricing_models")
        .update(updates)
        .eq("id", modelId);
      await loadModels();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const filteredModels =
    filterStatus === "all"
      ? models
      : models.filter((m) => m.status === filterStatus);

  const getMarginPercent = (model: PricingModel) => {
    const margin = ((model.ai_margin_multiplier || 1.4) - 1) * 100;
    return margin.toFixed(0);
  };

  const getRawAiCost = (model: PricingModel) => {
    const tokens = model.estimated_tokens_per_month || 0;
    return (tokens / 1000) * (model.cost_per_1k_tokens || 0.002);
  };

  const getProfitOnAi = (model: PricingModel) => {
    const raw = getRawAiCost(model);
    return (model.estimated_ai_monthly_cost || 0) - raw;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <DollarSign className="w-6 h-6 mr-2 text-indigo-500" />
              Pricing Command Center
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Review, override, and approve AI-generated client pricing models
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={runBulkCalibration}
              disabled={bulkCalibrating}
              className="flex items-center px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {bulkCalibrating ? "Calibrating…" : "Calibrate All"}
            </button>
            <button
              onClick={loadModels}
              className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
        {bulkResult && (
          <p className="text-sm text-slate-400 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
            {bulkResult}
          </p>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total Pipeline",
              value: fmtCurrency(totalPipeline) + "/mo",
              icon: <TrendingUp className="w-5 h-5" />,
              color: "text-blue-400",
            },
            {
              label: "Approved MRR",
              value: fmtCurrency(approvedRevenue) + "/mo",
              icon: <CheckCircle2 className="w-5 h-5" />,
              color: "text-emerald-400",
            },
            {
              label: "Pending Review",
              value: `${pendingModels} models`,
              icon: <Clock className="w-5 h-5" />,
              color: "text-amber-400",
            },
            {
              label: "Total Clients",
              value: `${models.length} total`,
              icon: <Building2 className="w-5 h-5" />,
              color: "text-violet-400",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5"
            >
              <div className={`${stat.color} mb-3`}>{stat.icon}</div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">
                {stat.label}
              </p>
              <p className="text-white text-xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex space-x-2">
          {[
            "all",
            "pending_review",
            "approved",
            "active",
            "draft",
            "archived",
          ].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                filterStatus === status
                  ? "bg-indigo-500 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
              }`}
            >
              {status === "all"
                ? "All"
                : STATUS_CONFIG[status]?.label || status}
            </button>
          ))}
        </div>

        {/* Models Table */}
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredModels.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No pricing models found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredModels.map((model) => {
              const statusCfg =
                STATUS_CONFIG[model.status] || STATUS_CONFIG.draft;
              const isEditing = editingId === model.id;
              const isExpanded = expandedId === model.id;
              const rawAiCost = getRawAiCost(model);
              const aiProfit = getProfitOnAi(model);

              return (
                <motion.div
                  key={model.id}
                  layout
                  className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
                >
                  {/* Row Header */}
                  <div className="flex items-center justify-between p-5">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-white font-semibold">
                          {(model as any).organizations?.name ||
                            "Unknown Client"}
                        </p>
                        <p className="text-slate-500 text-xs mt-0.5 capitalize">
                          {(model as any).organizations?.industry ||
                            "Industry unknown"}{" "}
                          • {model.tier} tier
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-right hidden md:block">
                        <p className="text-slate-500 text-xs">AI Cost (Raw)</p>
                        <p className="text-slate-300 text-sm font-medium">
                          {fmtCurrency(rawAiCost)}
                        </p>
                      </div>
                      <div className="text-right hidden md:block">
                        <p className="text-slate-500 text-xs">AI Profit</p>
                        <p className="text-emerald-400 text-sm font-medium">
                          +{fmtCurrency(aiProfit)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-500 text-xs">Est. Monthly</p>
                        <p className="text-white text-lg font-bold">
                          {fmtCurrency(
                            model.approved_total_monthly_cost ??
                              model.estimated_total_monthly_cost,
                          )}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${statusCfg.color} ${statusCfg.bg}`}
                      >
                        {statusCfg.label}
                      </span>
                      <div className="flex items-center space-x-2">
                        {model.status === "pending_review" && (
                          <button
                            onClick={() => updateStatus(model.id, "approved")}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        {model.status === "approved" && (
                          <button
                            onClick={() => updateStatus(model.id, "active")}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
                          >
                            Activate
                          </button>
                        )}
                        <button
                          onClick={() => startEdit(model)}
                          className="p-1.5 text-slate-400 hover:text-white transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setExpandedId(isExpanded ? null : model.id)
                          }
                          className="p-1.5 text-slate-400 hover:text-white transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Override Editor */}
                  <AnimatePresence>
                    {isEditing && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-800 bg-slate-950 p-5"
                      >
                        <h4 className="text-white font-medium mb-4 flex items-center">
                          <Sliders className="w-4 h-4 mr-2 text-amber-400" />
                          Admin Override Controls
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          {[
                            {
                              label: "Base Platform Fee ($)",
                              key: "base_platform_fee" as const,
                            },
                            {
                              label: "AI Margin Multiplier (x)",
                              key: "ai_margin_multiplier" as const,
                            },
                            {
                              label: "Approved Total Monthly ($)",
                              key: "approved_total_monthly_cost" as const,
                            },
                          ].map((field) => (
                            <div key={field.key}>
                              <label className="block text-slate-400 text-xs font-medium mb-1.5">
                                {field.label}
                              </label>
                              <input
                                type="number"
                                value={String(overrideValues[field.key] ?? "")}
                                onChange={(e) =>
                                  setOverrideValues((prev) => ({
                                    ...prev,
                                    [field.key]: parseFloat(e.target.value),
                                  }))
                                }
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="mb-4">
                          <label className="block text-slate-400 text-xs font-medium mb-1.5">
                            Admin Notes
                          </label>
                          <textarea
                            rows={2}
                            value={overrideValues.admin_notes || ""}
                            onChange={(e) =>
                              setOverrideValues((prev) => ({
                                ...prev,
                                admin_notes: e.target.value,
                              }))
                            }
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                            placeholder="Reason for override..."
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="flex items-center px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm"
                          >
                            <X className="w-4 h-4 mr-1" /> Cancel
                          </button>
                          <button
                            onClick={() => saveOverride(model.id)}
                            disabled={savingId === model.id}
                            className="flex items-center px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            {savingId === model.id ? (
                              <>
                                <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-1.5" />
                                Save Override
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Expanded Detail */}
                  <AnimatePresence>
                    {isExpanded && !isEditing && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-800 overflow-hidden"
                      >
                        {/* Tab bar */}
                        <div className="flex border-b border-slate-800">
                          {(["detail", "calibration"] as const).map((tab) => (
                            <button
                              key={tab}
                              onClick={() => setExpandedTab(tab)}
                              className={`px-5 py-3 text-xs font-semibold capitalize transition-colors ${
                                expandedTab === tab
                                  ? "text-white border-b-2 border-indigo-500 -mb-px"
                                  : "text-slate-500 hover:text-slate-300"
                              }`}
                            >
                              {tab === "calibration"
                                ? "🔬 Calibration & Prediction"
                                : "📋 Detail"}
                            </button>
                          ))}
                        </div>

                        <div className="p-5">
                          {expandedTab === "detail" ? (
                            <>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                  {
                                    label: "Tokens/Month",
                                    value: fmtTokens(
                                      model.estimated_tokens_per_month,
                                    ),
                                  },
                                  {
                                    label: "AI Margin",
                                    value: `${getMarginPercent(model)}%`,
                                  },
                                  {
                                    label: "Workflows",
                                    value: model.workflow_count,
                                  },
                                  {
                                    label: "Integrations",
                                    value: model.integration_count,
                                  },
                                  {
                                    label: "Storage (GB)",
                                    value: `${model.estimated_storage_gb} GB`,
                                  },
                                  {
                                    label: "Custom Features",
                                    value: model.custom_feature_count,
                                  },
                                  {
                                    label: "Support Tier",
                                    value: model.support_agent_usage,
                                  },
                                  {
                                    label: "Override Applied",
                                    value: model.admin_override_applied
                                      ? "Yes"
                                      : "No",
                                  },
                                ].map((item) => (
                                  <div
                                    key={item.label}
                                    className="bg-slate-800/50 rounded-lg p-3"
                                  >
                                    <p className="text-slate-500 text-xs">
                                      {item.label}
                                    </p>
                                    <p className="text-white text-sm font-medium mt-0.5">
                                      {String(item.value)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                              {model.admin_notes && (
                                <div className="mt-4 p-3 bg-amber-400/5 border border-amber-400/20 rounded-lg">
                                  <p className="text-amber-400 text-xs font-medium mb-1">
                                    Admin Notes
                                  </p>
                                  <p className="text-slate-300 text-sm">
                                    {model.admin_notes}
                                  </p>
                                </div>
                              )}
                            </>
                          ) : (
                            <CalibrationPanel
                              organizationId={model.organization_id}
                              pricingModelId={model.id}
                              organizationName={
                                (model as any).organizations?.name
                              }
                            />
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
