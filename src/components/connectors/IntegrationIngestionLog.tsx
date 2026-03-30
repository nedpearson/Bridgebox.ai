import { useState, useEffect } from "react";
import {
  schemaNormalizer,
  WebhookPayload,
} from "../../lib/ai/services/schemaNormalizer";
import { useAuth } from "../../contexts/AuthContext";
import Card from "../Card";
import StatusBadge from "../admin/StatusBadge";
import LoadingSpinner from "../LoadingSpinner";
import ErrorState from "../ErrorState";
import { Sparkles, Webhook, Check, X, ArrowRight, Loader2 } from "lucide-react";

export default function IntegrationIngestionLog() {
  const { currentOrganization, user } = useAuth();
  const [webhooks, setWebhooks] = useState<WebhookPayload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (currentOrganization?.id) {
      loadWebhooks();
    }
  }, [currentOrganization?.id]);

  const loadWebhooks = async () => {
    try {
      setLoading(true);
      const data = await schemaNormalizer.getPendingWebhooks(
        currentOrganization!.id,
      );
      setWebhooks(data);
    } catch (err: any) {
      setError(err.message || "Failed to load webhooks");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (webhook: WebhookPayload) => {
    if (!user?.id) return;
    setProcessingId(webhook.id);
    try {
      await schemaNormalizer.physicallyCommitPayload(webhook, user.id);
      setWebhooks((hw) => hw.filter((w) => w.id !== webhook.id));
    } catch (e: any) {
      alert(`Approval Failed: ${e.message}`);
      loadWebhooks();
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (webhook: WebhookPayload) => {
    setProcessingId(webhook.id);
    try {
      // In a real app we'd expose a reject service method. We'll simulate by updating db locally or hiding it.
      import("../../lib/supabase").then(async ({ supabase }) => {
        await supabase
          .from("bb_integration_webhooks")
          .update({ status: "rejected" })
          .eq("id", webhook.id);
        setWebhooks((hw) => hw.filter((w) => w.id !== webhook.id));
      });
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading)
    return (
      <div className="p-8 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  if (error) return <ErrorState message={error} />;

  if (webhooks.length === 0) {
    return (
      <Card glass className="p-8 text-center text-slate-400">
        <Webhook className="w-12 h-12 mx-auto mb-4 text-slate-500 opacity-50" />
        <p>No pending integration payloads mapping.</p>
        <p className="text-sm">
          Inbound webhooks from Make/Zapier will buffer here securely.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center">
            <Webhook className="w-5 h-5 mr-2 text-indigo-400" />
            AI Ingestion Buffer
          </h3>
          <p className="text-sm text-slate-400">
            Review AI's translation of unstructured JSON into standard system
            rows.
          </p>
        </div>
        <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-400 text-xs flex items-center">
          <Sparkles className="w-3 h-3 mr-1" /> JSON Mapping Enforced
        </div>
      </div>

      <div className="grid gap-6">
        {webhooks.map((hook) => (
          <Card
            key={hook.id}
            glass
            className="p-4 border-slate-700/50 relative overflow-hidden"
          >
            {processingId === hook.id && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-10 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-6">
              {/* Raw Source */}
              <div className="flex-1 bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    Inbound Raw Source
                  </span>
                  <StatusBadge status={hook.source} variant="default" />
                </div>
                <pre className="text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-40">
                  {JSON.stringify(hook.raw_payload, null, 2)}
                </pre>
              </div>

              <div className="flex items-center justify-center shrink-0">
                <div className="p-2 rounded-full bg-indigo-500/20 text-indigo-400">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>

              {/* Mapped Target */}
              <div className="flex-1 bg-indigo-950/20 p-4 rounded-lg border border-indigo-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center text-xs font-semibold text-indigo-400 uppercase tracking-widest">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Mapped {hook.mapped_entity_type || "Unknown"}
                  </div>
                  <StatusBadge status={hook.status} />
                </div>
                {hook.status === "failed" ? (
                  <p className="text-red-400 text-xs bg-red-500/10 p-2 rounded">
                    {hook.error_log}
                  </p>
                ) : (
                  <pre className="text-xs text-indigo-200 overflow-x-auto whitespace-pre-wrap max-h-40">
                    {JSON.stringify(hook.mapped_entity_payload, null, 2)}
                  </pre>
                )}

                {hook.status === "pending" && hook.mapped_entity_type && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleApprove(hook)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-xs transition-colors"
                    >
                      <Check className="w-3 h-3" /> Approve Mapping
                    </button>
                    <button
                      onClick={() => handleReject(hook)}
                      className="flex items-center justify-center py-1.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-xs transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
