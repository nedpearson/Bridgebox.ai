import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import StatusBadge from '../../components/admin/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { leadsService } from '../../lib/db/leads';
import type { PipelineStage, LeadStage } from '../../types';

export default function Pipeline() {
  const [pipelineData, setPipelineData] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPipeline();
  }, []);

  const parseBudgetRange = (range: string | null | undefined): number => {
    if (!range) return 0;
    const map: Record<string, number> = {
      under_25k: 15000,
      '25k_50k': 35000,
      '50k_100k': 75000,
      '100k_250k': 150000,
      '250k_plus': 250000,
    };
    return map[range] || 0;
  };

  const loadPipeline = async () => {
    try {
      setLoading(true);
      const data = await leadsService.getAllLeads();
      const stages: LeadStage[] = [
        'new', 'contacted', 'qualified', 'discovery', 
        'proposal_sent', 'negotiation', 'won', 'lost'
      ];
      
      const computedPipeline = stages.map(stage => {
        const stageLeads: any[] = data.filter(lead => lead.status === stage).map(lead => ({
          id: lead.id,
          company_name: lead.company || lead.name,
          contact_name: lead.name,
          contact_email: lead.email,
          estimated_value: parseBudgetRange(lead.budget_range),
          service_interest: Object.keys(lead).includes('requested_service') 
            ? [((lead as any).requested_service)] 
            : [lead.lead_type],
        }));
        
        return {
          stage,
          leads: stageLeads,
          total_value: stageLeads.reduce((sum, l) => sum + (l.estimated_value || 0), 0),
          count: stageLeads.length
        };
      });

      setPipelineData(computedPipeline);
    } catch (err) {
      console.error('Failed to load pipeline:', err);
    } finally {
      setLoading(false);
    }
  };

  const stageLabels: Record<LeadStage, string> = {
    new: 'New',
    contacted: 'Contacted',
    qualified: 'Qualified',
    discovery: 'Discovery',
    proposal_sent: 'Proposal Sent',
    negotiation: 'Negotiation',
    won: 'Won',
    lost: 'Lost',
  };

  const totalPipelineValue = pipelineData.reduce((sum, stage) => sum + stage.total_value, 0);
  const totalLeads = pipelineData.reduce((sum, stage) => sum + stage.count, 0);

  if (loading) {
    return (
      <>
        <AppHeader title="Sales Pipeline" subtitle="Track deals through your sales process" />
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Sales Pipeline" subtitle="Track deals through your sales process" />

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card glass className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-2">Total Pipeline Value</p>
                <p className="text-3xl font-bold text-[#10B981]">
                  ${(totalPipelineValue / 1000000).toFixed(2)}M
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-[#10B981] opacity-20" />
            </div>
          </Card>

          <Card glass className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-2">Active Opportunities</p>
                <p className="text-3xl font-bold text-[#3B82F6]">{totalLeads}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-[#3B82F6] opacity-20" />
            </div>
          </Card>

          <Card glass className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-2">Average Deal Size</p>
                <p className="text-3xl font-bold text-white">
                  ${Math.round(totalPipelineValue / totalLeads / 1000)}K
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-white opacity-20" />
            </div>
          </Card>
        </div>

        <div className="overflow-x-auto">
          <div className="inline-flex space-x-4 pb-4 min-w-full">
            {pipelineData.map((stage, stageIndex) => (
              <motion.div
                key={stage.stage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: stageIndex * 0.1 }}
                className="flex-shrink-0 w-80"
              >
                <Card glass className="p-4 h-full">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-bold text-lg">
                        {stageLabels[stage.stage]}
                      </h3>
                      <span className="text-slate-400 text-sm">{stage.count}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-[#10B981]" />
                      <span className="text-[#10B981] font-semibold">
                        ${(stage.total_value / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {stage.leads.map((lead, leadIndex) => (
                      <motion.div
                        key={lead.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: stageIndex * 0.1 + leadIndex * 0.05 }}
                      >
                        <Link to={`/app/leads/${lead.id}`}>
                          <div className="bg-slate-800/50 border border-slate-700/50 hover:border-[#3B82F6]/50 rounded-lg p-4 transition-all duration-300 cursor-pointer">
                            <h4 className="text-white font-semibold mb-1 line-clamp-1">
                              {lead.company_name || lead.contact_name}
                            </h4>
                            <p className="text-slate-400 text-sm mb-3">{lead.contact_name}</p>

                            <div className="flex flex-wrap gap-1 mb-3">
                              {lead.service_interest?.slice(0, 2).map((service, idx) => (
                                <StatusBadge key={idx} status={service} variant="info" />
                              ))}
                            </div>

                            {lead.estimated_value && (
                              <div className="flex items-center space-x-2 pt-3 border-t border-slate-800">
                                <DollarSign className="w-4 h-4 text-[#10B981]" />
                                <span className="text-white font-semibold text-sm">
                                  ${(lead.estimated_value / 1000).toFixed(0)}K
                                </span>
                              </div>
                            )}
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
