import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Network } from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { useOnboarding } from "../../contexts/OnboardingContext";
import type { CurrentSystems } from "../../types/onboarding";

export default function CurrentSystemsStep() {
  const {
    onboardingData,
    updateOnboardingData,
    saveOnboarding,
    setCurrentStep,
  } = useOnboarding();
  const [systems, setSystems] = useState<CurrentSystems>(
    onboardingData.current_systems || {},
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSystems(onboardingData.current_systems || {});
  }, [onboardingData.current_systems]);

  const handleNext = async () => {
    setIsSaving(true);
    try {
      updateOnboardingData({ current_systems: systems });
      await saveOnboarding();
      setCurrentStep(4);
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card glass className="p-10">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-[#10B981] rounded-xl flex items-center justify-center">
            <Network className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Current Systems</h2>
            <p className="text-slate-400 mt-1">
              Tell us about your existing tools and platforms
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="crm"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                CRM System
              </label>
              <input
                type="text"
                id="crm"
                value={systems.crm || ""}
                onChange={(e) =>
                  setSystems({ ...systems, crm: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="e.g., Salesforce, HubSpot"
              />
            </div>

            <div>
              <label
                htmlFor="erp"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                ERP System
              </label>
              <input
                type="text"
                id="erp"
                value={systems.erp || ""}
                onChange={(e) =>
                  setSystems({ ...systems, erp: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="e.g., NetSuite, SAP"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="accounting"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Accounting Software
              </label>
              <input
                type="text"
                id="accounting"
                value={systems.accounting || ""}
                onChange={(e) =>
                  setSystems({ ...systems, accounting: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="e.g., QuickBooks, Xero"
              />
            </div>

            <div>
              <label
                htmlFor="document_management"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Document Management
              </label>
              <input
                type="text"
                id="document_management"
                value={systems.document_management || ""}
                onChange={(e) =>
                  setSystems({
                    ...systems,
                    document_management: e.target.value,
                  })
                }
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="e.g., SharePoint, Google Drive"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={systems.spreadsheets || false}
                onChange={(e) =>
                  setSystems({ ...systems, spreadsheets: e.target.checked })
                }
                className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0"
              />
              <span className="text-slate-300 group-hover:text-white transition-colors">
                Heavy reliance on spreadsheets
              </span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={systems.internal_dashboards || false}
                onChange={(e) =>
                  setSystems({
                    ...systems,
                    internal_dashboards: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0"
              />
              <span className="text-slate-300 group-hover:text-white transition-colors">
                Existing internal dashboards or reporting tools
              </span>
            </label>
          </div>

          <div>
            <label
              htmlFor="other_systems"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Other Systems or Tools
            </label>
            <textarea
              id="other_systems"
              rows={3}
              value={systems.other?.join(", ") || ""}
              onChange={(e) =>
                setSystems({
                  ...systems,
                  other: e.target.value
                    ? e.target.value.split(",").map((s) => s.trim())
                    : [],
                })
              }
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
              placeholder="Separate multiple systems with commas"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-700">
          <Button variant="outline" onClick={() => setCurrentStep(2)}>
            <ArrowLeft className="mr-2 w-5 h-5" /> Back
          </Button>

          <Button variant="primary" onClick={handleNext} disabled={isSaving}>
            {isSaving ? "Saving..." : "Continue"}{" "}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
