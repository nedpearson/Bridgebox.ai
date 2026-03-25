import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, MessageSquare, Search, Filter, ArrowRight, User, Hash, Clock, Plus } from 'lucide-react';
import { globalCommunicationsService, GlobalCommunication } from '../../lib/db/globalCommunications';
import { usePlatformIntelligence } from '../../hooks/usePlatformIntelligence';
import AppHeader from '../../components/app/AppHeader';
import { entityLinkService, EntityType } from '../../lib/db/entityLinks';
import { useAuth } from '../../contexts/AuthContext';


export default function CommunicationsList() {
  const navigate = useNavigate();
  const [comms, setComms] = useState<GlobalCommunication[]>([]);
  const [searchParams] = useSearchParams();
  const contextId = searchParams.get('context');
  const contextType = searchParams.get('contextType') as EntityType | null;
  const { currentOrganization } = useAuth();
  const tenantId = currentOrganization?.id;

  usePlatformIntelligence({
    id: 'page:communications_list',
    name: 'Global Communications Matrix',
    type: 'page',
    description: 'Centralized view of all inbound and outbound email, calls, and messages synced natively to Bridgebox components.',
    relatedNodes: ['module:communications', 'entity:communication'],
    visibility: { roles: ['super_admin', 'tenant_admin', 'manager', 'agent', 'client_admin', 'client_user'] },
    actions: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!tenantId) return;
      try {
        const data = await globalCommunicationsService.getTenantCommunications(tenantId);
        
        if (contextId && contextType) {
          const links = await entityLinkService.getLinkedEntities(contextType, contextId, 'communication');
          const validCommIds = new Set(links.map(link => link.target_id === contextId ? link.source_id : link.target_id));
          setComms(data?.filter(c => validCommIds.has(c.id)) || []);
        } else {
          setComms(data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tenantId, contextId, contextType]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Communications Intelligence</h1>
          <p className="text-slate-400">Unified logging and interaction traces across all synced operations.</p>
        </div>
        <button
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Log Activity</span>
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm p-4">
        {comms.length === 0 ? (
          <div className="text-center p-12 text-slate-400">
            No tracked communications recorded yet.
          </div>
        ) : (
          <div className="space-y-4">
            {comms.map(comm => (
              <div 
                key={comm.id} 
                className="p-4 border border-white/5 rounded-lg bg-black/20 hover:bg-black/40 transition-colors cursor-pointer"
                onClick={() => navigate(`/app/communications/${comm.id}`)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {comm.channel === 'email' && <Mail className="w-4 h-4 text-slate-400" />}
                    {comm.channel === 'call' && <Phone className="w-4 h-4 text-slate-400" />}
                    {comm.channel === 'message' && <MessageSquare className="w-4 h-4 text-slate-400" />}
                    <h4 className="font-medium text-white">{comm.subject || 'Untiled Note'}</h4>
                  </div>
                  <span className="text-xs text-slate-500">{new Date(comm.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-sm text-slate-300 line-clamp-2">{comm.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
