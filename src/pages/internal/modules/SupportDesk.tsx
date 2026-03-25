import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supportTicketsApi, SupportTicket } from '../../../lib/supportTickets';
import { Loader2, Shield, Clock, BrainCircuit, Activity, LayoutDashboard, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SupportDesk() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'action_required' | 'resolved'>('all');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await supportTicketsApi.getAllTickets();
      setTickets(data);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize Operations Master Inbox');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      case 'low': return 'bg-slate-700/50 text-slate-400 border-slate-600/50';
      default: return 'bg-slate-800 text-slate-500 border-slate-700'; // Pending AI
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (activeTab === 'action_required' && ['resolved', 'closed'].includes(ticket.status)) return false;
    if (activeTab === 'resolved' && !['resolved', 'closed'].includes(ticket.status)) return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        ticket.title.toLowerCase().includes(q) ||
        (ticket.ai_summary || '').toLowerCase().includes(q) ||
        ticket.session_code?.toLowerCase().includes(q) ||
        ((ticket as any).organizations?.name || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8">
      
      {/* Inbox Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center space-x-3 mb-2">
            <Shield className="w-8 h-8 text-blue-500" />
            <span>Support Operations Desk</span>
          </h1>
          <p className="text-slate-400">
            Global inbox orchestrator for incoming Tenant Support Pipelines.
          </p>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Query payloads..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors w-64"
            />
          </div>
          <button className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800">
        {[
          { id: 'action_required', label: 'Requires Action', icon: Activity },
          { id: 'resolved', label: 'Resolved / Closed', icon: Shield },
          { id: 'all', label: 'Unified Log', icon: LayoutDashboard }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'all' | 'action_required' | 'resolved')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                activeTab === tab.id 
                  ? 'border-blue-500 text-blue-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Data Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg text-center font-medium">
          {error}
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-16 text-center">
          <Shield className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Empty Cohort</h3>
          <p className="text-slate-500">No support vectors match the active pipeline filter.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
          <table className="w-full text-left">
            <thead className="bg-slate-950 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tenant Identity</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Payload Vector</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Severity Pipeline</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status Constraint</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Age</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredTickets.map((ticket) => (
                <tr 
                  key={ticket.id} 
                  onClick={() => navigate(`/app/internal/recording-center/support/${ticket.id}`)}
                  className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col">
                      <span className="text-white font-medium group-hover:text-blue-400 transition-colors">
                        {(ticket as any).organizations?.name || 'Isolated Context'}
                      </span>
                      <span className="text-slate-500 text-xs">
                        {(ticket as any).profiles?.full_name || 'System Actor'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top max-w-sm">
                    <div className="flex flex-col space-y-1">
                      <span className="text-slate-200 font-medium line-clamp-1">{ticket.title}</span>
                      {ticket.ai_summary ? (
                         <span className="text-indigo-400/80 text-xs line-clamp-2 italic border-l-2 border-indigo-500/30 pl-2">
                           {ticket.ai_summary}
                         </span>
                      ) : (
                         <span className="text-slate-500 text-xs line-clamp-1">
                           {ticket.description || 'No raw string description.'}
                         </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    {ticket.ai_processed_at ? (
                      <span className={`px-2.5 py-1 rounded text-xs font-bold border capitalize ${getSeverityColor(ticket.ai_severity)}`}>
                        {ticket.ai_severity}
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-slate-500 text-xs font-medium">
                        <BrainCircuit className="w-3 h-3" />
                        <span>Awaiting Intelligence</span>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col space-y-2 items-start">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        ticket.status === 'resolved' ? 'bg-slate-800 text-slate-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      {ticket.session_code && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                          Active Cast: {ticket.session_code}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-1 text-slate-500 text-sm">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
