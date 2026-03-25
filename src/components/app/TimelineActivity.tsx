import React, { useState, useEffect } from 'react';
import { Activity, Mail, CheckCircle2, FileText, GitMerge, ArrowRight } from 'lucide-react';
import { EntityType, entityLinkService } from '../../lib/db/entityLinks';
import Card from '../Card';

import { Link } from 'react-router-dom';

interface TimelineActivityProps {
  entityType: EntityType;
  entityId: string;
}

interface TimelineEvent {
  id: string;
  targetId: string;
  type: EntityType;
  title: string;
  timestamp: string;
  creator?: string;
}

export default function TimelineActivity({ entityType, entityId }: TimelineActivityProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimeline();
  }, [entityType, entityId]);

  const loadTimeline = async () => {
    try {
      setLoading(true);
      // To build a true timeline, we would normally fetch the system audit log.
      // Topologically, we can derive an organic timeline by grouping the created_at dates
      // of all bounded entities across the network array.
      const links = await entityLinkService.getLinkedEntities(entityType, entityId);
      
      const mappedEvents: TimelineEvent[] = links.slice(0, 15).map(link => {
         const isSource = link.source_id === entityId;
         const targetType = isSource ? link.target_type : link.source_type;
         const targetId = isSource ? link.target_id : link.source_id;
         
         return {
            id: link.id,
            targetId: targetId,
            type: targetType,
            title: `Context bound to ${targetType}`,
            timestamp: link.created_at,
            creator: 'System Matrix'
         };
      });

      // Sort chronological descending
      mappedEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setEvents(mappedEvents);

    } catch (err) {
      console.error('Failed to compile timeline telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  const getIcon = (type: EntityType) => {
    switch(type) {
        case 'task': return <CheckCircle2 className="w-4 h-4 text-amber-500" />;
        case 'document': return <FileText className="w-4 h-4 text-[#3B82F6]" />;
        case 'communication': return <Mail className="w-4 h-4 text-emerald-500" />;
        case 'workflow': return <GitMerge className="w-4 h-4 text-purple-500" />;
        default: return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <Card glass className="p-6">
      <div className="flex items-center space-x-2 text-white mb-6">
        <Activity className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-bold">Relational Vector Trace</h3>
      </div>
      
      {events.length === 0 ? (
        <p className="text-slate-400 text-sm italic">No topological events recorded yet.</p>
      ) : (
        <div className="relative pl-4 space-y-6 before:absolute before:inset-0 before:ml-[1.15rem] before:w-px before:bg-slate-700">
          {events.map((event, idx) => (
            <div key={event.id} className="relative flex items-start space-x-4">
              <div className="absolute -left-4 w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center translate-y-[-4px]">
                 {getIcon(event.type)}
              </div>
              <div className="flex-1 ml-4 pt-1">
                <div className="flex items-center justify-between">
                  <Link 
                    to={event.type === 'organization' ? `/app/clients/${event.targetId}` : `/app/${event.type}s/${event.targetId}`}
                    className="text-sm font-medium text-white hover:text-indigo-400 hover:underline transition-colors"
                  >
                    {event.title}
                  </Link>
                  <span className="text-xs text-slate-500">{new Date(event.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 capitalize">Vector connection forged internally.</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
