import { useState, useEffect } from 'react';
import { Download, ShieldCheck, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { auditService, AuditLog } from '../../lib/db/audit';
import Heading from '../../components/Heading';
import LoadingSpinner from '../../components/LoadingSpinner';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function AuditLogSettings() {
  const { currentOrganization } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentOrganization) {
      loadLogs();
    }
  }, [currentOrganization]);

  const loadLogs = async () => {
    if (!currentOrganization) return;
    try {
      setLoading(true);
      const { data } = await auditService.getOrgLogs(currentOrganization.id, 200, 0);
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!logs.length) return;
    
    const headers = ['Timestamp', 'Action', 'Resource Type', 'Resource ID', 'Actor Email', 'Actor Name'];
    const csvContent = [
      headers.join(','),
      ...logs.map(log => 
        [
          new Date(log.created_at).toISOString(),
          log.action_type,
          log.resource_type,
          log.resource_id || '',
          log.user_email || '',
          `"${log.user_name || ''}"`
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Heading
          title="Compliance & Audit Logs"
          subtitle="Immutable timeline of all critical mutations and access vectors within your tenant."
        />
        <div className="flex gap-3">
          <Button variant="ghost" className="text-slate-300">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button onClick={handleExportCSV} disabled={logs.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-700/50">
                <th className="p-4 text-sm font-medium text-slate-400">Timestamp</th>
                <th className="p-4 text-sm font-medium text-slate-400">Action</th>
                <th className="p-4 text-sm font-medium text-slate-400">Resource</th>
                <th className="p-4 text-sm font-medium text-slate-400">Actor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-sm text-slate-400 font-mono whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase
                      ${log.action_type === 'delete' ? 'bg-red-500/10 text-red-400' :
                        log.action_type === 'create' ? 'bg-emerald-500/10 text-emerald-400' :
                        log.action_type === 'login' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-slate-500/10 text-slate-400'}`}
                    >
                      {log.action_type}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-300">
                    <div className="flex flex-col">
                       <span className="font-medium">{log.resource_type}</span>
                       <span className="text-xs text-slate-500 font-mono">{log.resource_id || ''}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0">
                        {log.user_name?.charAt(0) || <ShieldCheck className="w-3 h-3 text-indigo-400" />}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-slate-300 truncate">{log.user_name || 'System Auto'}</span>
                        <span className="text-slate-500 text-xs truncate">{log.user_email || 'Native Routine'}</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400 border-none">
                    No audit records captured yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
