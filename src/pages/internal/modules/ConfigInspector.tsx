import { useState, useEffect } from "react";
import { commandCenterApi } from "../../../lib/commandCenter";
import { useAuth } from "../../../contexts/AuthContext";
import {
  Settings2,
  Key,
  ShieldCheck,
  Database,
  Check,
  X,
  ShieldAlert,
} from "lucide-react";

export default function ConfigInspector() {
  const { user } = useAuth();
  // Always fetch fresh safe state from the local environment parser
  const [config] = useState(commandCenterApi.getSafeConfig());

  useEffect(() => {
    if (user) {
      commandCenterApi
        .logAuditEvent({
          event_type: "access_config_inspector",
          module: "ConfigInspector",
          target_type: "environment",
          target_id: "vite_config",
          metadata_summary: { action: "viewed_redacted_environment_flags" },
          ip_address: null,
          actor_user_id: user.id,
        })
        .catch(console.error);
    }
  }, [user]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-blue-400" />
            Environment Configuration
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Read-only verification of active VITE injection states (Safely
            Redacted).
          </p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex items-center gap-4 bg-slate-950/50">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Vite Runtime Environment
            </h3>
            <div className="flex items-center gap-3 mt-1 text-sm text-slate-400 font-mono">
              <span>
                Mode: <span className="text-blue-400">{config.MODE}</span>
              </span>
              <span>DEV: {config.DEV ? "true" : "false"}</span>
              <span>PROD: {config.PROD ? "true" : "false"}</span>
              <span>SSR: {config.SSR ? "true" : "false"}</span>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4" /> Core Services
            </h4>

            <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-lg">
              <div>
                <span className="text-white font-medium block mb-1">
                  Supabase URL
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {config.SUPABASE_URL_PREFIX}
                </span>
              </div>
              {config.HAS_SUPABASE_URL ? (
                <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded text-xs font-bold">
                  <Check className="w-3 h-3" /> PRESENT
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-400 bg-red-500/10 px-2 py-1 rounded text-xs font-bold">
                  <X className="w-3 h-3" /> MISSING
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-lg">
              <div>
                <span className="text-white font-medium block mb-1">
                  Supabase Anon Key
                </span>
                <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-amber-500" /> Redacted by
                  design
                </span>
              </div>
              {config.HAS_SUPABASE_ANON_KEY ? (
                <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded text-xs font-bold">
                  <Check className="w-3 h-3" /> INJECTED
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-400 bg-red-500/10 px-2 py-1 rounded text-xs font-bold">
                  <X className="w-3 h-3" /> MISSING
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4" /> Integrations
            </h4>

            <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-lg">
              <div>
                <span className="text-white font-medium block mb-1">
                  Stripe Public Key
                </span>
                <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-amber-500" /> Redacted by
                  design
                </span>
              </div>
              {config.HAS_STRIPE_KEY ? (
                <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded text-xs font-bold">
                  <Check className="w-3 h-3" /> INJECTED
                </div>
              ) : (
                <div className="flex items-center gap-1 text-slate-500 bg-slate-800 px-2 py-1 rounded text-xs font-bold">
                  <X className="w-3 h-3" /> NOT CONFIGURED
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-500/5 border-t border-blue-500/10">
          <p className="text-xs text-blue-400 text-center flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4" /> This dashboard safely maps
            boolean existence checks to preserve memory safety against XSS
            harvesting attacks.
          </p>
        </div>
      </div>
    </div>
  );
}
