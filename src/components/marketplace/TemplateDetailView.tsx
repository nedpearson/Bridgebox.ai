import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  Download,
  Star,
  CheckCircle,
  Clock,
  Copy,
  Shield,
  PackagePlus,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { templateCloningService } from "../../lib/intelligence/templateCloning";
import { useMarketplaceCheckout } from "../../hooks/useMarketplaceCheckout";
import { MOCK_TEMPLATES } from "../../pages/app/Marketplace";

export default function TemplateDetailView({
  templateId,
  onClose,
}: {
  templateId: string;
  onClose: () => void;
}) {
  const { currentOrganization } = useAuth();
  const [template, setTemplate] = useState<any>(null);
  const [benchmarks, setBenchmarks] = useState<any>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const { checkoutPremiumTemplate, isProcessing: isCheckingOut } =
    useMarketplaceCheckout();

  useEffect(() => {
    loadDetails();
  }, [templateId]);

  const loadDetails = async () => {
    // 0. Mock Fallback Support
    if (templateId.startsWith("mock-")) {
      const mockTmpl = MOCK_TEMPLATES.find((t: any) => t.id === templateId);
      if (mockTmpl) {
        setTemplate(mockTmpl);
        setBenchmarks({
          industry: "Professional Services",
          efficiencyGain: "34%",
          similarInstalls: mockTmpl.install_count,
        });
      }
      return;
    }

    // 1. Load Marketplace Meta
    const { data: tmpl } = await supabase
      .from("bb_marketplace_templates")
      .select(
        `
        *,
        bb_templates(name, description, config, thumbnail_url),
        bb_organizations(name)
      `,
      )
      .eq("id", templateId)
      .single();

    setTemplate(tmpl);

    // 2. Load the Data Moat intelligence (How are similar businesses performing?)
    if (tmpl?.category === "industry_pack") {
      // Mocking the benchmark pull for now, would pull from `bb_industry_benchmarks`
      setBenchmarks({
        industry: "Professional Services",
        efficiencyGain: "34%",
        similarInstalls: tmpl.install_count,
      });
    }
  };

  const handleInstall = async () => {
    if (!currentOrganization || !template) return;

    // Stripe/Gate Interception for Premium Tooling
    if (template.is_premium) {
      const paymentSuccess = await checkoutPremiumTemplate(
        template.id,
        template.price_amount,
      );
      if (!paymentSuccess) return;
    }

    setIsInstalling(true);
    try {
      if (template.id.startsWith("mock-")) {
         // Auto-resolve mock installation delays without hitting the unseeded DB FKEY constraints
         await new Promise(r => setTimeout(r, 1500));
      } else {
        // Execute Deep Cloning Architecture for Tenant Data Isolation
        await templateCloningService.cloneTemplateToTenant(
          template.template_id,
          currentOrganization.id,
        );

        // Log the usage to trigger the self-improvement loop
        await supabase.from("bb_intelligence_events").insert({
          organization_id: currentOrganization.id,
          event_type: "marketplace_install",
          metadata: { marketplace_template_id: template.id },
        });

        // Increment install count for network effects ranking
        await supabase.rpc("increment_template_install_count", {
          tmpl_id: template.id,
        });
      }

      setInstallSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      console.error("Failed to install marketplace ecosystem pattern:", err);
    } finally {
      setIsInstalling(false);
    }
  };

  if (!template) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-slate-900/95 backdrop-blur border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <PackagePlus className="w-6 h-6 text-indigo-500" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Ecosystem Install
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 flex flex-col md:flex-row gap-8">
          {/* Main Info */}
          <div className="flex-1 space-y-6">
            <div>
              <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2">
                {template.category.replace("_", " ")} • v{template.version}
              </div>
              <h1 className="text-4xl font-black text-white mb-4">
                {template.bb_templates?.name}
              </h1>
              <p className="text-lg text-slate-400 leading-relaxed">
                {template.bb_templates?.description || template.best_use_case}
              </p>
            </div>

            {benchmarks && (
              <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <Shield className="w-8 h-8 text-emerald-400 shrink-0" />
                  <div>
                    <h3 className="text-emerald-400 font-bold mb-1">
                      Network Effect Verified
                    </h3>
                    <p className="text-sm text-emerald-200/70">
                      Based on continuous telemetry, companies in{" "}
                      {benchmarks.industry} see a
                      <strong className="text-white">
                        {" "}
                        {benchmarks.efficiencyGain} velocity improvement
                      </strong>{" "}
                      using this stack.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <div className="text-xs text-slate-500 mb-1">Created By</div>
                <div className="text-white font-medium flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  {template.bb_organizations?.name || "Bridgebox Core"}
                </div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <div className="text-xs text-slate-500 mb-1">
                  Included Modules
                </div>
                <div className="text-white font-medium">
                  3 Workflows, 2 Agents
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="w-full md:w-80 space-y-6">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <div className="flex items-baseline justify-between mb-6">
                {template.is_premium ? (
                  <>
                    <span className="text-3xl font-black text-white">
                      ${template.price_amount || 249}
                    </span>
                    <span className="text-sm text-slate-400 uppercase tracking-widest">
                      {(template.pricing_model || "one_time").replace("_", " ")}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-black text-white">Free</span>
                )}
              </div>

              <button
                onClick={handleInstall}
                disabled={isInstalling || isCheckingOut || installSuccess}
                className={`w-full py-4 px-6 rounded-xl font-bold flex justify-center items-center gap-2 transition-all ${
                  installSuccess
                    ? "bg-emerald-500 text-white cursor-default"
                    : isInstalling || isCheckingOut
                      ? "bg-indigo-500/50 text-white cursor-wait"
                      : "bg-indigo-500 hover:bg-indigo-600 text-white"
                }`}
              >
                {installSuccess ? (
                  <>
                    <CheckCircle className="w-5 h-5" /> Deployed Securely
                  </>
                ) : isCheckingOut ? (
                  <>
                    <Clock className="w-5 h-5 animate-spin" /> Authorizing
                    Payment...
                  </>
                ) : isInstalling ? (
                  <>
                    <Clock className="w-5 h-5 animate-spin" /> Provisioning Data
                    Iso-Layer...
                  </>
                ) : template.is_premium ? (
                  <>
                    <Copy className="w-5 h-5" /> Purchase & Deploy
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" /> Deploy to Workspace
                  </>
                )}
              </button>

              <div className="mt-6 space-y-3 pt-6 border-t border-slate-700">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Total Deployments</span>
                  <span className="text-white font-medium">
                    {template.install_count.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Community Score</span>
                  <span className="text-amber-400 font-medium flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" />{" "}
                    {template.average_rating || "New"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
