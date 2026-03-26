import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MessageSquare, Clock, User } from 'lucide-react';
import RelationalCommandCenter from '../../components/app/RelationalCommandCenter';
import RelationalMetricsCard from '../../components/app/RelationalMetricsCard';
import NextBestActionPanel from '../../components/app/NextBestActionPanel';
import BlockersPanel from '../../components/app/BlockersPanel';
import TimelineActivity from '../../components/app/TimelineActivity';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import StatusBadge from '../../components/admin/StatusBadge';
import { globalCommunicationsService, GlobalCommunication } from '../../lib/db/globalCommunications';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function CommunicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comm, setComm] = useState<GlobalCommunication & { author?: any } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      globalCommunicationsService.getCommunicationById(id)
        .then(setComm)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  if (!comm) return <div className="p-8 text-center text-red-500">Communication Trace not found</div>;

  return (
    <>
      <AppHeader title={comm.subject || 'Communication Trace'} subtitle={`Log ID: ${comm.id.slice(0, 8)}`} />

      <RelationalCommandCenter entityType="communication" entityId={comm.id}>
        <div className="max-w-4xl mx-auto py-8">
          <Link to="/app/communications" className="flex items-center space-x-2 text-slate-400 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Communications</span>
          </Link>

          <Card glass className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                 <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
                    {comm.channel === 'email' && <Mail className="w-6 h-6" />}
                    {comm.channel === 'call' && <Phone className="w-6 h-6" />}
                    {comm.channel === 'message' && <MessageSquare className="w-6 h-6" />}
                 </div>
                 <h2 className="text-2xl font-bold text-white">{comm.subject || 'Untiled Note'}</h2>
              </div>
              <div className="flex space-x-3">
                <StatusBadge status={comm.channel} variant={'info'} />
                <StatusBadge status={comm.direction} variant={comm.direction === 'inbound' ? 'success' : 'warning'} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <BlockersPanel entityType="communication" entityId={comm.id} />
                <RelationalMetricsCard entityType="communication" entityId={comm.id} />
                <NextBestActionPanel entityType="communication" entityData={comm} />
                
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Content Payload</h3>
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <p className="text-slate-300 whitespace-pre-wrap">{comm.content}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Trace Data</h3>
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm flex items-center"><User className="w-4 h-4 mr-2"/>Author</span>
                      <span className="text-white text-sm">{comm.author?.full_name || 'System Generated'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm flex items-center"><Clock className="w-4 h-4 mr-2"/>Timestamp</span>
                      <span className="text-white text-sm">{new Date(comm.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <TimelineActivity entityType="communication" entityId={comm.id} />
              </div>
            </div>
          </Card>
        </div>
      </RelationalCommandCenter>
    </>
  );
}
