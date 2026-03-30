import { Database, Link as LinkIcon, ExternalLink } from "lucide-react";

interface IntegrationBadgeProps {
  providerName: string;
  externalId?: string;
  syncStatus?: "synced" | "pending" | "error";
  lastSynced?: string;
  sourceUrl?: string;
  className?: string;
}

export default function IntegrationBadge({
  providerName,
  externalId,
  syncStatus = "synced",
  lastSynced,
  sourceUrl,
  className = "",
}: IntegrationBadgeProps) {
  const statusColors = {
    synced: "bg-green-500/10 text-green-400 border-green-500/20",
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    error: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <div className={`flex items-center gap-2 text-xs ${className}`}>
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border ${statusColors[syncStatus]}`}
      >
        <Database className="w-3 h-3" />
        <span className="font-medium capitalize">
          {providerName.replace("_", " ")}
        </span>
      </div>

      {externalId && (
        <div className="flex items-center gap-1 text-slate-400 bg-slate-800/50 px-2 py-1 rounded border border-slate-700">
          <LinkIcon className="w-3 h-3" />
          <span className="font-mono text-[10px]">{externalId}</span>
        </div>
      )}

      {lastSynced && (
        <span className="text-slate-500">
          Synced{" "}
          {new Date(lastSynced).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      )}

      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 ml-1 inline-flex items-center"
          title="View in original platform"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}
