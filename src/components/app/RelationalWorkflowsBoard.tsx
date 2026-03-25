import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { workflowService } from '../../lib/db/workflows';
import type { WorkflowExecution } from '../../types/workflow';
import { EntityType } from '../../lib/db/entityLinks';
import { GitMerge, Play, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RelationalWorkflowsBoardProps {
  entityType: EntityType;
  entityId: string;
}

export default function RelationalWorkflowsBoard({ entityType, entityId }: RelationalWorkflowsBoardProps) {
  const { currentOrganization } = useAuth();
  const [executions, setExecutions] = useState<(WorkflowExecution & { workflow?: { name: string, category: string } })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExecutions();
  }, [entityType, entityId]);

  const loadExecutions = async () => {
    try {
      setLoading(true);
      const data = await workflowService.getExecutionsByEntity(entityType, entityId);
      setExecutions(data);
    } catch (err) {
      console.error('Failed to load entity workflow executions:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'running': return <Play className="w-4 h-4 text-blue-400" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
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
        <h3 className="text-lg font-semibold text-white">Process Instances</h3>
      </div>

      {executions.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center text-slate-400">
          No automated workflows have been triggered for this {entityType} yet.
        </div>
      ) : (
        <div className="space-y-3">
          {executions.map(exec => (
            <div key={exec.id} className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-xl flex items-center justify-between hover:border-indigo-500/30 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-slate-900 rounded-lg">
                  <GitMerge className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">
                    {exec.workflow?.name || 'Unknown Workflow'}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-slate-400 capitalize">{exec.workflow?.category || 'custom'}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-400">{new Date(exec.started_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                 <div className="flex items-center space-x-2 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-700">
                   {getStatusIcon(exec.status)}
                   <span className="text-sm text-slate-300 capitalize">{exec.status}</span>
                 </div>
                 <Link to={`/app/workflows/executions/${exec.id}`}>
                    <button className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                      View Trace
                    </button>
                 </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
