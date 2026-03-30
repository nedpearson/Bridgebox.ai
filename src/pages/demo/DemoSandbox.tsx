import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { Logger } from "../../lib/logger";
import { DemoDataSeeder } from "../../lib/demo/demoDataSeeder";
import { Component, Loader2 } from "lucide-react";

export default function DemoSandbox() {
  const { industry } = useParams<{ industry: string }>();
  const navigate = useNavigate();
  const { session, profile, currentOrganization, signUp, signOut } = useAuth();
  const [status, setStatus] = useState<string>(
    "Initializing sandbox environment...",
  );
  const [error, setError] = useState<string>("");
  const isProvisioning = useRef(false);

  useEffect(() => {
    async function provisionDemo() {
      if (isProvisioning.current) return;
      isProvisioning.current = true;

      try {
        // 1. Clear any existing active session to ensure pristine isolation
        if (session) {
          setStatus("Clearing previous session state...");
          await signOut();
        }

        setStatus("Provisioning instant demo tenant...");

        // 2. Generate Ghost Identity
        const runId = crypto.randomUUID().split("-")[0];
        const safeIndustry = (industry || "general")
          .toLowerCase()
          .replace(/[^a-z0-z]/g, "");
        const ghostEmail = `demo.${safeIndustry}.${runId}@sandbox.bridgebox.ai`;
        const ghostPassword = crypto.randomUUID();

        // 3. Trigger authentic signup
        await signUp(ghostEmail, ghostPassword, "Demo User");
        Logger.info("[Analytics] Instant Demo Sandbox Provisioned", {
          industry: safeIndustry,
        });
        setStatus("Tenant secured. Awaiting active context mapping...");
      } catch (err: any) {
        Logger.error("[Demo Sandbox] Provisioning fault", err);
        setError(err.message || "Failed to initialize demonstration sandbox.");
      }
    }

    // Only provision if we DO NOT have a demo actively waiting to route
    if (!profile) {
      provisionDemo();
    }
  }, [session, profile, industry, signUp, signOut]);

  // Phase 2: Reactively route once the Organization contextualizes from the Ghost Signup
  useEffect(() => {
    async function configureAndRoute() {
      if (
        profile &&
        currentOrganization &&
        currentOrganization.name !== `[DEMO] ${industry} Workspace`
      ) {
        try {
          setStatus("Applying industry template settings...");

          // Stamp the organization name so the App can recognize it's a demo
          await supabase
            .from("bb_organizations")
            .update({
              name: `[DEMO] ${industry?.toUpperCase()} Workspace`,
              organization_type: "client",
            })
            .eq("id", currentOrganization.id);

          setStatus("Priming local industry pipelines...");
          await DemoDataSeeder.seedWorkspace(
            currentOrganization.id,
            industry || "general",
          );

          // Force local reload or just navigate.
          // The AppOverview will catch the [DEMO] tag to mount the Guided Tour.
          setStatus("Routing to Dashboard...");
          // Instantaneous jump - no timeout
          navigate("/app", { replace: true });
        } catch (e: any) {
          Logger.error("[Demo Sandbox] Entity tagging failed.", e);
          setError("Failed to apply workspace settings.");
        }
      }
    }

    configureAndRoute();
  }, [profile, currentOrganization, industry, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-slate-900 border border-indigo-500/30 rounded-2xl p-8 text-center shadow-[0_0_40px_rgba(59,130,246,0.1)] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-cyan-400" />

        <div className="w-20 h-20 bg-indigo-500/10 border-2 border-indigo-500/30 rounded-xl flex items-center justify-center mx-auto mb-6">
          {error ? (
            <Component className="w-10 h-10 text-rose-500" />
          ) : (
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          )}
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">
          Bridgebox Sandbox
        </h2>

        {error ? (
          <div className="text-rose-400 text-sm mt-4 p-4 bg-rose-500/10 rounded-lg">
            {error}
          </div>
        ) : (
          <p className="text-slate-400 font-medium animate-pulse">{status}</p>
        )}

        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-xs text-slate-500">
            Building a zero-latency, secure tenant mathematically isolated from
            production networks.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
