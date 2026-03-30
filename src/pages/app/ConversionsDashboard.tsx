import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  FileText,
  FolderKanban,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import AppHeader from "../../components/app/AppHeader";
import Card from "../../components/Card";
import LoadingSpinner from "../../components/LoadingSpinner";
import StatusBadge from "../../components/admin/StatusBadge";
import { analyticsService } from "../../lib/db/analytics";

interface ConversionMetrics {
  totalLeads: number;
  convertedLeads: number;
  totalProposals: number;
  approvedProposals: number;
  convertedProposals: number;
  totalProjects: number;
  pendingOnboarding: number;
}

interface ConversionRecord {
  lead_id: string;
  lead_name: string;
  lead_status: string;
  lead_converted_at: string;
  organization_id: string;
  organization_name: string;
  onboarding_status: string;
  proposal_id?: string;
  proposal_title?: string;
  proposal_status?: string;
  project_id?: string;
  project_name?: string;
  project_source?: string;
}

export default function ConversionsDashboard() {
  const [metrics, setMetrics] = useState<ConversionMetrics | null>(null);
  const [conversions, setConversions] = useState<ConversionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [metricsData, trackingData] = await Promise.all([
        analyticsService.getConversionMetrics(),
        analyticsService.getConversionTracking(50),
      ]);

      setMetrics(metricsData);
      setConversions((trackingData as ConversionRecord[]) || []);
    } catch (error) {
      console.error("Failed to load conversion data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getConversionRate = (converted: number, total: number) => {
    if (total === 0) return "0%";
    return `${Math.round((converted / total) * 100)}%`;
  };

  if (loading) {
    return (
      <>
        <AppHeader
          title="Conversions Dashboard"
          subtitle="Track lead to project conversion lifecycle"
        />
        <div className="p-8 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader
        title="Conversions Dashboard"
        subtitle="Track lead to project conversion lifecycle"
      />

      <div className="p-8 space-y-6">
        {/* Metrics Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/app/leads"
            className="block transition-transform hover:-translate-y-1"
          >
            <Card
              glass
              className="p-6 hover:border-indigo-500/50 transition-colors h-full"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-400">
                  Lead Conversion
                </h3>
                <Users className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="flex items-baseline space-x-2">
                <p className="text-3xl font-bold text-white">
                  {getConversionRate(
                    metrics?.convertedLeads || 0,
                    metrics?.totalLeads || 0,
                  )}
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {metrics?.convertedLeads} of {metrics?.totalLeads} leads
                converted
              </p>
            </Card>
          </Link>

          <Link
            to="/app/proposals"
            className="block transition-transform hover:-translate-y-1"
          >
            <Card
              glass
              className="p-6 hover:border-[#10B981]/50 transition-colors h-full"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-400">
                  Proposal Success
                </h3>
                <FileText className="w-5 h-5 text-[#10B981]" />
              </div>
              <div className="flex items-baseline space-x-2">
                <p className="text-3xl font-bold text-white">
                  {getConversionRate(
                    metrics?.approvedProposals || 0,
                    metrics?.totalProposals || 0,
                  )}
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {metrics?.approvedProposals} of {metrics?.totalProposals}{" "}
                proposals approved
              </p>
            </Card>
          </Link>

          <Link
            to="/app/projects"
            className="block transition-transform hover:-translate-y-1"
          >
            <Card
              glass
              className="p-6 hover:border-indigo-500/50 transition-colors h-full"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-400">
                  Projects Created
                </h3>
                <FolderKanban className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="flex items-baseline space-x-2">
                <p className="text-3xl font-bold text-white">
                  {metrics?.totalProjects || 0}
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {metrics?.convertedProposals} from proposals
              </p>
            </Card>
          </Link>

          <Link
            to="/app/clients"
            className="block transition-transform hover:-translate-y-1"
          >
            <Card
              glass
              className="p-6 hover:border-yellow-500/50 transition-colors h-full"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-400">
                  Pending Onboarding
                </h3>
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="flex items-baseline space-x-2">
                <p className="text-3xl font-bold text-white">
                  {metrics?.pendingOnboarding || 0}
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Organizations in progress
              </p>
            </Card>
          </Link>
        </div>

        {/* Conversion Timeline */}
        <Card glass className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">
            Conversion Pipeline
          </h2>

          {conversions.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No conversions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {conversions.map((record) => (
                <motion.div
                  key={record.lead_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Link
                          to={`/app/leads/${record.lead_id}`}
                          className="text-white font-semibold hover:text-indigo-500 transition-colors"
                        >
                          {record.lead_name}
                        </Link>
                        {record.organization_name && (
                          <>
                            <span className="text-slate-600">→</span>
                            <span className="text-slate-300">
                              {record.organization_name}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-sm">
                        {record.proposal_id && (
                          <Link
                            to={`/app/proposals/${record.proposal_id}`}
                            className="flex items-center space-x-1.5 text-slate-400 hover:text-white transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>{record.proposal_title || "Proposal"}</span>
                          </Link>
                        )}

                        {record.project_id && (
                          <Link
                            to={`/app/projects/${record.project_id}`}
                            className="flex items-center space-x-1.5 text-indigo-500 hover:text-[#10B981] transition-colors"
                          >
                            <FolderKanban className="w-3.5 h-3.5" />
                            <span>{record.project_name || "Project"}</span>
                            <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {record.onboarding_status === "in_progress" && (
                        <StatusBadge
                          status="Onboarding"
                          variant="warning"
                          compact
                        />
                      )}
                      {record.onboarding_status === "completed" && (
                        <StatusBadge
                          status="Onboarded"
                          variant="success"
                          compact
                        />
                      )}
                      {record.onboarding_status === "not_started" &&
                        record.project_id && (
                          <StatusBadge
                            status="Needs Onboarding"
                            variant="danger"
                            compact
                          />
                        )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
