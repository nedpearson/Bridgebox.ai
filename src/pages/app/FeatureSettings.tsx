// @ts-nocheck
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Shield, Check, X } from "lucide-react";
import Card from "../../components/Card";
import Heading from "../../components/Heading";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../contexts/AuthContext";
import {
  whiteLabelService,
  FeatureFlag,
  AVAILABLE_FEATURES,
} from "../../lib/db/whiteLabel";
import { hasPermission } from "../../lib/permissions";

export default function FeatureSettings() {
  const { user, currentOrganization, profile } = useAuth();
  const [features, setFeatures] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [planId] = useState("professional");

  const canEdit = hasPermission(profile?.role, "settings", "update");

  useEffect(() => {
    if (currentOrganization) {
      loadFeatures();
    }
  }, [currentOrganization]);

  const loadFeatures = async () => {
    if (!currentOrganization) return;

    try {
      setLoading(true);
      const data = await whiteLabelService.getFeatureFlags(
        currentOrganization.id,
      );
      setFeatures(data);
    } catch (error) {
      console.error("Failed to load features:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (featureKey: string, enabled: boolean) => {
    if (!currentOrganization || !user || !canEdit) return;

    try {
      await whiteLabelService.toggleFeature(
        currentOrganization.id,
        featureKey,
        enabled,
        user.id,
      );
      await loadFeatures();
    } catch (error) {
      console.error("Failed to toggle feature:", error);
      alert("Failed to update feature. Please try again.");
    }
  };

  const getFeatureState = (featureKey: string): boolean => {
    const flag = features.find((f) => f.feature_key === featureKey);
    return flag?.enabled ?? true;
  };

  const featuresByCategory = AVAILABLE_FEATURES.reduce(
    (acc, feature) => {
      if (!acc[feature.category]) {
        acc[feature.category] = [];
      }
      acc[feature.category].push(feature);
      return acc;
    },
    {} as Record<string, typeof AVAILABLE_FEATURES>,
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Heading
          title="Feature Settings"
          subtitle="Enable or disable features for your organization"
          icon={Zap}
        />
        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
          {planId} Plan
        </span>
      </div>

      {!canEdit && (
        <Card className="bg-amber-500/10 border-amber-500/20">
          <p className="text-sm text-amber-300">
            You do not have permission to modify feature settings. Contact your
            administrator.
          </p>
        </Card>
      )}

      <div className="space-y-6">
        {Object.entries(featuresByCategory).map(
          ([category, categoryFeatures]) => (
            <Card key={category}>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-white capitalize">
                  {category} Features
                </h3>
                <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">
                  {categoryFeatures.length}
                </span>
              </div>

              <div className="space-y-3">
                {categoryFeatures.map((feature) => {
                  const enabled = getFeatureState(feature.key);
                  return (
                    <FeatureRow
                      key={feature.key}
                      feature={feature}
                      enabled={enabled}
                      onToggle={handleToggle}
                      disabled={!canEdit}
                    />
                  );
                })}
              </div>
            </Card>
          ),
        )}
      </div>

      {/* Plan Limits Info */}
      <Card className="bg-blue-500/10 border-blue-500/20">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-300 mb-1">
              Feature Availability
            </h4>
            <p className="text-sm text-blue-200">
              Features are controlled by your subscription plan. Upgrade to
              access more features.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

interface FeatureRowProps {
  feature: {
    key: string;
    name: string;
    description: string;
    category: string;
  };
  enabled: boolean;
  onToggle: (key: string, enabled: boolean) => void;
  disabled?: boolean;
}

function FeatureRow({ feature, enabled, onToggle, disabled }: FeatureRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
    >
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <h4 className="text-base font-medium text-white">{feature.name}</h4>
          {enabled ? (
            <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
              <Check className="w-3 h-3 mr-1" />
              Enabled
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">
              <X className="w-3 h-3 mr-1" />
              Disabled
            </span>
          )}
        </div>
        <p className="text-sm text-slate-400">{feature.description}</p>
      </div>

      <button
        onClick={() => onToggle(feature.key, !enabled)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed ${
          enabled ? "bg-blue-500" : "bg-slate-700"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </motion.div>
  );
}
