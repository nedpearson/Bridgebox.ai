import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Settings2 } from 'lucide-react';
import Button from '../Button';
import { whiteLabelService, CustomRole } from '../../lib/db/whiteLabel';

const AVAILABLE_MODULES = [
  { id: 'crm', label: 'CRM & Clients' },
  { id: 'projects', label: 'Projects & Workflows' },
  { id: 'billing', label: 'Billing & Invoices' },
  { id: 'settings', label: 'System Settings' },
  { id: 'support', label: 'Support & Tickets' },
];

interface EditRoleModalProps {
  role: CustomRole | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditRoleModal({ role, onClose, onSuccess }: EditRoleModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    display_name: '',
    description: '',
    permissions: {} as Record<string, { view?: boolean; update?: boolean; create?: boolean; delete?: boolean }>
  });

  useEffect(() => {
    if (role) {
      setFormData({
        display_name: role.display_name || '',
        description: role.description || '',
        permissions: role.permissions || {}
      });
    }
  }, [role]);

  const handleTogglePermission = (moduleId: string, action: 'view' | 'update' | 'create' | 'delete') => {
    setFormData(prev => {
      const modulePerms = prev.permissions[moduleId] || {};
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [moduleId]: {
            ...modulePerms,
            [action]: !modulePerms[action]
          }
        }
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    if (!formData.display_name.trim()) {
      setError('Role name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const roleName = formData.display_name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      
      await whiteLabelService.updateCustomRole(
        role.id,
        {
          name: roleName,
          display_name: formData.display_name,
          description: formData.description,
          permissions: formData.permissions
        }
      );
      
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  if (!role) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 flex-shrink-0">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-indigo-500" />
              Edit Role: {role.display_name}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex-shrink-0">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Role Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.display_name}
                  onChange={e => setFormData({ ...formData, display_name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 h-20 resize-none"
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-white mb-3">Permissions Matrix (Drilldown)</h3>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-800">
                      <th className="p-3 text-sm font-medium text-slate-300">Module</th>
                      <th className="p-3 text-sm flex-1 text-center font-medium text-slate-300">View</th>
                      <th className="p-3 text-sm flex-1 text-center font-medium text-slate-300">Edit</th>
                      <th className="p-3 text-sm flex-1 text-center font-medium text-slate-300">Create</th>
                      <th className="p-3 text-sm flex-1 text-center font-medium text-slate-300">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {AVAILABLE_MODULES.map(module => (
                      <tr key={module.id} className="hover:bg-slate-700/20">
                        <td className="p-3 text-sm text-white font-medium">{module.label}</td>
                        {['view', 'update', 'create', 'delete'].map(action => (
                          <td key={action} className="p-3 text-center">
                            <input 
                              type="checkbox"
                              checked={!!formData.permissions[module.id]?.[action as keyof typeof formData.permissions[string]]}
                              onChange={() => handleTogglePermission(module.id, action as any)}
                              className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-800 flex-shrink-0">
              <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Role Permissions'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
