import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { entityLinkService, EntityType, EntityLink } from '../../lib/db/entityLinks';
import { Network, Link as LinkIcon, Box, FileText, CheckCircle2, GitMerge, Mail, Plus } from 'lucide-react';
import EntityLinkModal from './EntityLinkModal';

interface RelationalNetworkBoardProps {
  entityType: EntityType;
  entityId: string;
}

export default function RelationalNetworkBoard({ entityType, entityId }: RelationalNetworkBoardProps) {
  const { currentOrganization } = useAuth();
  const [links, setLinks] = useState<EntityLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadNetwork();
  }, [entityType, entityId]);

  const loadNetwork = async () => {
    try {
      setLoading(true);
      const data = await entityLinkService.getLinkedEntities(entityType, entityId);
      setLinks(data);
    } catch (err) {
      console.error('Failed to load entity network topology:', err);
    } finally {
      setLoading(false);
    }
  };

  const getNodeIcon = (type: EntityType) => {
    switch (type) {
      case 'organization': return <Box className="w-5 h-5 text-indigo-400" />;
      case 'project': return <Box className="w-5 h-5 text-emerald-400" />;
      case 'task': return <CheckCircle2 className="w-5 h-5 text-amber-400" />;
      case 'document': return <FileText className="w-5 h-5 text-red-400" />;
      case 'workflow': return <GitMerge className="w-5 h-5 text-purple-400" />;
      case 'communication': return <Mail className="w-5 h-5 text-blue-400" />;
      default: return <Box className="w-5 h-5 text-slate-400" />;
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Relational Network</h3>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-700">
             <Network className="w-4 h-4 text-indigo-400" />
             <span>N-Degree Map Active</span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Link Entity</span>
          </button>
        </div>
      </div>

      {links.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center flex flex-col items-center">
          <Network className="w-12 h-12 text-slate-600 mb-4" />
          <p className="text-slate-400 font-medium mb-1">No relational binds discovered.</p>
          <p className="text-slate-500 text-sm">This entity exists purely independently in the graph matrix.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {links.map(link => {
            const isTargetNode = link.source_id === entityId && link.source_type === entityType;
            const adjacentType = isTargetNode ? link.target_type : link.source_type;
            const adjacentId = isTargetNode ? link.target_id : link.source_id;

            return (
              <div key={link.id} className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-xl hover:border-indigo-500/30 transition-colors flex items-center justify-between">
                 <div className="flex items-center space-x-4">
                    <div className="p-2 bg-slate-900 rounded-lg">
                      {getNodeIcon(adjacentType)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white capitalize">{adjacentType}</h4>
                      <div className="flex items-center space-x-2 mt-1 text-xs text-slate-400">
                         <span>ID: {adjacentId.slice(0, 8)}</span>
                         <span>•</span>
                         <span className="flex items-center"><LinkIcon className="w-3 h-3 mr-1" />{link.relationship_type.replace('_', ' ')}</span>
                      </div>
                    </div>
                 </div>
                 <div className="text-xs text-slate-500">
                   {new Date(link.created_at).toLocaleDateString()}
                 </div>
              </div>
            );
          })}
        </div>
      )}

      <EntityLinkModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        entityType={entityType}
        entityId={entityId}
        onLinkComplete={loadNetwork}
      />
    </div>
  );
}
