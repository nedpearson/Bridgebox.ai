import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Users, Mail, Phone } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import StatusBadge from '../../components/admin/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import { leadsService } from '../../lib/db/leads';
import type { LeadRecord } from '../../types/database';
import AddLeadModal from '../../components/app/AddLeadModal';

export default function LeadsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>(searchParams.get('status') || 'all');
  const [filterType, setFilterType] = useState<string>(searchParams.get('type') || 'all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (filterStatus !== 'all') newParams.set('status', filterStatus);
      else newParams.delete('status');
      
      if (filterType !== 'all') newParams.set('type', filterType);
      else newParams.delete('type');
      
      return newParams;
    }, { replace: true });
  }, [filterStatus, filterType, setSearchParams]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const data = await leadsService.getAllLeads();
      setLeads(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const data = await leadsService.searchLeads(query);
        setLeads(data);
      } catch (err) {
        console.error('Search failed:', err);
      }
    } else {
      loadLeads();
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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'converted':
        return 'success';
      case 'lost':
        return 'danger';
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
      platform_subscription: 'Platform',
      custom_software: 'Custom Software',
      dashboard_analytics: 'Dashboards',
      mobile_app: 'Mobile App',
      ai_automation: 'AI & Automation',
      enterprise_integration: 'Integration',
      support_retainer: 'Support',
      consultation: 'Consultation',
    };
    return map[type] || type;
  };

  const filteredLeads = leads.filter((lead) => {
    if (filterStatus !== 'all' && lead.status !== filterStatus) return false;
    if (filterType !== 'all' && lead.lead_type !== filterType) return false;
    return true;
  });

  return (
    <>
      <AppHeader title="Leads" subtitle="Track and manage sales opportunities" />

      <div className="p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#3B82F6] transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#3B82F6] transition-colors"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="proposal_sent">Proposal Sent</option>
              <option value="negotiation">Negotiation</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#3B82F6] transition-colors"
            >
              <option value="all">All Types</option>
              <option value="platform_subscription">Platform Subscription</option>
              <option value="custom_software">Custom Software</option>
              <option value="dashboard_analytics">Dashboards</option>
              <option value="mobile_app">Mobile App</option>
              <option value="ai_automation">AI & Automation</option>
              <option value="enterprise_integration">Enterprise Integration</option>
              <option value="support_retainer">Support & Retainer</option>
              <option value="consultation">Consultation</option>
            </select>

            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Lead</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredLeads.map((lead, index) => (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={`/app/leads/${lead.id}`}>
                <Card glass className="p-6 hover:border-[#3B82F6]/30 transition-all duration-300 cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#10B981] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-white" />
                      </div>

                      <div className="flex-1 grid md:grid-cols-3 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-1">
                            {lead.name}
                          </h3>
                          <p className="text-slate-400 text-sm mb-3">
                            {lead.company || 'No company'}
                          </p>
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-2 text-slate-400 text-sm">
                              <Mail className="w-3 h-3" />
                              <span>{lead.email}</span>
                            </div>
                            {(lead as any).phone && (
                              <div className="flex items-center space-x-2 text-slate-400 text-sm">
                                <Phone className="w-3 h-3" />
                                <span>{(lead as any).phone}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="space-y-3">
                            <div>
                              <p className="text-slate-500 text-xs mb-1">Type</p>
                              <StatusBadge status={getTypeLabel(lead.lead_type)} variant="info" />
                            </div>
                            <div>
                              <p className="text-slate-500 text-xs mb-1">Form</p>
                              <StatusBadge status={lead.form_type} variant="default" />
                            </div>
                            {lead.budget_range && (
                              <div>
                                <p className="text-slate-500 text-xs mb-1">Budget Range</p>
                                <p className="text-white text-sm font-medium">
                                  {getBudgetDisplay(lead.budget_range)}
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-slate-500 text-xs mb-1">Source</p>
                              <StatusBadge status={(lead as any).source || 'website'} variant="default" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="space-y-3">
                            <div>
                              <p className="text-slate-500 text-xs mb-1">Status</p>
                              <StatusBadge
                                status={lead.status}
                                variant={getStatusVariant(lead.status)}
                              />
                            </div>
                            {(lead as any).priority && (
                              <div>
                                <p className="text-slate-500 text-xs mb-1">Priority</p>
                                <StatusBadge status={(lead as any).priority} variant={(lead as any).priority === 'urgent' ? 'danger' : (lead as any).priority === 'high' ? 'warning' : 'default'} />
                              </div>
                            )}
                            <div>
                              <p className="text-slate-500 text-xs mb-1">Created</p>
                              <p className="text-white text-sm">{new Date(lead.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {lead.project_description && (
                    <div className="mt-4 pt-4 border-t border-slate-800">
                      <p className="text-slate-500 text-xs mb-1">Project Description</p>
                      <p className="text-slate-300 text-sm line-clamp-2">
                        {lead.project_description}
                      </p>
                    </div>
                  )}
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadLeads}
      />
    </>
  );
}
