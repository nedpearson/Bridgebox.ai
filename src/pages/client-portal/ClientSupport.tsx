import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, LifeBuoy, Clock, MessageSquare } from "lucide-react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import TicketStatusBadge from "../../components/support/TicketStatusBadge";
import TicketPriorityBadge from "../../components/support/TicketPriorityBadge";
import TicketCategoryBadge from "../../components/support/TicketCategoryBadge";
import { supportService, TicketWithDetails } from "../../lib/db/support";
import { useAuth } from "../../contexts/AuthContext";

export default function ClientSupport() {
  const { currentOrganization } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState<TicketWithDetails[]>([]);
  const statusFilter = searchParams.get("status") || "all";
  const filteredTickets = tickets.filter(
    (t) => statusFilter === "all" || t.status === statusFilter,
  );
  const [loading, setLoading] = useState(true);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    category: "general_support" as const,
  });

  useEffect(() => {
    if (currentOrganization) loadTickets();
  }, [currentOrganization]);

  const loadTickets = async () => {
    if (!currentOrganization) return;

    try {
      setLoading(true);
      const data = await supportService.getOrganizationTickets(
        currentOrganization.id,
      );
      setTickets(data);
    } catch (error) {
      console.error("Failed to load tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTicket = async () => {
    if (
      !currentOrganization ||
      !newTicket.title.trim() ||
      !newTicket.description.trim()
    )
      return;

    try {
      await supportService.createTicket({
        ...newTicket,
        organization_id: currentOrganization.id,
      });
      setNewTicket({
        title: "",
        description: "",
        priority: "medium",
        category: "general_support",
      });
      setShowNewTicket(false);
      loadTickets();
    } catch (error) {
      console.error("Failed to create ticket:", error);
    }
  };

  const getTimeSince = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const diff = Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 60 * 60),
    );

    if (diff < 1) return "Just now";
    if (diff < 24) return `${diff}h ago`;
    const days = Math.floor(diff / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Support</h1>
          <p className="text-slate-400">
            Get help with your projects and services
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setSearchParams({ status: "all" })}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${statusFilter === "all" ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white"}`}
            >
              All
            </button>
            <button
              onClick={() => setSearchParams({ status: "open" })}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${statusFilter === "open" ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Open
            </button>
            <button
              onClick={() => setSearchParams({ status: "closed" })}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${statusFilter === "closed" ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Closed
            </button>
          </div>

          <Button
            variant="primary"
            onClick={() => setShowNewTicket(!showNewTicket)}
          >
            <Plus className="w-5 h-5 mr-2" />
            New Ticket
          </Button>
        </div>
      </div>

      {showNewTicket && (
        <Card glass className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Create Support Ticket
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={newTicket.title}
                onChange={(e) =>
                  setNewTicket({ ...newTicket, title: e.target.value })
                }
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Brief description of the issue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={newTicket.description}
                onChange={(e) =>
                  setNewTicket({ ...newTicket, description: e.target.value })
                }
                rows={4}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Provide details about your request..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Priority
                </label>
                <select
                  value={newTicket.priority}
                  onChange={(e) =>
                    setNewTicket({
                      ...newTicket,
                      priority: e.target.value as any,
                    })
                  }
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Category
                </label>
                <select
                  value={newTicket.category}
                  onChange={(e) =>
                    setNewTicket({
                      ...newTicket,
                      category: e.target.value as any,
                    })
                  }
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="general_support">General Support</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature_request">Feature Request</option>
                  <option value="dashboard_change">Dashboard Change</option>
                  <option value="mobile_app_request">Mobile App</option>
                  <option value="integration_issue">Integration Issue</option>
                  <option value="billing_issue">Billing Issue</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowNewTicket(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmitTicket}
                disabled={
                  !newTicket.title.trim() || !newTicket.description.trim()
                }
                className="flex-1"
              >
                Submit Ticket
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <Card glass className="p-12">
            <EmptyState
              icon={LifeBuoy}
              title={
                tickets.length === 0 ? "No Support Tickets" : "No Tickets Found"
              }
              description={
                tickets.length === 0
                  ? "Create a ticket to get help from our team"
                  : "No tickets match the selected filter."
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
              <Link to={`/client-portal/support/${ticket.id}`}>
                <Card
                  glass
                  className="p-6 hover:border-indigo-500/50 transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white group-hover:text-indigo-500 transition-colors mb-2">
                        {ticket.title}
                      </h3>
                      <p className="text-slate-400 text-sm line-clamp-2 mb-3">
                        {ticket.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <TicketStatusBadge status={ticket.status} size="sm" />
                        <TicketPriorityBadge
                          priority={ticket.priority}
                          size="sm"
                        />
                        <TicketCategoryBadge
                          category={ticket.category}
                          size="sm"
                        />
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{getTimeSince(ticket.created_at)}</span>
                        </span>
                        {ticket.assigned_user && (
                          <span>
                            Assigned to:{" "}
                            {ticket.assigned_user.full_name ||
                              ticket.assigned_user.email}
                          </span>
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
  );
}
