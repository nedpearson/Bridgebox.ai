import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Building2, User, Clock, MessageSquare } from 'lucide-react';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import TicketStatusBadge from '../../components/support/TicketStatusBadge';
import TicketPriorityBadge from '../../components/support/TicketPriorityBadge';
import TicketCategoryBadge from '../../components/support/TicketCategoryBadge';
import { supportService, TicketWithDetails, CommentWithAuthor, TicketStatus } from '../../lib/db/support';

export default function SupportTicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<TicketWithDetails | null>(null);
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [ticketData, commentsData] = await Promise.all([
        supportService.getTicketById(id),
        supportService.getTicketComments(id),
      ]);
      setTicket(ticketData);
      setComments(commentsData);
    } catch (error) {
      console.error('Failed to load ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: TicketStatus) => {
    if (!id) return;

    try {
      await supportService.updateTicketStatus(id, status);
      loadData();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!id || !newComment.trim()) return;

    try {
      setSubmitting(true);
      await supportService.createComment({
        ticket_id: id,
        content: newComment.trim(),
        is_internal: isInternal,
      });
      setNewComment('');
      setIsInternal(false);
      loadData();
    } catch (error) {
      console.error('Failed to create comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <AppHeader title="Support Ticket" />
        <div className="p-8 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </>
    );
  }

  if (!ticket) {
    return (
      <>
        <AppHeader title="Ticket Not Found" />
        <div className="p-8">
          <Card glass className="p-12 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Ticket Not Found</h2>
            <Button variant="primary" onClick={() => navigate('/app/support')}>
              Back to Support Queue
            </Button>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader title={ticket.title} />

      <div className="p-8 space-y-6 max-w-6xl">
        <Link
          to="/app/support"
          className="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Support Queue</span>
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Status</h3>
            <div className="space-y-3">
              <TicketStatusBadge status={ticket.status} />
              <select
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="open">Open</option>
                <option value="in_review">In Review</option>
                <option value="waiting_on_client">Waiting on Client</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </Card>

          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Priority</h3>
            <TicketPriorityBadge priority={ticket.priority} />
          </Card>

          <Card glass className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Category</h3>
            <TicketCategoryBadge category={ticket.category} />
          </Card>
        </div>

        <Card glass className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Ticket Details</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {ticket.organization && (
              <div className="flex items-start space-x-3">
                <Building2 className="w-5 h-5 text-slate-400 mt-1" />
                <div>
                  <p className="text-sm text-slate-400">Organization</p>
                  <p className="text-white font-medium">{ticket.organization.name}</p>
                </div>
              </div>
            )}

            {ticket.requester && (
              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-slate-400 mt-1" />
                <div>
                  <p className="text-sm text-slate-400">Requester</p>
                  <p className="text-white font-medium">{ticket.requester.full_name || ticket.requester.email}</p>
                </div>
              </div>
            )}

            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-slate-400 mt-1" />
              <div>
                <p className="text-sm text-slate-400">Created</p>
                <p className="text-white font-medium">{new Date(ticket.created_at).toLocaleString()}</p>
              </div>
            </div>

            {ticket.assigned_user && (
              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-slate-400 mt-1" />
                <div>
                  <p className="text-sm text-slate-400">Assigned To</p>
                  <p className="text-white font-medium">{ticket.assigned_user.full_name || ticket.assigned_user.email}</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
          </div>
        </Card>

        <Card glass className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <MessageSquare className="w-6 h-6 mr-3" />
            Activity
          </h2>

          <div className="space-y-6 mb-6">
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg ${
                  comment.is_internal
                    ? 'bg-yellow-500/5 border border-yellow-500/30'
                    : 'bg-slate-800/30 border border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-white">
                      {comment.author?.full_name || comment.author?.email || 'Unknown'}
                    </span>
                    {comment.is_internal && (
                      <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">
                        Internal
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-slate-400">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-300 whitespace-pre-wrap">{comment.content}</p>
              </motion.div>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-6">
            <div className="space-y-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={4}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="w-4 h-4 bg-slate-800 border-slate-700 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <span>Internal note (not visible to client)</span>
                </label>

                <Button
                  variant="primary"
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || submitting}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? 'Sending...' : 'Send Comment'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
