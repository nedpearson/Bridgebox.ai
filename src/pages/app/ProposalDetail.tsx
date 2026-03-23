import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, DollarSign, Calendar, Building2, User, Mail, CheckCircle2, XCircle, Send, Copy, MoreVertical, CreditCard as Edit, Trash2, Rocket, Link2 } from 'lucide-react';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import ProposalStatusBadge from '../../components/proposals/ProposalStatusBadge';
import PricingModelBadge from '../../components/proposals/PricingModelBadge';
import ConversionStatus from '../../components/ConversionStatus';
import { proposalsService, ProposalWithDetails, ProposalStatus } from '../../lib/db/proposals';
import { convertProposalToProject } from '../../lib/workflowAutomation';

export default function ProposalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<ProposalWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    if (id) loadProposal();
  }, [id]);

  const loadProposal = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await proposalsService.getProposalById(id);
      setProposal(data);
    } catch (error) {
      console.error('Failed to load proposal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: ProposalStatus) => {
    if (!id) return;

    try {
      await proposalsService.updateProposalStatus(id, status);
      loadProposal();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDuplicate = async () => {
    if (!id) return;

    try {
      const newProposal = await proposalsService.duplicateProposal(id);
      navigate(`/app/proposals/${newProposal.id}`);
    } catch (error) {
      console.error('Failed to duplicate proposal:', error);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this proposal?')) return;

    try {
      await proposalsService.deleteProposal(id);
      navigate('/app/proposals');
    } catch (error) {
      console.error('Failed to delete proposal:', error);
    }
  };

  const handleConvertToProject = async () => {
    if (!id || !proposal) return;

    if (!confirm('Convert this proposal to an active project? This will create a project and apply templates based on service types.')) {
      return;
    }

    try {
      setConverting(true);

      const result = await convertProposalToProject({
        proposalId: id,
        proposalTitle: proposal.title,
        organizationId: proposal.organization_id,
        serviceTypes: proposal.service_types || [],
        scopeSummary: proposal.scope_summary,
        pricingAmount: proposal.pricing_amount,
      });

      if (result.success && result.projectId) {
        alert(result.message);
        navigate(`/app/projects/${result.projectId}`);
      } else {
        alert(result.message || 'Failed to convert proposal');
      }
    } catch (error) {
      console.error('Failed to convert proposal:', error);
      alert('An error occurred while converting the proposal');
    } finally {
      setConverting(false);
    }
  };

  const handleCopyShareLink = () => {
    if (!proposal?.share_token) return;

    const shareUrl = `${window.location.origin}/proposal/${proposal.share_token}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Share link copied to clipboard!');
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
        <AppHeader title="Proposal Details" />
        <div className="p-8 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </>
    );
  }

  if (!proposal) {
    return (
      <>
        <AppHeader title="Proposal Not Found" />
        <div className="p-8">
          <Card glass className="p-12 text-center">
            <FileText className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Proposal Not Found</h2>
            <p className="text-slate-400 mb-6">The proposal you're looking for doesn't exist.</p>
            <Button variant="primary" onClick={() => navigate('/app/proposals')}>
              Back to Proposals
            </Button>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader title={proposal.title} />

      <div className="p-8 space-y-6 max-w-6xl">
        <div className="flex items-center justify-between">
          <Link
            to="/app/proposals"
            className="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Proposals</span>
          </Link>

          <div className="flex items-center space-x-3">
            {(proposal.status === 'approved' && !proposal.converted_to_project) && (
              <Button
                variant="primary"
                onClick={handleConvertToProject}
                disabled={converting}
              >
                <Rocket className="w-4 h-4 mr-2" />
                {converting ? 'Converting...' : 'Convert to Project'}
              </Button>
            )}

            {['sent', 'viewed', 'internal_review'].includes(proposal.status) && (
              <Button variant="outline" onClick={handleCopyShareLink}>
                <Link2 className="w-4 h-4 mr-2" />
                Copy Share Link
              </Button>
            )}

            {proposal.status === 'draft' && (
              <Button variant="outline" onClick={() => handleStatusChange('sent')}>
                <Send className="w-4 h-4 mr-2" />
                Send to Client
              </Button>
            )}

            <div className="relative">
              <Button variant="outline" onClick={() => setActionMenuOpen(!actionMenuOpen)}>
                <MoreVertical className="w-4 h-4" />
              </Button>

              {actionMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-10">
                  <button
                    onClick={handleDuplicate}
                    className="w-full px-4 py-2 text-left text-white hover:bg-slate-800 flex items-center space-x-2"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Duplicate</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left text-red-400 hover:bg-slate-800 flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <ConversionStatus
          leadId={proposal.lead_id || undefined}
          leadName={proposal.lead_name || undefined}
          proposalId={proposal.id}
          proposalTitle={proposal.title}
          converted={proposal.converted_to_project}
        />

        {/* Approval Information */}
        {(proposal.approved_at || proposal.declined_at) && (
          <Card glass className="p-6">
            {proposal.approved_at && (
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Proposal Approved</h3>
                  {proposal.approver_name && (
                    <p className="text-slate-300 mb-1">
                      Approved by <strong>{proposal.approver_name}</strong>
                      {proposal.approver_title && ` (${proposal.approver_title})`}
                    </p>
                  )}
                  {proposal.approver_email && (
                    <p className="text-slate-400 text-sm mb-1">{proposal.approver_email}</p>
                  )}
                  <p className="text-slate-500 text-sm">
                    {new Date(proposal.approved_at).toLocaleString('en-US', {
                      dateStyle: 'long',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
              </div>
            )}
            {proposal.declined_at && (
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Changes Requested</h3>
                  <p className="text-slate-400 text-sm mb-2">
                    {new Date(proposal.declined_at).toLocaleString('en-US', {
                      dateStyle: 'long',
                      timeStyle: 'short',
                    })}
                  </p>
                  {proposal.declined_reason && (
                    <div className="mt-3 p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                      <p className="text-sm text-slate-300">{proposal.declined_reason}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <Card glass className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Status</h3>
              <ProposalStatusBadge status={proposal.status} />
            </div>
            <div className="space-y-3">
              {proposal.status !== 'approved' && proposal.status !== 'declined' && (
                <div className="flex flex-col space-y-2">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleStatusChange('approved')}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark Approved
                  </Button>
                  <Button
                    variant="error"
                    size="sm"
                    onClick={() => handleStatusChange('declined')}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Mark Declined
                  </Button>
                </div>
              )}
            </div>
          </Card>

          <Card glass className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Total Value</h3>
              <DollarSign className="w-5 h-5 text-[#10B981]" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {formatCurrency(proposal.pricing_amount)}
            </div>
            <PricingModelBadge model={proposal.pricing_model} size="sm" />
          </Card>

          <Card glass className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Timeline</h3>
              <Calendar className="w-5 h-5 text-[#3B82F6]" />
            </div>
            <div className="text-2xl font-bold text-white">
              {proposal.timeline_estimate || 'TBD'}
            </div>
          </Card>
        </div>

        <Card glass className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Client Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <Building2 className="w-5 h-5 text-slate-400 mt-1" />
              <div>
                <p className="text-sm text-slate-400">Client Name</p>
                <p className="text-white font-medium">{proposal.client_name}</p>
              </div>
            </div>

            {proposal.client_email && (
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-slate-400 mt-1" />
                <div>
                  <p className="text-sm text-slate-400">Email</p>
                  <p className="text-white font-medium">{proposal.client_email}</p>
                </div>
              </div>
            )}

            {proposal.lead && (
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-slate-400 mt-1" />
                <div>
                  <p className="text-sm text-slate-400">Linked Lead</p>
                  <Link
                    to={`/app/leads/${proposal.lead.id}`}
                    className="text-[#3B82F6] hover:text-[#2563EB] font-medium"
                  >
                    {proposal.lead.company_name}
                  </Link>
                </div>
              </div>
            )}

            {proposal.creator && (
              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-slate-400 mt-1" />
                <div>
                  <p className="text-sm text-slate-400">Created By</p>
                  <p className="text-white font-medium">{proposal.creator.full_name || proposal.creator.email}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {proposal.scope_summary && (
          <Card glass className="p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Executive Summary</h2>
            <p className="text-slate-300 leading-relaxed">{proposal.scope_summary}</p>
          </Card>
        )}

        {proposal.service_types && proposal.service_types.length > 0 && (
          <Card glass className="p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Services</h2>
            <div className="flex flex-wrap gap-2">
              {proposal.service_types.map((service, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30 rounded-lg font-medium"
                >
                  {service}
                </span>
              ))}
            </div>
          </Card>
        )}

        {proposal.deliverables && proposal.deliverables.length > 0 && (
          <Card glass className="p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Deliverables</h2>
            <div className="space-y-4">
              {proposal.deliverables.map((deliverable, idx) => (
                <motion.div
                  key={deliverable.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg"
                >
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{deliverable.title}</h4>
                      <p className="text-slate-300 text-sm">{deliverable.description}</p>
                      {deliverable.timeline && (
                        <p className="text-slate-400 text-xs mt-2">Timeline: {deliverable.timeline}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        )}

        {proposal.optional_addons && proposal.optional_addons.length > 0 && (
          <Card glass className="p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Optional Add-ons</h2>
            <div className="space-y-4">
              {proposal.optional_addons.map((addon, idx) => (
                <div
                  key={addon.id}
                  className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg flex justify-between items-start"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">{addon.title}</h4>
                    <p className="text-slate-300 text-sm">{addon.description}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xl font-bold text-[#10B981]">
                      +{formatCurrency(addon.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {proposal.internal_notes && (
          <Card glass className="p-8 border-yellow-500/30 bg-yellow-500/5">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <FileText className="w-6 h-6 mr-3 text-yellow-500" />
              Internal Notes
            </h2>
            <p className="text-slate-300 leading-relaxed">{proposal.internal_notes}</p>
          </Card>
        )}

        <Card glass className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Created</p>
              <p className="text-white font-medium">{new Date(proposal.created_at).toLocaleDateString()}</p>
            </div>
            {proposal.sent_at && (
              <div>
                <p className="text-slate-400">Sent</p>
                <p className="text-white font-medium">{new Date(proposal.sent_at).toLocaleDateString()}</p>
              </div>
            )}
            {proposal.viewed_at && (
              <div>
                <p className="text-slate-400">Viewed</p>
                <p className="text-white font-medium">{new Date(proposal.viewed_at).toLocaleDateString()}</p>
              </div>
            )}
            {proposal.expires_at && (
              <div>
                <p className="text-slate-400">Expires</p>
                <p className="text-white font-medium">{new Date(proposal.expires_at).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
