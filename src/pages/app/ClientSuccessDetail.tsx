import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Briefcase,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  User,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  Video,
  Plus,
} from 'lucide-react';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import HealthScoreCard from '../../components/client-success/HealthScoreCard';
import RiskSeverityBadge from '../../components/client-success/RiskSeverityBadge';
import OpportunityTypeBadge from '../../components/client-success/OpportunityTypeBadge';
import {
  clientSuccessService,
  type ClientSuccessOverview,
  type ClientInteraction,
  type SuccessOpportunity,
  type RiskFlag,
} from '../../lib/db/clientSuccess';

export default function ClientSuccessDetail() {
  const { clientId } = useParams<{ clientId: string }>();
  const [overview, setOverview] = useState<ClientSuccessOverview | null>(null);
  const [interactions, setInteractions] = useState<ClientInteraction[]>([]);
  const [opportunities, setOpportunities] = useState<SuccessOpportunity[]>([]);
  const [risks, setRisks] = useState<RiskFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (clientId) {
      loadClientData();
    }
  }, [clientId]);

  const loadClientData = async () => {
    if (!clientId) return;

    try {
      setLoading(true);
      setError('');

      const [overviewData, interactionsData, opportunitiesData, risksData] = await Promise.all([
        clientSuccessService.getClientSuccessOverview(clientId),
        clientSuccessService.getClientInteractions(clientId),
        clientSuccessService.getSuccessOpportunities(clientId),
        clientSuccessService.getRiskFlags(clientId),
      ]);

      setOverview(overviewData);
      setInteractions(interactionsData);
      setOpportunities(opportunitiesData);
      setRisks(risksData);
    } catch (err) {
      console.error('Failed to load client data:', err);
      setError('Failed to load client data');
    } finally {
      setLoading(false);
    }
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'call':
        return Phone;
      case 'email':
        return Mail;
      case 'meeting':
        return Video;
      case 'support':
        return MessageSquare;
      case 'review':
        return Briefcase;
      default:
        return MessageSquare;
    }
  };

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

  if (error || !overview) {
    return (
      <>
        <AppHeader title="Client Success" />
        <div className="p-8">
          <ErrorState message={error || 'Client not found'} />
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Client Success" />

      <div className="p-8 space-y-8">
        <div className="flex items-center gap-4">
          <Link to="/app/client-success">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Clients
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{overview.organization_name}</h1>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              {overview.billing_status && (
                <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                  {overview.billing_status}
                </span>
              )}
              {overview.subscription_status && (
                <span className="px-2.5 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">
                  {overview.subscription_status}
                </span>
              )}
            </div>
          </div>

          {overview.account_owner && (
            <Card className="px-4 py-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-sm text-slate-400">Account Owner</div>
                  <div className="text-white font-medium">
                    {overview.account_owner.owner_profile?.full_name || 'Unassigned'}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            {overview.health_score && <HealthScoreCard score={overview.health_score} />}

            <div className="grid grid-cols-2 gap-4 mt-6">
              <Card>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">{overview.active_projects}</div>
                  <div className="text-sm text-slate-400">Active Projects</div>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">{overview.open_support_tickets}</div>
                  <div className="text-sm text-slate-400">Open Tickets</div>
                </div>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                  <h2 className="text-xl font-semibold text-white">Success Opportunities</h2>
                </div>
                <Button variant="secondary" size="sm">
                  <Plus className="w-4 h-4" />
                  Add Opportunity
                </Button>
              </div>

              {opportunities.length === 0 ? (
                <div className="text-center py-8 text-slate-400">No opportunities identified</div>
              ) : (
                <div className="space-y-4">
                  {opportunities.slice(0, 5).map((opp) => (
                    <div
                      key={opp.id}
                      className="p-4 bg-white/5 border border-white/10 rounded-lg"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <OpportunityTypeBadge type={opp.opportunity_type} />
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              opp.priority === 'high'
                                ? 'bg-red-500/10 text-red-400'
                                : opp.priority === 'medium'
                                ? 'bg-yellow-500/10 text-yellow-400'
                                : 'bg-slate-500/10 text-slate-400'
                            }`}>
                              {opp.priority}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              opp.status === 'identified'
                                ? 'bg-blue-500/10 text-blue-400'
                                : opp.status === 'proposed'
                                ? 'bg-purple-500/10 text-purple-400'
                                : opp.status === 'negotiating'
                                ? 'bg-orange-500/10 text-orange-400'
                                : opp.status === 'won'
                                ? 'bg-green-500/10 text-green-400'
                                : 'bg-slate-500/10 text-slate-400'
                            }`}>
                              {opp.status}
                            </span>
                          </div>
                          <h3 className="text-white font-medium mb-1">{opp.title}</h3>
                          {opp.description && (
                            <p className="text-sm text-slate-400">{opp.description}</p>
                          )}
                        </div>
                        {opp.estimated_value && (
                          <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                            <DollarSign className="w-4 h-4" />
                            {opp.estimated_value.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-xl font-semibold text-white">Risk Flags</h2>
                </div>
              </div>

              {risks.filter(r => r.status !== 'resolved').length === 0 ? (
                <div className="text-center py-8 text-slate-400">No active risks</div>
              ) : (
                <div className="space-y-4">
                  {risks.filter(r => r.status !== 'resolved').map((risk) => (
                    <div
                      key={risk.id}
                      className="p-4 bg-white/5 border border-white/10 rounded-lg"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <RiskSeverityBadge severity={risk.severity} />
                            <span className="text-xs text-slate-500">
                              {risk.risk_type.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <p className="text-white">{risk.description}</p>
                          <div className="text-xs text-slate-500 mt-2">
                            Detected {new Date(risk.detected_at).toLocaleDateString()}
                            {risk.assigned_to_profile && (
                              <> • Assigned to {risk.assigned_to_profile.full_name}</>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-blue-400" />
                  <h2 className="text-xl font-semibold text-white">Recent Interactions</h2>
                </div>
                <Button variant="secondary" size="sm">
                  <Plus className="w-4 h-4" />
                  Log Interaction
                </Button>
              </div>

              {interactions.length === 0 ? (
                <div className="text-center py-8 text-slate-400">No interactions recorded</div>
              ) : (
                <div className="space-y-4">
                  {interactions.slice(0, 5).map((interaction) => {
                    const Icon = getInteractionIcon(interaction.interaction_type);
                    return (
                      <div
                        key={interaction.id}
                        className="p-4 bg-white/5 border border-white/10 rounded-lg"
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Icon className="w-4 h-4 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-medium mb-1">{interaction.subject}</h3>
                            {interaction.notes && (
                              <p className="text-sm text-slate-400 mb-2">{interaction.notes}</p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(interaction.interaction_date).toLocaleDateString()}
                              </span>
                              {interaction.conducted_by_profile && (
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {interaction.conducted_by_profile.full_name}
                                </span>
                              )}
                              {interaction.follow_up_required && (
                                <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded-full">
                                  Follow-up required
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
