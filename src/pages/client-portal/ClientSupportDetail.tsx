import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Clock, MessageSquare } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import TicketStatusBadge from '../../components/support/TicketStatusBadge';
import TicketPriorityBadge from '../../components/support/TicketPriorityBadge';
import TicketCategoryBadge from '../../components/support/TicketCategoryBadge';
import { supportService, TicketWithDetails, CommentWithAuthor } from '../../lib/db/support';

export default function ClientSupportDetail() {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<TicketWithDetails | null>(null);
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
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
      setComments(commentsData.filter((c) => !c.is_internal));
    } catch (error) {
      console.error('Failed to load ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!id || !newComment.trim()) return;

    try {
      setSubmitting(true);
      await supportService.createComment({
        ticket_id: id,
        content: newComment.trim(),
        is_internal: false,
      });
      setNewComment('');
      loadData();
    } catch (error) {
      console.error('Failed to create comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <Card glass className="p-12 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Ticket Not Found</h2>
        <Button variant="primary" onClick={() => window.history.back()}>
          Back to Support
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/client-portal/support"
        className="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Support</span>
      </Link>

      <Card glass className="p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-4">{ticket.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <TicketStatusBadge status={ticket.status} />
            <TicketPriorityBadge priority={ticket.priority} />
            <TicketCategoryBadge category={ticket.category} />
          </div>
          <div className="flex items-center space-x-4 text-sm text-slate-400">
            <span className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Created {new Date(ticket.created_at).toLocaleString()}</span>
            </span>
            {ticket.assigned_user && (
              <span>Assigned to: {ticket.assigned_user.full_name || ticket.assigned_user.email}</span>
            )}
          </div>
        </div>

        <div className="mb-6 pb-6 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
          <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <MessageSquare className="w-6 h-6 mr-3" />
            Activity
          </h2>

          <div className="space-y-6 mb-6">
            {comments.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No comments yet</p>
            ) : (
              comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-medium text-white">
                      {comment.author?.full_name || comment.author?.email || 'Team Member'}
                    </span>
                    <span className="text-sm text-slate-400">
                      {new Date(comment.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-300 whitespace-pre-wrap">{comment.content}</p>
                </motion.div>
              ))
            )}
          </div>

          {ticket.status !== 'closed' && (
            <div className="border-t border-slate-800 pt-6">
              <div className="space-y-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={4}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />

                <div className="flex justify-end">
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
          )}
        </div>
      </Card>
    </div>
  );
}
