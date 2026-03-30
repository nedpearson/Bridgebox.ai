// @ts-nocheck
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Rocket,
  Filter,
  TrendingUp,
  AlertTriangle,
  Package,
} from "lucide-react";
import AppHeader from "../../components/app/AppHeader";
import Card from "../../components/Card";
import KPICard from "../../components/admin/KPICard";
import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import DeliveryPhaseBadge from "../../components/delivery/DeliveryPhaseBadge";
import HealthStatusIndicator from "../../components/delivery/HealthStatusIndicator";
import RiskLevelBadge from "../../components/delivery/RiskLevelBadge";
import {
  deliveryService,
  ProjectDeliveryWithDetails,
  DeliveryPhase,
  HealthStatus,
} from "../../lib/db/delivery";

export default function DeliveryOverview() {
  const [deliveries, setDeliveries] = useState<ProjectDeliveryWithDetails[]>(
    [],
  );
  const [filteredDeliveries, setFilteredDeliveries] = useState<
    ProjectDeliveryWithDetails[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [healthFilter, setHealthFilter] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterDeliveries();
  }, [deliveries, phaseFilter, healthFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [deliveriesData, statsData] = await Promise.all([
        deliveryService.getAllActiveDeliveries(),
        deliveryService.getDeliveryStats(),
      ]);
      setDeliveries(deliveriesData);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load delivery data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterDeliveries = () => {
    let filtered = [...deliveries];

    if (phaseFilter !== "all") {
      filtered = filtered.filter((d) => d.delivery_phase === phaseFilter);
    }

    if (healthFilter !== "all") {
      filtered = filtered.filter((d) => d.health_status === healthFilter);
    }

    setFilteredDeliveries(filtered);
  };

  if (loading) {
    return (
      <>
        <AppHeader
          title="Delivery OS"
          subtitle="Manage project execution and delivery"
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
        title="Delivery OS"
        subtitle="Manage project execution and delivery"
      />

      <div className="p-8 space-y-6">
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Active Projects"
              value={stats.total}
              icon={Rocket}
              trend={{ value: 0, isPositive: true }}
            />
            <KPICard
              title="In Build Phase"
              value={stats.by_phase.build}
              icon={Package}
              trend={{ value: 0, isPositive: true }}
            />
            <KPICard
              title="High Risk"
              value={stats.high_risk}
              icon={AlertTriangle}
              trend={{ value: 0, isPositive: false }}
            />
            <KPICard
              title="Healthy Projects"
              value={stats.by_health.green}
              icon={TrendingUp}
              trend={{ value: 0, isPositive: true }}
            />
          </div>
        )}

        <Card glass className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={phaseFilter}
                onChange={(e) => setPhaseFilter(e.target.value)}
                className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="all">All Phases</option>
                <option value="discovery">Discovery</option>
                <option value="planning">Planning</option>
                <option value="design">Design</option>
                <option value="build">Build</option>
                <option value="integration">Integration</option>
                <option value="qa">QA</option>
                <option value="deployment">Deployment</option>
                <option value="support">Support</option>
              </select>

              <select
                value={healthFilter}
                onChange={(e) => setHealthFilter(e.target.value)}
                className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="all">All Health</option>
                <option value="green">Healthy</option>
                <option value="yellow">At Risk</option>
                <option value="red">Critical</option>
              </select>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {filteredDeliveries.length === 0 ? (
            <Card glass className="p-12">
              <EmptyState
                icon={Rocket}
                title={
                  phaseFilter !== "all" || healthFilter !== "all"
                    ? "No Projects Found"
                    : "No Active Deliveries"
                }
                description={
                  phaseFilter !== "all" || healthFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Active project deliveries will appear here"
                }
              />
            </Card>
          ) : (
            filteredDeliveries.map((delivery) => (
              <motion.div
                key={delivery.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Link to={`/app/delivery/${delivery.project_id}`}>
                  <Card
                    glass
                    className="p-6 hover:border-indigo-500/50 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-white group-hover:text-indigo-500 transition-colors mb-2">
                              {delivery.project?.name || "Unnamed Project"}
                            </h3>
                            {delivery.project?.organizations && (
                              <p className="text-slate-400 text-sm mb-3">
                                {delivery.project.organizations.name}
                              </p>
                            )}
                          </div>
                          <HealthStatusIndicator
                            status={delivery.health_status}
                            size="lg"
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          <DeliveryPhaseBadge
                            phase={delivery.delivery_phase}
                            size="sm"
                          />
                          {delivery.risk_level !== "none" && (
                            <RiskLevelBadge
                              level={delivery.risk_level}
                              size="sm"
                            />
                          )}
                          {delivery.project?.type && (
                            <span className="text-xs px-2 py-1 bg-slate-800/50 text-slate-300 border border-slate-700 rounded-full capitalize">
                              {delivery.project.type.replace(/_/g, " ")}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">
                              Progress
                            </p>
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-indigo-500 transition-all duration-500"
                                  style={{
                                    width: `${delivery.completion_percentage}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm font-medium text-white">
                                {delivery.completion_percentage}%
                              </span>
                            </div>
                          </div>

                          {delivery.current_milestone && (
                            <div>
                              <p className="text-xs text-slate-500 mb-1">
                                Current Milestone
                              </p>
                              <p className="text-sm text-white font-medium">
                                {delivery.current_milestone}
                              </p>
                            </div>
                          )}

                          {delivery.team_lead && (
                            <div>
                              <p className="text-xs text-slate-500 mb-1">
                                Team Lead
                              </p>
                              <p className="text-sm text-white font-medium">
                                {delivery.team_lead.full_name ||
                                  delivery.team_lead.email}
                              </p>
                            </div>
                          )}

                          {delivery.target_completion_date && (
                            <div>
                              <p className="text-xs text-slate-500 mb-1">
                                Target Date
                              </p>
                              <p className="text-sm text-white font-medium">
                                {new Date(
                                  delivery.target_completion_date,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
