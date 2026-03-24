import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Search,
  Filter,
  ArrowRight,
} from 'lucide-react';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { clientSuccessService, type ClientSuccessOverview } from '../../lib/db/clientSuccess';

export default function ClientSuccess() {
  const [clients, setClients] = useState<ClientSuccessOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<'all' | 'at_risk' | 'healthy'>('all');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await clientSuccessService.getAllClientsOverview();
      setClients(data);
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (score: number | null) => {
    if (!score) return 'text-slate-400';
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getHealthBg = (score: number | null) => {
    if (!score) return 'bg-slate-500/10 border-slate-500/20';
    if (score >= 80) return 'bg-green-500/10 border-green-500/20';
    if (score >= 60) return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch = (client.organization_name || '')
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    if (filterRisk === 'all') return matchesSearch;

    const score = client.health_score?.overall_score || 0;
    if (filterRisk === 'at_risk') return matchesSearch && score < 80;
    if (filterRisk === 'healthy') return matchesSearch && score >= 80;

    return matchesSearch;
  });

  const stats = [
    {
      label: 'Total Clients',
      value: clients.length,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      filterVal: 'all',
    },
    {
      label: 'Healthy Clients',
      value: clients.filter((c) => (c.health_score?.overall_score || 0) >= 80).length,
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      filterVal: 'healthy',
    },
    {
      label: 'At Risk',
      value: clients.filter((c) => (c.health_score?.overall_score || 0) < 80).length,
      icon: AlertTriangle,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      filterVal: 'at_risk',
    },
    {
      label: 'Active Opportunities',
      value: clients.reduce((acc, c) => acc + c.active_opportunities, 0),
      icon: DollarSign,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      filterVal: null,
    },
  ];

  if (loading) {
    return (
      <>
        <AppHeader title="Client Success" />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Client Success" />

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const isClickable = stat.filterVal !== null;
            const isActive = filterRisk === stat.filterVal;
            
            return (
              <div
                key={stat.label}
                onClick={isClickable ? () => setFilterRisk(stat.filterVal as any) : undefined}
                className={isClickable ? 'block cursor-pointer transition-transform hover:-translate-y-1' : ''}
              >
                <Card glass={!isActive} className={`h-full ${isActive ? 'bg-white/10 border-white/20' : 'hover:border-white/20 transition-colors'}`}>
                  <div className="flex items-center gap-4 p-2">
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-sm text-slate-400">{stat.label}</div>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>

        <Card>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value as any)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Clients</option>
                <option value="healthy">Healthy</option>
                <option value="at_risk">At Risk</option>
              </select>
            </div>
          </div>

          {filteredClients.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No clients found"
              description="No clients match your search criteria"
            />
          ) : (
            <div className="space-y-4">
              {filteredClients.map((client) => (
                <Link key={client.organization_id} to={`/app/client-success/${client.organization_id}`}>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="p-6 bg-white/5 border border-white/10 rounded-xl hover:border-blue-500/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {client.organization_name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                          <span>
                            {client.active_projects} active project{client.active_projects !== 1 ? 's' : ''}
                          </span>
                          <span>•</span>
                          <span>
                            {client.open_support_tickets} open ticket{client.open_support_tickets !== 1 ? 's' : ''}
                          </span>
                          {client.last_interaction && (
                            <>
                              <span>•</span>
                              <span>
                                Last contact: {new Date(client.last_interaction.interaction_date).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {client.health_score && (
                          <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-xl border ${getHealthBg(client.health_score.overall_score)}`}>
                            <div className={`text-2xl font-bold ${getHealthColor(client.health_score.overall_score)}`}>
                              {client.health_score.overall_score}
                            </div>
                            <div className="text-xs text-slate-500">Health</div>
                          </div>
                        )}

                        {client.active_opportunities > 0 && (
                          <div className="flex flex-col items-center justify-center px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                            <div className="text-lg font-bold text-emerald-400">
                              {client.active_opportunities}
                            </div>
                            <div className="text-xs text-slate-500">Opportunities</div>
                          </div>
                        )}

                        {client.active_risks > 0 && (
                          <div className="flex flex-col items-center justify-center px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <div className="text-lg font-bold text-red-400">
                              {client.active_risks}
                            </div>
                            <div className="text-xs text-slate-500">Risks</div>
                          </div>
                        )}

                        <ArrowRight className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
