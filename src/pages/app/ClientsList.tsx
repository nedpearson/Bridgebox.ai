import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Building2, TrendingUp, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import StatusBadge from '../../components/admin/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { organizationsService } from '../../lib/db/organizations';

interface ClientWithStats {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  size?: string;
  created_at: string;
  projectCount?: number;
  activeProjectCount?: number;
}

export default function ClientsList() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await organizationsService.getAllClientOrganizations();

      const clientsWithStats = await Promise.all(
        (data || []).map(async (org: any) => {
          const stats = await organizationsService.getOrganizationWithStats(org.id);
          return stats;
        })
      );

      setClients(clientsWithStats.filter(Boolean));
    } catch (err: any) {
      setError(err.message || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const data = await organizationsService.searchOrganizations(query);
        setClients(data || []);
      } catch (err) {
        console.error('Search failed:', err);
      }
    } else {
      loadClients();
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

  return (
    <>
      <AppHeader
        title="Clients"
        subtitle="Manage and monitor all your client accounts"
      />

      <div className="p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#3B82F6] transition-colors"
            />
          </div>

          <button className="flex items-center space-x-2 px-6 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium rounded-lg transition-colors">
            <Plus className="w-5 h-5" />
            <span>Add Client</span>
          </button>
        </div>

        {clients.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No clients yet"
            description="Get started by adding your first client organization"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {clients.map((client, index) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/app/clients/${client.id}`}>
                  <Card glass className="p-6 hover:border-[#3B82F6]/30 transition-all duration-300 cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#10B981] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1">
                            {client.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2">
                            {client.industry && (
                              <span className="text-slate-400 text-sm">{client.industry}</span>
                            )}
                            {client.projectCount !== undefined && (
                              <span className="text-slate-400 text-sm">
                                • {client.projectCount} total projects
                              </span>
                            )}
                            {client.activeProjectCount !== undefined && client.activeProjectCount > 0 && (
                              <span className="text-[#10B981] text-sm">
                                • {client.activeProjectCount} active
                              </span>
                            )}
                          </div>
                          {client.website && (
                            <p className="text-slate-500 text-sm mt-1">{client.website}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {(client.size || client.created_at) && (
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                        {client.size && (
                          <div>
                            <p className="text-slate-500 text-xs mb-1">Company Size</p>
                            <p className="text-white text-sm font-medium">{client.size}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-slate-500 text-xs mb-1">Client Since</p>
                          <p className="text-white text-sm font-medium">
                            {new Date(client.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    )}
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
