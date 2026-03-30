import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  globalCommunicationsService,
  GlobalCommunication,
} from "../../lib/db/globalCommunications";
import { entityLinkService, EntityType } from "../../lib/db/entityLinks";
import { Mail, Phone, MessageSquare, Plus, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import InteractionLogModal from "./InteractionLogModal";

interface RelationalCommunicationsBoardProps {
  entityType: EntityType;
  entityId: string;
}

export default function RelationalCommunicationsBoard({
  entityType,
  entityId,
}: RelationalCommunicationsBoardProps) {
  const { currentOrganization } = useAuth();
  const [comms, setComms] = useState<
    (GlobalCommunication & { author?: any })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  useEffect(() => {
    loadComms();
  }, [entityType, entityId]);

  const loadComms = async () => {
    try {
      setLoading(true);
      const data = await globalCommunicationsService.getLinkedCommunications(
        entityType,
        entityId,
      );
      setComms(data);
    } catch (err) {
      console.error("Failed to load entity communications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogClick = () => {
    setIsLogModalOpen(true);
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Interaction Intelligence
        </h3>
        <button
          onClick={handleLogClick}
          className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-slate-700 hover:border-indigo-500/50"
        >
          <Plus className="w-4 h-4 text-indigo-400" />
          <span>Log Activity</span>
        </button>
      </div>

      {comms.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center flex flex-col items-center">
          <MessageSquare className="w-12 h-12 text-slate-600 mb-4" />
          <p className="text-slate-400 font-medium mb-1">
            No interactions logged.
          </p>
          <p className="text-slate-500 text-sm">
            Log calls, emails, and meetings to maintain relationship context.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {comms.map((comm) => (
            <div
              key={comm.id}
              className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-xl hover:border-indigo-500/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-slate-900 rounded-lg">
                    {comm.channel === "email" && (
                      <Mail className="w-5 h-5 text-indigo-400" />
                    )}
                    {comm.channel === "call" && (
                      <Phone className="w-5 h-5 text-indigo-400" />
                    )}
                    {comm.channel === "message" && (
                      <MessageSquare className="w-5 h-5 text-indigo-400" />
                    )}
                  </div>
                  <div>
                    <Link to={`/app/communications/${comm.id}`}>
                      <h4 className="font-semibold text-white hover:text-indigo-400 transition-colors">
                        {comm.subject || "Interaction Trace"}
                      </h4>
                    </Link>
                    <p className="text-sm text-slate-400 line-clamp-2 mt-1">
                      {comm.content}
                    </p>
                    <div className="flex items-center space-x-3 mt-3 text-xs text-slate-500">
                      <span
                        className={`capitalize px-2 py-0.5 rounded border ${
                          comm.direction === "inbound"
                            ? "border-green-500/30 text-green-400 bg-green-500/10"
                            : "border-yellow-500/30 text-yellow-500 bg-yellow-500/10"
                        }`}
                      >
                        {comm.direction}
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <span>{comm.author?.full_name || "System"}</span>
                      </span>
                      <span>•</span>
                      <span>{new Date(comm.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <Link
                  to={`/app/communications/${comm.id}`}
                  className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <InteractionLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        entityType={entityType}
        entityId={entityId}
        onLogComplete={loadComms}
      />
    </div>
  );
}
