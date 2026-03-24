import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LifeBuoy, Plus, Search, Filter, Clock } from 'lucide-react';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import TicketStatusBadge from '../../components/support/TicketStatusBadge';
import TicketPriorityBadge from '../../components/support/TicketPriorityBadge';
import TicketCategoryBadge from '../../components/support/TicketCategoryBadge';
import KPICard from '../../components/admin/KPICard';
import { supportService, TicketWithDetails, TicketStatus, TicketPriority } from '../../lib/db/support';

export default function SupportQueue() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tickets, setTickets] = useState<TicketWithDetails[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<TicketWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [tickets, searchTerm, statusFilter, priorityFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ticketsData, statsData] = await Promise.all([
        supportService.getAllTickets(),
        supportService.getTicketStats(),
      ]);
      setTickets(ticketsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load support data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTickets = () => {
    let filtered = [...tickets];

    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.organization?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter((t) => t.priority === priorityFilter);
    }

    setFilteredTickets(filtered);
  };

  const getTimeSince = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const diff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));

    if (diff < 1) return 'Just now';
    if (diff < 24) return `${diff}h ago`;
    const days = Math.floor(diff / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <>
        <AppHeader title="Support Queue" subtitle="Manage client support requests" />
        <div className="p-8 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Support Queue" subtitle="Manage client support requests" />

      <div className="p-8 space-y-6">
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Open Tickets"
              value={stats.open}
              icon={LifeBuoy}
              trend={{ value: 0, direction: 'down' }}
            />
            <KPICard
              title="In Progress"
              value={stats.in_progress}
              icon={Clock}
              trend={{ value: 0, direction: 'up' }}
            />
            <KPICard
              title="Urgent"
              value={stats.urgent}
              icon={LifeBuoy}
              trend={{ value: 0, direction: 'down' }}
            />
            <KPICard
              title="Resolved"
              value={stats.resolved}
              icon={LifeBuoy}
              trend={{ value: 0, direction: 'up' }}
            />
          </div>
        )}

        <Card glass className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-11 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_review">In Review</option>
                <option value="waiting_on_client">Waiting on Client</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {filteredTickets.length === 0 ? (
            <Card glass className="p-12">
              <EmptyState
                icon={LifeBuoy}
                title={searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' ? 'No Tickets Found' : 'No Tickets Yet'}
                description={
                  searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Support tickets will appear here'
                }
              />
            </Card>
          ) : (
            filteredTickets.map((ticket) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Link to={`/app/support/${ticket.id}`}>
                  <Card glass className="p-6 hover:border-[#3B82F6]/50 transition-all duration-300 cursor-pointer group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-white group-hover:text-[#3B82F6] transition-colors mb-2">
                              {ticket.title}
                            </h3>
                            <p className="text-slate-400 text-sm line-clamp-2 mb-3">
                              {ticket.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <TicketStatusBadge status={ticket.status} size="sm" />
                          <TicketPriorityBadge priority={ticket.priority} size="sm" />
                          <TicketCategoryBadge category={ticket.category} size="sm" />
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                          {ticket.organization && (
                            <span>{ticket.organization.name}</span>
                          )}
                          {ticket.requester && (
                            <span>Requested by: {ticket.requester.full_name || ticket.requester.email}</span>
                          )}
                          {ticket.assigned_user && (
                            <span>Assigned to: {ticket.assigned_user.full_name || ticket.assigned_user.email}</span>
                          )}
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{getTimeSince(ticket.created_at)}</span>
                          </span>
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
