import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Flame, Activity, Users, MessageSquare } from 'lucide-react';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import { useAuth } from '../../contexts/AuthContext';
import {
  ServiceTrendCard,
  IndustryTrendCard,
  DemandSpikeCard,
  TrendInsightCard,
} from '../../components/trends/TrendCard';
import { HotIndicator } from '../../components/trends/TrendBadge';
import { trendDetection } from '../../lib/trendDetection';
import type {
  ServiceTrend,
  IndustryTrend,
  DemandSpike,
  TrendInsight,
  ClientRequestPattern,
} from '../../lib/trendDetection';

export default function TrendsCenter() {
  const { currentOrganization } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [serviceTrends, setServiceTrends] = useState<ServiceTrend[]>([]);
  const [industryTrends, setIndustryTrends] = useState<IndustryTrend[]>([]);
  const [demandSpikes, setDemandSpikes] = useState<DemandSpike[]>([]);
  const [requestPatterns, setRequestPatterns] = useState<ClientRequestPattern[]>([]);
  const [insights, setInsights] = useState<TrendInsight[]>([]);

  useEffect(() => {
    loadTrends();
  }, []);

  const loadTrends = async () => {
    if (!currentOrganization) return;
    try {
      setLoading(true);
      setError('');

      const [services, industries, spikes, patterns, trendInsights] = await Promise.all([
        trendDetection.detectTrendingServices(currentOrganization.id, 90),
        trendDetection.detectIndustryGrowth(currentOrganization.id, 90),
        trendDetection.detectDemandSpikes(currentOrganization.id, 90),
        trendDetection.detectClientRequestPatterns(currentOrganization.id, 90),
        trendDetection.generateTrendInsights(currentOrganization.id),
      ]);

      setServiceTrends(services);
      setIndustryTrends(industries);
      setDemandSpikes(spikes);
      setRequestPatterns(patterns);
      setInsights(trendInsights);
    } catch (err: any) {
      setError(err.message || 'Failed to load trends');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  const hotServices = serviceTrends.filter(s => s.direction === 'up' && s.growthRate > 50);
  const hotIndustries = industryTrends.filter(i => i.direction === 'up' && i.growthRate > 60);
  const emergingTrends = demandSpikes.filter(s => s.isEmergingTrend);
  const growingPatterns = requestPatterns.filter(p => p.isGrowing);

  return (
    <>
      <AppHeader
        title="Market Trends & Insights"
        subtitle="Real-time trend detection across services, industries, and client demand"
      />

      <div className="p-4 md:p-8 space-y-8">
        {insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <Flame className="w-6 h-6 text-orange-400" />
              <h2 className="text-2xl font-bold text-white">Key Insights</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {insights.map((insight, index) => (
                <TrendInsightCard
                  key={index}
                  type={insight.type}
                  title={insight.title}
                  description={insight.description}
                  metric={insight.metric}
                  action={insight.action}
                />
              ))}
            </div>
          </motion.div>
        )}

        {(hotServices.length > 0 || hotIndustries.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg">
                <Flame className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Hot Opportunities</h2>
                <p className="text-sm text-slate-400">High-growth areas with strong momentum</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotServices.slice(0, 3).map((trend, index) => (
                <ServiceTrendCard key={index} trend={trend} />
              ))}
              {hotIndustries.slice(0, 3).map((trend, index) => (
                <IndustryTrendCard key={index} trend={trend} />
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Service Demand Trends</h2>
          </div>
          {serviceTrends.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {serviceTrends.slice(0, 6).map((trend, index) => (
                <ServiceTrendCard key={index} trend={trend} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-slate-400">No service trends detected yet</p>
            </Card>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white">Industry Growth</h2>
          </div>
          {industryTrends.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {industryTrends.slice(0, 6).map((trend, index) => (
                <IndustryTrendCard key={index} trend={trend} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-slate-400">No industry trends detected yet</p>
            </Card>
          )}
        </motion.div>

        {emergingTrends.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Emerging Demand Signals</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {emergingTrends.map((spike, index) => (
                <DemandSpikeCard key={index} spike={spike} />
              ))}
            </div>
          </motion.div>
        )}

        {growingPatterns.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">Growing Client Request Patterns</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {growingPatterns.map((pattern, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {pattern.pattern}
                      </h3>
                      <HotIndicator label="GROWING" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Requests</span>
                      <span className="text-white font-medium">{pattern.frequency}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Clients</span>
                      <span className="text-white font-medium">{pattern.clients}</span>
                    </div>
                    {pattern.averageValue > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Avg Value</span>
                        <span className="text-white font-medium">
                          ${(pattern.averageValue / 1000).toFixed(0)}K
                        </span>
                      </div>
                    )}
                  </div>

                  {pattern.relatedServices.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <p className="text-xs text-slate-400 mb-2">Related Services</p>
                      <div className="flex flex-wrap gap-2">
                        {pattern.relatedServices.slice(0, 2).map((service, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-slate-800/50 text-slate-300 text-xs rounded-md"
                          >
                            {service.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {demandSpikes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-slate-400" />
              <h2 className="text-2xl font-bold text-white">All Demand Signals</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {demandSpikes.slice(0, 12).map((spike, index) => (
                <DemandSpikeCard key={index} spike={spike} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}
