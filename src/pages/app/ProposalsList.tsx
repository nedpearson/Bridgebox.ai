import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Plus, DollarSign, Calendar, Building2, Filter, Search } from 'lucide-react';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import ProposalStatusBadge from '../../components/proposals/ProposalStatusBadge';
import PricingModelBadge from '../../components/proposals/PricingModelBadge';
import { proposalsService, ProposalWithDetails } from '../../lib/db/proposals';

export default function ProposalsList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [proposals, setProposals] = useState<ProposalWithDetails[]>([]);
  const [filteredProposals, setFilteredProposals] = useState<ProposalWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'all');

  useEffect(() => {
    loadProposals();
  }, []);

  useEffect(() => {
    filterProposals();
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (statusFilter !== 'all') newParams.set('status', statusFilter);
      else newParams.delete('status');
      return newParams;
    }, { replace: true });
  }, [proposals, searchTerm, statusFilter, setSearchParams]);

  const loadProposals = async () => {
    try {
      setLoading(true);
      const data = await proposalsService.getAllProposals();
      setProposals(data);
    } catch (error) {
      console.error('Failed to load proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProposals = () => {
    let filtered = [...proposals];

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.client_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    setFilteredProposals(filtered);
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'TBD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <>
        <AppHeader title="Proposals" subtitle="Manage client proposals and quotes" />
        <div className="p-8 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader
        title="Proposals"
        subtitle="Manage client proposals and quotes"
        action={
          <Button variant="primary" onClick={() => navigate('/app/proposals/new')}>
            <Plus className="w-5 h-5 mr-2" />
            New Proposal
          </Button>
        }
      />

      <div className="p-8 space-y-6">
        <Card glass className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search proposals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-11 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Filter className="w-5 h-5 text-slate-400 hidden sm:block" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="internal_review">Internal Review</option>
                <option value="sent">Sent</option>
                <option value="viewed">Viewed</option>
                <option value="approved">Approved</option>
                <option value="declined">Declined</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-6">
          {filteredProposals.length === 0 ? (
            <Card glass className="p-12">
              <EmptyState
                icon={FileText}
                title={searchTerm || statusFilter !== 'all' ? 'No Proposals Found' : 'No Proposals Yet'}
                description={
                  searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Create your first proposal to get started'
                }
              />
            </Card>
          ) : (
            filteredProposals.map((proposal) => (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Link to={`/app/proposals/${proposal.id}`}>
                  <Card
                    glass
                    className="p-6 hover:border-[#3B82F6]/50 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-white group-hover:text-[#3B82F6] transition-colors mb-2">
                              {proposal.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                              <div className="flex items-center space-x-2">
                                <Building2 className="w-4 h-4" />
                                <span>{proposal.client_name}</span>
                              </div>
                              {proposal.lead && (
                                <div className="flex items-center space-x-2">
                                  <FileText className="w-4 h-4" />
                                  <span>From: {proposal.lead.company_name}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(proposal.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {proposal.scope_summary && (
                          <p className="text-slate-300 text-sm line-clamp-2">{proposal.scope_summary}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-2">
                          <ProposalStatusBadge status={proposal.status} size="sm" />
                          <PricingModelBadge model={proposal.pricing_model} size="sm" />
                          {proposal.service_types && proposal.service_types.length > 0 && (
                            <>
                              {proposal.service_types.slice(0, 3).map((service, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs px-2 py-1 bg-slate-800/50 text-slate-300 rounded-full border border-slate-700"
                                >
                                  {service}
                                </span>
                              ))}
                              {proposal.service_types.length > 3 && (
                                <span className="text-xs px-2 py-1 bg-slate-800/50 text-slate-400 rounded-full border border-slate-700">
                                  +{proposal.service_types.length - 3} more
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-2">
                        <div className="text-right">
                          <div className="flex items-center space-x-2 text-2xl font-bold text-white">
                            <DollarSign className="w-6 h-6 text-[#10B981]" />
                            <span>{formatCurrency(proposal.pricing_amount)}</span>
                          </div>
                          {proposal.timeline_estimate && (
                            <p className="text-sm text-slate-400 mt-1">{proposal.timeline_estimate}</p>
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
