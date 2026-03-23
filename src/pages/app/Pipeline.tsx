import { motion } from 'framer-motion';
import { DollarSign, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import StatusBadge from '../../components/admin/StatusBadge';
import type { PipelineStage, LeadStage } from '../../types';

export default function Pipeline() {
  const pipelineData: PipelineStage[] = [
    {
      stage: 'new',
      leads: [
        {
          id: '5',
          organization_name: 'EdTech Ventures',
          contact_name: 'Lisa Rodriguez',
          estimated_value: 150000,
          service_interest: ['mobile_app', 'ai_automation'],
        },
        {
          id: '6',
          organization_name: 'Legal Services Pro',
          contact_name: 'Mark Johnson',
          estimated_value: 85000,
          service_interest: ['custom_software'],
        },
      ],
      total_value: 235000,
      count: 2,
    } as PipelineStage,
    {
      stage: 'contacted',
      leads: [
        {
          id: '7',
          organization_name: 'PropTech Innovations',
          contact_name: 'Sarah Kim',
          estimated_value: 220000,
          service_interest: ['dashboard', 'integration'],
        },
      ],
      total_value: 220000,
      count: 1,
    } as PipelineStage,
    {
      stage: 'qualified',
      leads: [
        {
          id: '3',
          organization_name: 'Retail Solutions Ltd',
          contact_name: 'David Parker',
          estimated_value: 75000,
          service_interest: ['mobile_app', 'dashboard'],
        },
        {
          id: '8',
          organization_name: 'Energy Systems Co',
          contact_name: 'James Wilson',
          estimated_value: 425000,
          service_interest: ['custom_software', 'ai_automation'],
        },
      ],
      total_value: 500000,
      count: 2,
    } as PipelineStage,
    {
      stage: 'discovery',
      leads: [
        {
          id: '1',
          organization_name: 'FinTech Innovations',
          contact_name: 'Jennifer Adams',
          estimated_value: 350000,
          service_interest: ['custom_software', 'ai_automation'],
        },
      ],
      total_value: 350000,
      count: 1,
    } as PipelineStage,
    {
      stage: 'proposal_sent',
      leads: [
        {
          id: '2',
          organization_name: 'Healthcare Systems Co',
          contact_name: 'Michael Chen',
          estimated_value: 180000,
          service_interest: ['dashboard', 'integration'],
        },
        {
          id: '9',
          organization_name: 'Supply Chain Partners',
          contact_name: 'Amanda Lee',
          estimated_value: 195000,
          service_interest: ['integration', 'custom_software'],
        },
      ],
      total_value: 375000,
      count: 2,
    } as PipelineStage,
    {
      stage: 'negotiation',
      leads: [
        {
          id: '4',
          organization_name: 'Manufacturing Plus',
          contact_name: 'Rachel Thompson',
          estimated_value: 625000,
          service_interest: ['custom_software', 'integration'],
        },
      ],
      total_value: 625000,
      count: 1,
    } as PipelineStage,
  ];

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
                              {lead.organization_name}
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
