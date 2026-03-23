import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, AlertTriangle, Clock, Filter, Download, BarChart3, Users, DollarSign, Briefcase, Headphones as HeadphonesIcon } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { dataPipelineService, type SystemEvent, type DataSignal } from '../../lib/db/dataPipeline';
import { useAuth } from '../../contexts/AuthContext';

export default function DataActivity() {
  const { currentOrganization } = useAuth();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [signals, setSignals] = useState<DataSignal[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('24h');

  useEffect(() => {
    loadData();
  }, [currentOrganization, timeRange, selectedCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();

      switch (timeRange) {
        case '24h':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
      }

      const [eventsData, signalsData] = await Promise.all([
        dataPipelineService.getEvents({
          organizationId: currentOrganization?.id,
          eventCategory: selectedCategory !== 'all' ? selectedCategory as any : undefined,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          limit: 100,
        }),
        dataPipelineService.getSignals({
          organizationId: currentOrganization?.id,
          status: 'new',
          limit: 20,
        }),
      ]);

      setEvents(eventsData);
      setSignals(signalsData);
    } catch (error) {
      console.error('Failed to load data activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'crm':
        return Users;
      case 'billing':
        return DollarSign;
      case 'project':
        return Briefcase;
      case 'support':
        return HeadphonesIcon;
      case 'user_action':
        return Activity;
      default:
        return BarChart3;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'crm':
        return 'blue';
      case 'billing':
        return 'green';
      case 'project':
        return 'purple';
      case 'support':
        return 'orange';
      case 'user_action':
        return 'slate';
      default:
        return 'slate';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'red';
      case 'high':
        return 'orange';
      case 'medium':
        return 'amber';
      case 'low':
        return 'blue';
      default:
        return 'slate';
    }
  };

  const formatEventType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const eventsByCategory = events.reduce((acc, event) => {
    acc[event.event_category] = (acc[event.event_category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading && events.length === 0) {
    return (
      <AppLayout title="Data Activity" subtitle="System events and analytics pipeline">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Data Activity" subtitle="System events and analytics pipeline">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-lg p-1">
              {['all', 'crm', 'billing', 'project', 'support', 'user_action'].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {category === 'all' ? 'All' : formatEventType(category)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-lg p-1">
              {['24h', '7d', '30d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-blue-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white hover:bg-slate-700 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-blue-400" />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{events.length}</div>
            <div className="text-sm text-slate-400">Total Events</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-green-400" />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{eventsByCategory.crm || 0}</div>
            <div className="text-sm text-slate-400">CRM Events</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Briefcase className="w-8 h-8 text-purple-400" />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{eventsByCategory.project || 0}</div>
            <div className="text-sm text-slate-400">Project Events</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-400" />
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{signals.length}</div>
            <div className="text-sm text-slate-400">Active Signals</div>
          </Card>
        </div>

        {signals.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-semibold text-white">Data Signals</h3>
              </div>
            </div>

            <div className="space-y-3">
              {signals.map((signal) => (
                <motion.div
                  key={signal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getSeverityColor(signal.severity)}>
                          {signal.severity.toUpperCase()}
                        </Badge>
                        <Badge variant={getCategoryColor(signal.signal_category)}>
                          {signal.signal_category.toUpperCase()}
                        </Badge>
                        <Badge variant="slate">
                          {signal.signal_type.toUpperCase()}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-white mb-1">{signal.title}</h4>
                      {signal.description && (
                        <p className="text-sm text-slate-400 mb-2">{signal.description}</p>
                      )}
                      {signal.confidence_score && (
                        <div className="text-xs text-slate-500">
                          Confidence: {signal.confidence_score}%
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 ml-4">
                      {new Date(signal.detected_at).toLocaleString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        )}

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Event Stream</h3>
            </div>
          </div>

          <div className="space-y-2">
            {events.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No events in selected time range</p>
              </div>
            ) : (
              events.map((event) => {
                const Icon = getCategoryIcon(event.event_category);
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4 p-3 bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/50 rounded-lg transition-colors"
                  >
                    <div className={`p-2 rounded-lg bg-${getCategoryColor(event.event_category)}-500/10`}>
                      <Icon className={`w-4 h-4 text-${getCategoryColor(event.event_category)}-400`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white">
                          {formatEventType(event.event_type)}
                        </span>
                        <Badge variant={getCategoryColor(event.event_category)}>
                          {event.event_category}
                        </Badge>
                      </div>
                      {event.entity_type && (
                        <p className="text-xs text-slate-500">
                          {event.entity_type} • {event.entity_id?.substring(0, 8)}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 whitespace-nowrap">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
