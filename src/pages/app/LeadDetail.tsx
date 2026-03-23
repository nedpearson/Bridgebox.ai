import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Mail, Phone, Globe, Calendar, DollarSign, FileText, ArrowRight, Brain, Clock, Target, AlertCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import StatusBadge from '../../components/admin/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import { ConversionBadge, ConfidenceIndicator } from '../../components/predictions/PredictionBadge';
import { InsightList } from '../../components/ai/InsightCard';
import AIContent, { AIButton } from '../../components/ai/AIContent';
import { useLeadSummary } from '../../hooks/useAI';
import { leadsService } from '../../lib/db/leads';
import { predictiveAnalytics } from '../../lib/predictiveAnalytics';
import { intelligenceOrchestrator } from '../../lib/intelligenceOrchestrator';
import type { LeadRecord } from '../../types/database';
import type { LeadPrediction } from '../../lib/predictiveAnalytics';
import type { AIInsight } from '../../lib/aiDecisionEngine';

export default function LeadDetail() {
  const { id } = useParams();
  const [lead, setLead] = useState<LeadRecord | null>(null);
  const [prediction, setPrediction] = useState<LeadPrediction | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const aiSummary = useLeadSummary();

  useEffect(() => {
    loadLead();
  }, [id]);

  const loadLead = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [leadData, predictionData, contextInsights] = await Promise.all([
        leadsService.getLeadById(id),
        predictiveAnalytics.predictLeadConversion(id).catch(() => null),
        intelligenceOrchestrator.getContextualInsights({ type: 'lead', id }).catch(() => []),
      ]);

      if (!leadData) {
        setError('Lead not found');
      } else {
        setLead(leadData);
        setPrediction(predictionData);
        setInsights(contextInsights);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load lead');
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

  if (error || !lead) {
    return <ErrorState message={error || 'Lead not found'} />;
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'converted':
        return 'success';
      case 'lost':
        return 'error';
      case 'proposal_sent':
      case 'negotiation':
        return 'warning';
      case 'qualified':
        return 'info';
      default:
        return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      custom_software: 'Custom Software',
      automation: 'Automation',
      dashboards: 'Dashboards',
      mobile_app: 'Mobile App',
    };
    return map[type] || type;
  };

  const getBudgetDisplay = (range?: string) => {
    const map: Record<string, string> = {
      under_25k: '<$25K',
      '25k_50k': '$25K-$50K',
      '50k_100k': '$50K-$100K',
      '100k_250k': '$100K-$250K',
      '250k_plus': '$250K+',
    };
    return range ? map[range] : 'Not Disclosed';
  };

  return (
    <>
      <AppHeader title={lead.name} />

      <div className="p-8 space-y-6">
        <Link
          to="/app/leads"
          className="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Leads</span>
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {prediction && (
            <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Brain className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Conversion Prediction</h3>
                  <p className="text-xs text-slate-400">AI-powered insights</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-sm text-slate-400 mb-2">Likelihood</p>
                  <ConversionBadge likelihood={prediction.conversionLikelihood} />
                </div>

                <div>
                  <p className="text-sm text-slate-400 mb-2">Estimated Deal Value</p>
                  <p className="text-2xl font-bold text-white">
                    ${prediction.estimatedDealValue.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Expected Close Time
                  </p>
                  <p className="text-lg font-semibold text-white">
                    {prediction.daysToClose} days
                  </p>
                </div>

                <ConfidenceIndicator score={prediction.confidenceScore} />

                {prediction.factors.length > 0 && (
                  <div className="pt-4 border-t border-slate-700">
                    <p className="text-sm text-slate-400 mb-3">Key Factors</p>
                    <ul className="space-y-2">
                      {prediction.factors.map((factor, index) => (
                        <li key={index} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-purple-400 mt-0.5">•</span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}

          <Card glass className="p-6">
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#3B82F6] to-[#10B981] rounded-lg flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">{lead.name}</h2>
                <StatusBadge status={lead.status} variant={getStatusVariant(lead.status)} />
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-slate-500 text-xs mb-1">Company</p>
                <p className="text-white font-medium">{lead.company || 'No company'}</p>
              </div>
              <div className="flex items-center space-x-3 text-slate-300">
                <Mail className="w-4 h-4 text-slate-500" />
                <span className="text-sm">{lead.email}</span>
              </div>
              {lead.phone && (
                <div className="flex items-center space-x-3 text-slate-300">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <span className="text-sm">{lead.phone}</span>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-800 space-y-4">
              <div>
                <p className="text-slate-500 text-xs mb-1">Lead Type</p>
                <StatusBadge status={getTypeLabel(lead.lead_type)} variant="info" />
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Form Type</p>
                <StatusBadge status={lead.form_type} variant="default" />
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Source</p>
                <StatusBadge status={lead.source || 'website'} variant="default" />
              </div>
              {lead.priority && (
                <div>
                  <p className="text-slate-500 text-xs mb-1">Priority</p>
                  <StatusBadge status={lead.priority} variant={lead.priority === 'urgent' ? 'error' : lead.priority === 'high' ? 'warning' : 'default'} />
                </div>
              )}
              <div>
                <p className="text-slate-500 text-xs mb-1">Created</p>
                <p className="text-white text-sm">{new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Brain className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-bold text-white">AI Analysis</h3>
                </div>
                {aiSummary.isAvailable && !aiSummary.data && !aiSummary.loading && (
                  <AIButton onClick={() => aiSummary.summarize(lead)}>
                    Generate AI Summary
                  </AIButton>
                )}
              </div>

              <AIContent
                loading={aiSummary.loading}
                error={aiSummary.error}
                isAIGenerated={aiSummary.isAIGenerated}
                fromCache={aiSummary.fromCache}
                provider={aiSummary.provider}
                onRetry={() => aiSummary.summarize(lead, false)}
              >
                {aiSummary.data && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-300 leading-relaxed">{aiSummary.data.overview}</p>
                    </div>

                    {aiSummary.data.keyNeeds && aiSummary.data.keyNeeds.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-slate-400 mb-2">Key Needs</p>
                        <div className="space-y-1">
                          {aiSummary.data.keyNeeds.map((need: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2">
                              <Target className="w-3 h-3 text-blue-400 flex-shrink-0 mt-1" />
                              <span className="text-sm text-slate-300">{need}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {aiSummary.data.suggestedServices && aiSummary.data.suggestedServices.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-slate-400 mb-2">Suggested Services</p>
                        <div className="flex flex-wrap gap-2">
                          {aiSummary.data.suggestedServices.map((service: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-300">
                              {service.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {aiSummary.data.estimatedValue && (
                      <div>
                        <p className="text-xs font-medium text-slate-400 mb-1">Estimated Value</p>
                        <p className="text-lg font-bold text-green-400">{aiSummary.data.estimatedValue}</p>
                      </div>
                    )}

                    {aiSummary.data.nextActions && aiSummary.data.nextActions.length > 0 && (
                      <div className="pt-4 border-t border-slate-700">
                        <p className="text-xs font-medium text-slate-400 mb-2">Recommended Next Actions</p>
                        <div className="space-y-2">
                          {aiSummary.data.nextActions.map((action: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2">
                              <ArrowRight className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-slate-300">{action}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!aiSummary.data && !aiSummary.isAvailable && (
                  <div className="flex items-start gap-3 text-slate-400">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">
                      AI analysis is not available. Configure an AI provider (Anthropic or OpenAI) to enable intelligent lead summaries.
                    </p>
                  </div>
                )}
              </AIContent>
            </Card>

            {insights.length > 0 && (
              <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="w-6 h-6 text-purple-400" />
                  <h3 className="text-lg font-bold text-white">Strategic Insights</h3>
                </div>
                <InsightList insights={insights} compact={false} />
              </Card>
            )}

            <Card glass className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">Project Details</h3>
              {lead.project_description && (
                <div className="mb-6">
                  <p className="text-slate-500 text-xs mb-2">Project Description</p>
                  <p className="text-slate-300 leading-relaxed">{lead.project_description}</p>
                </div>
              )}

              {lead.message && lead.message !== lead.project_description && (
                <div className="mb-6">
                  <p className="text-slate-500 text-xs mb-2">Additional Message</p>
                  <p className="text-slate-300 leading-relaxed">{lead.message}</p>
                </div>
              )}

              {lead.budget_range && (
                <div className="mb-6">
                  <p className="text-slate-500 text-xs mb-2">Budget Range</p>
                  <p className="text-xl font-bold text-white">{getBudgetDisplay(lead.budget_range)}</p>
                </div>
              )}

              {lead.requested_service && (
                <div className="mb-6">
                  <p className="text-slate-500 text-xs mb-2">Requested Service</p>
                  <StatusBadge status={lead.requested_service} variant="info" />
                </div>
              )}

            </Card>

            {lead.notes && (
              <Card glass className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Internal Notes</h3>
                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{lead.notes}</p>
                </div>
              </Card>
            )}

            <Card glass className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button className="flex items-center space-x-2 px-6 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium rounded-lg transition-colors">
                  <FileText className="w-5 h-5" />
                  <span>Create Proposal</span>
                </button>
                <button className="flex items-center space-x-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors border border-slate-700">
                  <Calendar className="w-5 h-5" />
                  <span>Schedule Meeting</span>
                </button>
                <button className="flex items-center space-x-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors border border-slate-700">
                  <Mail className="w-5 h-5" />
                  <span>Send Email</span>
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
