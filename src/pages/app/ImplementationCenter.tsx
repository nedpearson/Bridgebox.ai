// @ts-nocheck
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Rocket,
  ExternalLink,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Search,
  Plus,
} from "lucide-react";
import AppHeader from "../../components/app/AppHeader";
import Card from "../../components/Card";
import Button from "../../components/Button";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorState from "../../components/ErrorState";
import EmptyState from "../../components/EmptyState";
import DeploymentPhaseBadge from "../../components/implementation/DeploymentPhaseBadge";
import LaunchStatusBadge from "../../components/implementation/LaunchStatusBadge";
import DeploymentReadinessBadge from "../../components/implementation/DeploymentReadinessBadge";
import {
  implementationService,
  ImplementationWithProject,
} from "../../lib/db/implementation";

export default function ImplementationCenter() {
  const [implementations, setImplementations] = useState<
    ImplementationWithProject[]
  >([]);
  const [filteredImplementations, setFilteredImplementations] = useState<
    ImplementationWithProject[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadImplementations();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = implementations.filter(
        (impl) =>
          (impl.project?.name || "").toLowerCase().includes(query) ||
          (impl.project?.organization?.name || "")
            .toLowerCase()
            .includes(query),
      );
      setFilteredImplementations(filtered);
    } else {
      setFilteredImplementations(implementations);
    }
  }, [searchQuery, implementations]);

  const loadImplementations = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await implementationService.getAllImplementations();
      setImplementations(data);
      setFilteredImplementations(data);
    } catch (err: any) {
      setError(err.message || "Failed to load implementations");
    } finally {
      setLoading(false);
    }
  };

  const getPhaseProgress = (phase: string): number => {
    const phaseOrder = [
      "setup",
      "integration",
      "testing",
      "staging",
      "production",
      "post_launch_support",
    ];
    const index = phaseOrder.indexOf(phase);
    return ((index + 1) / phaseOrder.length) * 100;
  };

  const formatLastUpdate = (date?: string): string => {
    if (!date) return "Never";
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString();
  };

  if (loading) {
    return (
      <>
        <AppHeader
          title="Implementation Center"
          subtitle="Track real-world deployments and system rollouts"
        />
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <AppHeader
          title="Implementation Center"
          subtitle="Track real-world deployments and system rollouts"
        />
        <ErrorState message={error} onRetry={loadImplementations} />
      </>
    );
  }

  return (
    <>
      <AppHeader
        title="Implementation Center"
        subtitle="Track real-world deployments and system rollouts"
      />

      <div className="p-4 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search implementations..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
            />
          </div>
        </div>

        {filteredImplementations.length === 0 ? (
          <EmptyState
            icon={Rocket}
            title={
              searchQuery
                ? "No implementations found"
                : "No implementations yet"
            }
            description={
              searchQuery
                ? "Try adjusting your search criteria"
                : "Implementations will appear here when projects enter the deployment phase"
            }
          />
        ) : (
          <div className="grid gap-6">
            {filteredImplementations.map((impl) => (
              <motion.div
                key={impl.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Link to={`/app/implementation/${impl.project_id}`}>
                  <Card
                    glass
                    className="p-6 hover:border-slate-600 transition-all group"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <Rocket className="w-5 h-5 text-indigo-500" />
                            <h3 className="text-lg font-bold text-white group-hover:text-indigo-500 transition-colors">
                              {impl.project?.name}
                            </h3>
                          </div>
                          <p className="text-sm text-slate-400">
                            {impl.project?.organization?.name}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <DeploymentPhaseBadge
                            phase={impl.deployment_phase}
                            size="sm"
                          />
                          <DeploymentReadinessBadge
                            readiness={impl.deployment_readiness}
                            size="sm"
                          />
                          <LaunchStatusBadge
                            status={impl.launch_status}
                            size="sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                            <span>Deployment Progress</span>
                            <span>
                              {Math.round(
                                getPhaseProgress(impl.deployment_phase),
                              )}
                              %
                            </span>
                          </div>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${getPhaseProgress(impl.deployment_phase)}%`,
                              }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="h-full bg-gradient-to-r from-indigo-500 to-[#10B981]"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col lg:items-end space-y-3 lg:min-w-[200px]">
                        {impl.last_deployment_at && (
                          <div className="flex items-center space-x-2 text-sm text-slate-400">
                            <Clock className="w-4 h-4" />
                            <span>
                              Updated{" "}
                              {formatLastUpdate(impl.last_deployment_at)}
                            </span>
                          </div>
                        )}

                        {impl.go_live_date && (
                          <div className="flex items-center space-x-2 text-sm">
                            {new Date(impl.go_live_date) > new Date() ? (
                              <>
                                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                                <span className="text-yellow-400">
                                  Go-live:{" "}
                                  {new Date(
                                    impl.go_live_date,
                                  ).toLocaleDateString()}
                                </span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                <span className="text-green-400">
                                  Launched:{" "}
                                  {new Date(
                                    impl.go_live_date,
                                  ).toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </div>
                        )}

                        {(impl.staging_url || impl.production_url) && (
                          <div className="flex items-center space-x-2">
                            {impl.production_url && (
                              <a
                                href={impl.production_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center space-x-1 text-xs text-[#10B981] hover:text-[#059669] transition-colors"
                              >
                                <span>Prod</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {impl.staging_url && (
                              <a
                                href={impl.staging_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center space-x-1 text-xs text-indigo-500 hover:text-indigo-600 transition-colors"
                              >
                                <span>Staging</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
