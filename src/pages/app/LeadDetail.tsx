import { useEffect, useState } from 'react';

import { ArrowLeft, Users, Mail, Phone, FileText, ArrowRight, Brain, Clock, Target, AlertCircle, Globe, Loader2 } from 'lucide-react';
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
import { useAuth } from '../../contexts/AuthContext';
import { leadsService } from '../../lib/db/leads';
import { aiService } from '../../lib/ai/services/aiService';
import { predictiveAnalytics } from '../../lib/predictiveAnalytics';
import { intelligenceOrchestrator } from '../../lib/intelligenceOrchestrator';
import type { LeadRecord } from '../../types/database';
import type { LeadPrediction } from '../../lib/predictiveAnalytics';
import type { AIInsight } from '../../lib/aiDecisionEngine';

export default function LeadDetail() {
  const { currentOrganization } = useAuth();
  const { id } = useParams();
  const [lead, setLead] = useState<LeadRecord | null>(null);
  const [prediction, setPrediction] = useState<LeadPrediction | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEnriching, setIsEnriching] = useState(false);
  const aiSummary = useLeadSummary();

  const handleEnrichLead = async () => {
    if (!lead) return;
    setIsEnriching(true);
    try {
      let domain = '';
      if (lead.email) {
        const parts = lead.email.split('@');
        if (parts.length === 2 && !['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'].includes(parts[1])) {
          domain = parts[1];
        }
      }
      if (!domain) {
        throw new Error('No valid business domain found to enrich.');
      }

      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://${domain}`)}`;
      const response = await fetch(proxyUrl);
      const data = await response.json();
      
      const rawHtml = data.contents;
      const bodyText = rawHtml ? rawHtml.replace(/<[^>]*>?/gm, ' ') : '';

      const { success, data: enrichedData, error } = await aiService.enrichLeadData(domain, bodyText);

      if (success && enrichedData) {
        const enrichmentNote = `[AI ENRICHMENT]\\nWebsite: ${domain}\\nOverview: ${enrichedData.company_overview}\\nTarget Market: ${enrichedData.target_market}`;
        const newNotes = (lead as any).notes ? `${(lead as any).notes}\\n\\n${enrichmentNote}` : enrichmentNote;
        
        await leadsService.updateLead(lead.id, { notes: newNotes } as any);
        setLead({ ...lead, notes: newNotes } as any);
        alert('Lead enriched successfully!');
      } else {
        throw new Error(error?.message || 'Failed to extract enrichment data.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to enrich lead.');
    } finally {
      setIsEnriching(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!lead || lead.status === newStatus) return;
    try {
      await leadsService.updateLead(lead.id, { status: newStatus as any });
      setLead({ ...lead, status: newStatus as any });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  useEffect(() => {
    loadLead();
  }, [id]);

  const loadLead = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [leadData, predictionData, contextInsights] = await Promise.all([
        leadsService.getLeadById(id),
        predictiveAnalytics.predictLeadConversion(id, currentOrganization?.id).catch(() => null),
        intelligenceOrchestrator.getContextualInsights({ type: 'lead', id, organizationId: currentOrganization?.id }).catch(() => []),
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
                <select
                  value={lead.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className={`border-none rounded-full px-3 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3B82F6] cursor-pointer ${
                    (lead.status as string) === 'converted' ? 'text-[#10B981] bg-[#10B981]/10' :
                    (lead.status as string) === 'lost' ? 'text-red-500 bg-red-500/10' :
                    (lead.status as string) === 'proposal_sent' || (lead.status as string) === 'negotiation' ? 'text-yellow-500 bg-yellow-500/10' :
                    'text-[#3B82F6] bg-[#3B82F6]/10'
                  }`}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="discovery">Discovery</option>
                  <option value="proposal_sent">Proposal Sent</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
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
              {(lead as any).phone && (
                <div className="flex items-center space-x-3 text-slate-300">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <span className="text-sm">{(lead as any).phone}</span>
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
                <StatusBadge status={(lead as any).source || 'website'} variant="default" />
              </div>
              {(lead as any).priority && (
                <div>
                  <p className="text-slate-500 text-xs mb-1">Priority</p>
                  <StatusBadge status={(lead as any).priority} variant={(lead as any).priority === 'urgent' ? 'danger' : (lead as any).priority === 'high' ? 'warning' : 'default'} />
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleEnrichLead}
                    disabled={isEnriching}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 rounded-lg text-sm font-medium transition-colors border border-[#10B981]/20 disabled:opacity-50"
                  >
                    {isEnriching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                    Auto-Enrich
                  </button>
                  {aiSummary.isAvailable && !aiSummary.data && !aiSummary.loading && (
                    <AIButton onClick={() => aiSummary.summarize(lead)}>
                      Generate AI Summary
                    </AIButton>
                  )}
                </div>
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

              {(lead as any).message && (lead as any).message !== lead.project_description && (
                <div className="mb-6">
                  <p className="text-slate-500 text-xs mb-2">Additional Message</p>
                  <p className="text-slate-300 leading-relaxed">{(lead as any).message}</p>
                </div>
              )}

              {lead.budget_range && (
                <div className="mb-6">
                  <p className="text-slate-500 text-xs mb-2">Budget Range</p>
                  <p className="text-xl font-bold text-white">{getBudgetDisplay(lead.budget_range)}</p>
                </div>
              )}

              {(lead as any).requested_service && (
                <div className="mb-6">
                  <p className="text-slate-500 text-xs mb-2">Requested Service</p>
                  <StatusBadge status={(lead as any).requested_service} variant="info" />
                </div>
              )}

            </Card>

            {(lead as any).notes && (
              <Card glass className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Internal Notes</h3>
                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{(lead as any).notes}</p>
                </div>
              </Card>
            )}

            <Card glass className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Actions</h3>
              <div className="flex flex-wrap gap-3">
                <Link
                  to={`/app/proposals/new?lead_id=${lead.id}`}
                  className="flex items-center space-x-2 px-6 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium rounded-lg transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  <span>Create Proposal</span>
                </Link>
                <a
                  href={`mailto:${lead.email}`}
                  className="flex items-center space-x-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors border border-slate-700"
                >
                  <Mail className="w-5 h-5" />
                  <span>Send Email</span>
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
