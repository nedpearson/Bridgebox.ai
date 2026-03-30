import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { Logger } from "../../lib/logger";
import {
  ChevronRight,
  ChevronLeft,
  Building2,
  Zap,
  DollarSign,
  Lock,
  MapPin,
  CheckCircle2,
  Server,
  Smartphone,
  LayoutTemplate,
  Bot,
} from "lucide-react";
import { calculatePricing } from "../../lib/pricingEngine";

const STEPS = [
  { id: "identity", title: "Identity", icon: Building2 },
  { id: "powerups", title: "Power-Ups", icon: Zap },
  { id: "pricing", title: "Pricing", icon: DollarSign },
  { id: "account", title: "Finalize", icon: Lock },
];

const INDUSTRIES = [
  "Legal",
  "Accounting",
  "Retail",
  "Logistics",
  "Med Spa",
  "Consulting",
];
const MODELS = [
  "B2B Services",
  "B2C Services",
  "E-Commerce / Hybrid",
  "Enterprise / Wholesale",
];
const INTEGRATIONS = ["stripe", "quickbooks", "slack", "gmail"];

import { SEO } from "../../components/seo/SEO";

export default function SalesOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [billingInterval, setBillingInterval] = useState<"monthly" | "annual">(
    "annual",
  );
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { user, currentOrganization, signUp } = useAuth();
  const navigate = useNavigate();

  // Unified State
  const [config, setConfig] = useState({
    industry: "Legal",
    model: "B2B Services",
    integrations: ["stripe"] as string[],
    aiUsage: "standard" as "standard" | "high" | "unlimited",
    mobile: false,
    users: 5,
    locations: 1,
    email: "",
    password: "",
    fullName: "",
  });

  const isGhostAccount =
    user?.email?.includes("@sandbox.bridgebox.ai") || false;

  const currentPricing = calculatePricing({
    ...config,
    model: config.model || "B2B Services",
  });

  const handleComplete = async () => {
    setFormError(null);
    setLoading(true);
    try {
      if (isGhostAccount) {
        const { error: updateError } = await supabase.auth.updateUser({
          email: config.email,
          password: config.password,
        });
        if (updateError) throw updateError;
        await supabase
          .from("bb_organizations")
          .update({
            name: `${config.fullName}'s Workspace`,
            organization_type: "client",
          })
          .eq("id", currentOrganization?.id);
        Logger.info("[Analytics] Demo Converted to Paid Pipeline", {
          industry: config.industry,
          planValue: currentPricing.monthlyMsrp,
          tier: currentPricing.tier,
        });
      } else {
        try {
          await signUp(config.email, config.password, config.fullName);
        } catch (signUpErr: any) {
          // Supabase returns this when the email is already registered
          if (
            signUpErr?.message?.toLowerCase().includes("already registered") ||
            signUpErr?.message
              ?.toLowerCase()
              .includes("already been registered") ||
            signUpErr?.status === 422
          ) {
            // Fall back to sign-in — user may have started a demo session previously
            const { error: signInErr } = await supabase.auth.signInWithPassword(
              {
                email: config.email,
                password: config.password,
              },
            );
            if (signInErr)
              throw new Error(
                "An account with this email already exists. If you forgot your password, use the login page.",
              );
          } else {
            throw signUpErr;
          }
        }
        Logger.info("[Analytics] Direct Standard Conversion", {
          industry: config.industry,
        });
      }
      navigate("/app", { replace: true });
    } catch (err: any) {
      console.error("[SalesOnboarding] handleComplete error:", err);
      setFormError(
        err?.message ||
          "Something went wrong. Please check your details and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleIntegration = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      integrations: prev.integrations.includes(id)
        ? prev.integrations.filter((i) => i !== id)
        : [...prev.integrations, id],
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Step 1: Core Identity
        return (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Configure your architecture
            </h2>
            <p className="text-slate-400 mb-8">
              Define your primary operations constraint.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-400 mb-3 block">
                  Primary Sector
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {INDUSTRIES.slice(0, 4).map((ind) => (
                    <button
                      key={ind}
                      onClick={() => setConfig({ ...config, industry: ind })}
                      className={`p-3 text-sm rounded-lg border text-left transition-all ${config.industry === ind ? "border-indigo-500 bg-indigo-500/10 text-white" : "border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700"}`}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-400 mb-3 block">
                  Delivery Model
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {MODELS.slice(0, 2).map((mod) => (
                    <button
                      key={mod}
                      onClick={() => setConfig({ ...config, model: mod })}
                      className={`p-3 text-sm rounded-lg border text-left transition-all ${config.model === mod ? "border-indigo-500 bg-indigo-500/10 text-white" : "border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700"}`}
                    >
                      {mod}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800">
              <label className="text-sm font-medium text-slate-400 mb-6 block flex items-center justify-between">
                <span>Authorized Users ({config.users})</span>
                <span>Locations ({config.locations})</span>
              </label>
              <div className="grid grid-cols-2 gap-8">
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={config.users}
                  onChange={(e) =>
                    setConfig({ ...config, users: parseInt(e.target.value) })
                  }
                  className="w-full accent-indigo-500"
                />
                <input
                  type="range"
                  min="1"
                  max="25"
                  value={config.locations}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      locations: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-[#10B981]"
                />
              </div>
            </div>
          </div>
        );

      case 1: // Step 2: Power Ups
        return (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Enable Power-Ups
            </h2>
            <p className="text-slate-400 mb-8">
              Select premium data integrations and limits.
            </p>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-slate-400 mb-3 block">
                  Generative AI Tier
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(["standard", "high", "unlimited"] as const).map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setConfig({ ...config, aiUsage: tier })}
                      className={`p-4 rounded-xl border text-center transition-all ${config.aiUsage === tier ? "border-purple-500 bg-purple-500/10 text-white" : "border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700"}`}
                    >
                      <Bot
                        className={`w-6 h-6 mx-auto mb-2 ${config.aiUsage === tier ? "text-purple-400" : "text-slate-500"}`}
                      />
                      <span className="text-sm font-medium capitalize">
                        {tier}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-400 mb-3 block">
                  Active Integrations
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {INTEGRATIONS.map((i) => (
                    <button
                      key={i}
                      onClick={() => toggleIntegration(i)}
                      className={`p-3 rounded-lg border text-center transition-all ${config.integrations.includes(i) ? "border-indigo-500 bg-indigo-500/10 text-white" : "border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700"}`}
                    >
                      <span className="text-xs font-medium capitalize">
                        {i}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() =>
                    setConfig({ ...config, mobile: !config.mobile })
                  }
                  className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${config.mobile ? "border-[#10B981] bg-[#10B981]/10 text-white" : "border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700"}`}
                >
                  <div className="flex items-center">
                    <Smartphone
                      className={`w-5 h-5 mr-3 ${config.mobile ? "text-[#10B981]" : "text-slate-500"}`}
                    />
                    <span className="font-medium">
                      Native iOS & Android Apps
                    </span>
                  </div>
                  <div
                    className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${config.mobile ? "bg-[#10B981]" : "bg-slate-700"}`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform ${config.mobile ? "translate-x-4" : "translate-x-0"}`}
                    />
                  </div>
                </button>
              </div>
            </div>
          </div>
        );

      case 2: // Step 3: Pricing Preview
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white mb-2">
              Your Dedicated Build
            </h2>
            <p className="text-slate-400 mb-6">
              Designed specifically for {config.users} users in{" "}
              {config.industry}.
            </p>

            <div className="p-8 border border-indigo-500/30 bg-indigo-500/5 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[50px] pointer-events-none" />
              <div className="flex justify-between items-end mb-6 border-b border-slate-700 pb-6 relative">
                <div>
                  <h3 className="text-xl font-medium text-slate-300 flex items-center mb-4">
                    <Server className="w-5 h-5 text-indigo-500 mr-2" />{" "}
                    Bridgebox Complete
                  </h3>
                  <div className="inline-flex bg-slate-900 border border-slate-700 rounded-lg p-1">
                    <button
                      onClick={() => setBillingInterval("annual")}
                      className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${billingInterval === "annual" ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white"}`}
                    >
                      Annual (Save 20%)
                    </button>
                    <button
                      onClick={() => setBillingInterval("monthly")}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${billingInterval === "monthly" ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white"}`}
                    >
                      Monthly
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-5xl font-black text-white">
                    $
                    {billingInterval === "annual"
                      ? currentPricing.annualMsrp
                      : currentPricing.monthlyMsrp}
                  </span>
                  <span className="text-slate-400 ml-2">
                    / {billingInterval === "annual" ? "year" : "month"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <ul className="space-y-3">
                  <li className="flex items-center text-slate-300 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 mr-3" />{" "}
                    Automated Architecture
                  </li>
                  <li className="flex items-center text-slate-300 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 mr-3" />{" "}
                    {config.users} Licensed User Seats
                  </li>
                  <li className="flex items-center text-slate-300 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 mr-3" />{" "}
                    {config.locations} Branch Location
                    {config.locations > 1 ? "s" : ""}
                  </li>
                </ul>
                <ul className="space-y-3">
                  <li className="flex items-center text-slate-300 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 mr-3" />{" "}
                    {config.aiUsage} AI Copilot
                  </li>
                  {config.mobile && (
                    <li className="flex items-center text-slate-300 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-indigo-500 mr-3" />{" "}
                      White-label Mobile Apps
                    </li>
                  )}
                  {config.integrations.length > 0 && (
                    <li className="flex items-center text-slate-300 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-indigo-500 mr-3" />{" "}
                      {config.integrations.length} Premium Hooks
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        );

      case 3: // Step 4: Finalize Account
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white mb-2">
              {isGhostAccount ? "Claim Your Workspace" : "Create Account"}
            </h2>
            <p className="text-slate-400 mb-8">
              {isGhostAccount
                ? "Your demo configuration will instantly migrate to your live profile."
                : "Deploying your command center infrastructure."}
            </p>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Legal Name"
                required
                value={config.fullName}
                onChange={(e) =>
                  setConfig({ ...config, fullName: e.target.value })
                }
                className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-indigo-500 focus:outline-none transition-colors"
              />
              <input
                type="email"
                placeholder="Work Email Address"
                required
                value={config.email}
                onChange={(e) => {
                  setConfig({ ...config, email: e.target.value });
                  setFormError(null);
                }}
                className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-indigo-500 focus:outline-none transition-colors"
              />
              <input
                type="password"
                placeholder="Secure Password (min 8 chars)"
                required
                value={config.password}
                onChange={(e) => {
                  setConfig({ ...config, password: e.target.value });
                  setFormError(null);
                }}
                className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>

            {formError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
              >
                <span className="text-red-400 text-lg leading-none mt-0.5">
                  ⚠
                </span>
                <p className="text-red-300 text-sm leading-relaxed">
                  {formError}
                </p>
              </motion.div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <SEO 
        title="Build Custom Software without Coding - Book a Demo | Bridgebox"
        description="Discuss your enterprise bottlenecks. We'll show you how Bridgebox literally engineers your custom operation software structure during the call."
        canonicalUrl="/sales-onboarding"
      />
      <div className="min-h-screen bg-slate-950 flex flex-col items-center py-12 px-4 selection:bg-indigo-500/30">
      {/* Progress Tracker */}
      <div className="w-full max-w-4xl mb-12 flex justify-center items-center px-4 space-x-4 sm:space-x-12">
        {STEPS.map((step, idx) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors ${idx <= currentStep ? "bg-indigo-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]" : "bg-slate-800 text-slate-500"}`}
              >
                <step.icon className="w-5 h-5" />
              </div>
              <span
                className={`text-xs font-bold uppercase tracking-wider ${idx <= currentStep ? "text-indigo-500" : "text-slate-600"}`}
              >
                {step.title}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`h-0.5 w-12 sm:w-24 mb-6 rounded-full transition-colors ${idx < currentStep ? "bg-indigo-500" : "bg-slate-800"}`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Wizard Pane */}
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 relative overflow-hidden min-h-[500px] flex flex-col justify-between shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        <div className="flex justify-between items-center pt-8 mt-8 border-t border-slate-800 relative z-10">
          <button
            onClick={() => setCurrentStep((c) => Math.max(0, c - 1))}
            className={`flex items-center px-6 py-3 font-medium text-slate-400 hover:text-white transition-colors ${currentStep === 0 ? "invisible" : ""}`}
          >
            <ChevronLeft className="w-5 h-5 mr-2" /> Back
          </button>

          {currentStep === STEPS.length - 1 ? (
            <button
              onClick={handleComplete}
              disabled={
                !config.email || !config.password || !config.fullName || loading
              }
              className="flex items-center gap-2 px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.2)] disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Deploying…
                </>
              ) : (
                <>
                  Deploy Infrastructure <Lock className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() =>
                setCurrentStep((c) => Math.min(STEPS.length - 1, c + 1))
              }
              className="flex items-center px-8 py-3 bg-white text-slate-900 hover:bg-slate-200 font-bold rounded-xl transition-all shadow-lg"
            >
              Continue <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
