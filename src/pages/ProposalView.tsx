import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Mail,
  Calendar,
  DollarSign,
  Package,
  Clock,
  Building2,
  Shield,
  AlertCircle,
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { supabase } from '../lib/supabase';

interface Proposal {
  id: string;
  title: string;
  client_name: string;
  client_email: string;
  scope_summary: string;
  deliverables: Array<{
    name: string;
    description: string;
  }>;
  timeline_estimate: string;
  pricing_model: string;
  pricing_amount: number;
  optional_addons: Array<{
    name: string;
    description: string;
    price: number;
  }>;
  status: string;
  expires_at: string;
  approved_at: string;
  declined_at: string;
  organization_id: string;
}

export default function ProposalView() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [approverName, setApproverName] = useState('');
  const [approverTitle, setApproverTitle] = useState('');
  const [approverEmail, setApproverEmail] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  useEffect(() => {
    if (token) {
      loadProposal();
    }
  }, [token]);

  const loadProposal = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('proposals')
        .select('*')
        .eq('share_token', token)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        setError('Proposal not found');
        return;
      }

      setProposal(data as Proposal);

      // Mark as viewed if not already
      if (data.status === 'sent') {
        await supabase
          .from('proposals')
          .update({ status: 'viewed' })
          .eq('share_token', token);
      }
    } catch (err: any) {
      console.error('Failed to load proposal:', err);
      setError(err.message || 'Failed to load proposal');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!token || !proposal) return;

    if (!approverName || !approverEmail || !agreedToTerms) {
      alert('Please fill in all required fields and accept the terms');
      return;
    }

    try {
      setApproving(true);

      const { error: updateError } = await supabase
        .from('proposals')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approver_name: approverName,
          approver_title: approverTitle,
          approver_email: approverEmail,
          agreement_accepted: agreedToTerms,
        })
        .eq('share_token', token);

      if (updateError) throw updateError;

      await loadProposal();
      setShowApprovalForm(false);
    } catch (err: any) {
      console.error('Failed to approve proposal:', err);
      alert('Failed to approve proposal. Please try again.');
    } finally {
      setApproving(false);
    }
  };

  const handleDecline = async () => {
    if (!token || !proposal) return;

    try {
      setDeclining(true);

      const { error: updateError } = await supabase
        .from('proposals')
        .update({
          status: 'declined',
          declined_at: new Date().toISOString(),
          declined_reason: declineReason || 'No reason provided',
        })
        .eq('share_token', token);

      if (updateError) throw updateError;

      await loadProposal();
      setShowDeclineForm(false);
    } catch (err: any) {
      console.error('Failed to decline proposal:', err);
      alert('Failed to decline proposal. Please try again.');
    } finally {
      setDeclining(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isExpired = proposal?.expires_at && new Date(proposal.expires_at) < new Date();
  const canTakeAction =
    proposal &&
    !proposal.approved_at &&
    !proposal.declined_at &&
    !isExpired &&
    ['sent', 'viewed'].includes(proposal.status);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <Card glass className="max-w-md w-full p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Proposal Not Found</h1>
          <p className="text-slate-400 mb-6">
            {error || 'The proposal you are looking for does not exist or has been removed.'}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-full mb-6">
            <FileText className="w-4 h-4 text-[#3B82F6]" />
            <span className="text-sm font-medium text-[#3B82F6]">Proposal</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">{proposal.title}</h1>
          <p className="text-lg text-slate-400">Prepared for {proposal.client_name}</p>
        </motion.div>

        {/* Status Banner */}
        {proposal.approved_at && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Card className="bg-green-500/10 border-green-500/30 p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-green-400">Proposal Approved</h3>
                  <p className="text-sm text-green-300/80">
                    Approved on {formatDate(proposal.approved_at)}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {proposal.declined_at && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Card className="bg-red-500/10 border-red-500/30 p-6">
              <div className="flex items-center space-x-3">
                <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-red-400">Proposal Declined</h3>
                  <p className="text-sm text-red-300/80">
                    Declined on {formatDate(proposal.declined_at)}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {isExpired && !proposal.approved_at && !proposal.declined_at && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Card className="bg-yellow-500/10 border-yellow-500/30 p-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-400">Proposal Expired</h3>
                  <p className="text-sm text-yellow-300/80">
                    This proposal expired on {formatDate(proposal.expires_at)}. Please contact us
                    to request an updated proposal.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Executive Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card glass className="p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Executive Summary</h2>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
              {proposal.scope_summary ||
                'Thank you for considering our proposal. We look forward to working with you.'}
            </p>
          </Card>
        </motion.div>

        {/* Deliverables */}
        {proposal.deliverables && proposal.deliverables.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card glass className="p-8 mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <Package className="w-6 h-6 text-[#3B82F6]" />
                <h2 className="text-2xl font-bold text-white">Deliverables</h2>
              </div>
              <div className="space-y-4">
                {proposal.deliverables.map((deliverable, index) => (
                  <div
                    key={index}
                    className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg"
                  >
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {deliverable.name}
                    </h3>
                    <p className="text-slate-400 text-sm">{deliverable.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Timeline & Pricing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-2 gap-6 mb-8"
        >
          <Card glass className="p-8">
            <div className="flex items-center space-x-3 mb-4">
              <Clock className="w-6 h-6 text-[#3B82F6]" />
              <h3 className="text-xl font-bold text-white">Timeline</h3>
            </div>
            <p className="text-2xl font-bold text-white">{proposal.timeline_estimate}</p>
            <p className="text-sm text-slate-400 mt-2">Estimated project duration</p>
          </Card>

          <Card glass className="p-8">
            <div className="flex items-center space-x-3 mb-4">
              <DollarSign className="w-6 h-6 text-[#10B981]" />
              <h3 className="text-xl font-bold text-white">Investment</h3>
            </div>
            <p className="text-3xl font-bold text-[#10B981]">
              {formatCurrency(proposal.pricing_amount)}
            </p>
            <p className="text-sm text-slate-400 mt-2 capitalize">
              {proposal.pricing_model.replace('_', ' ')}
            </p>
          </Card>
        </motion.div>

        {/* Optional Add-ons */}
        {proposal.optional_addons && proposal.optional_addons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card glass className="p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Optional Add-ons</h2>
              <div className="space-y-3">
                {proposal.optional_addons.map((addon, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{addon.name}</h3>
                      <p className="text-slate-400 text-sm">{addon.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-white">
                        {formatCurrency(addon.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Action Buttons */}
        {canTakeAction && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <Card glass className="p-8">
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setShowApprovalForm(true)}
                  className="min-w-[200px]"
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Approve Proposal
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowDeclineForm(true)}
                  className="min-w-[200px]"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Request Changes
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-700 text-center">
                <a
                  href={`mailto:${proposal.client_email}?subject=Question about ${proposal.title}`}
                  className="inline-flex items-center space-x-2 text-[#3B82F6] hover:text-[#10B981] transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>Have questions? Contact us</span>
                </a>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Approval Form Modal */}
        <AnimatePresence>
          {showApprovalForm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg"
              >
                <Card glass className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <Shield className="w-6 h-6 text-[#10B981]" />
                    <h3 className="text-2xl font-bold text-white">Approve Proposal</h3>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={approverName}
                        onChange={(e) => setApproverName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#3B82F6]"
                        placeholder="John Smith"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={approverEmail}
                        onChange={(e) => setApproverEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#3B82F6]"
                        placeholder="john@company.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Title (Optional)
                      </label>
                      <input
                        type="text"
                        value={approverTitle}
                        onChange={(e) => setApproverTitle(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#3B82F6]"
                        placeholder="CEO"
                      />
                    </div>

                    <div className="pt-4">
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-800 text-[#3B82F6] focus:ring-[#3B82F6]"
                        />
                        <span className="text-sm text-slate-300">
                          I have reviewed this proposal and approve moving forward with the scope,
                          timeline, and pricing outlined above. *
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Button
                      variant="primary"
                      onClick={handleApprove}
                      disabled={approving || !approverName || !approverEmail || !agreedToTerms}
                      className="flex-1"
                    >
                      {approving ? 'Approving...' : 'Confirm Approval'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowApprovalForm(false)}
                      disabled={approving}
                    >
                      Cancel
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Decline Form Modal */}
        <AnimatePresence>
          {showDeclineForm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg"
              >
                <Card glass className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <Mail className="w-6 h-6 text-[#3B82F6]" />
                    <h3 className="text-2xl font-bold text-white">Request Changes</h3>
                  </div>

                  <p className="text-slate-300 mb-6">
                    Let us know what you'd like to discuss or change about this proposal.
                  </p>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Comments (Optional)
                    </label>
                    <textarea
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#3B82F6] h-32 resize-none"
                      placeholder="Tell us what you'd like to discuss..."
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <Button
                      variant="primary"
                      onClick={handleDecline}
                      disabled={declining}
                      className="flex-1"
                    >
                      {declining ? 'Submitting...' : 'Submit Feedback'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeclineForm(false)}
                      disabled={declining}
                    >
                      Cancel
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center space-x-2 text-slate-500 text-sm">
            <Building2 className="w-4 h-4" />
            <span>Powered by Bridgebox</span>
          </div>
          {proposal.expires_at && !isExpired && (
            <p className="text-slate-600 text-xs mt-2">
              This proposal is valid until {formatDate(proposal.expires_at)}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
