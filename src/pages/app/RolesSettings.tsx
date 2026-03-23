import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Plus, CreditCard as Edit3, Trash2 } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Heading from '../../components/Heading';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { whiteLabelService, CustomRole } from '../../lib/db/whiteLabel';
import { hasPermission } from '../../lib/permissions';

export default function RolesSettings() {
  const { user, currentOrganization, userRole } = useAuth();
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const canManage = userRole === 'super_admin';

  useEffect(() => {
    if (currentOrganization) {
      loadRoles();
    }
  }, [currentOrganization]);

  const loadRoles = async () => {
    if (!currentOrganization) return;

    try {
      setLoading(true);
      const data = await whiteLabelService.getCustomRoles(currentOrganization.id);
      setRoles(data);
    } catch (error) {
      console.error('Failed to load roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      await whiteLabelService.deleteCustomRole(roleId);
      await loadRoles();
    } catch (error) {
      console.error('Failed to delete role:', error);
      alert('Failed to delete role. Please try again.');
    }
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
          title="Custom Roles"
          subtitle="Define custom roles and permissions for your organization"
          icon={Shield}
        />
        {canManage && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Role
          </Button>
        )}
      </div>

      {!canManage && (
        <Card className="bg-amber-500/10 border-amber-500/20">
          <p className="text-sm text-amber-300">
            Only super administrators can manage custom roles. Contact your administrator.
          </p>
        </Card>
      )}

      {/* System Roles */}
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">System Roles</h3>
        <div className="space-y-3">
          <SystemRoleCard
            name="Super Admin"
            description="Full system access with all permissions"
            permissions={['All permissions']}
          />
          <SystemRoleCard
            name="Internal Staff"
            description="Access to internal tools and client management"
            permissions={['Manage leads', 'Manage projects', 'View analytics']}
          />
          <SystemRoleCard
            name="Client Admin"
            description="Manage client organization and members"
            permissions={['View projects', 'Manage team', 'View billing']}
          />
          <SystemRoleCard
            name="Client Member"
            description="Basic client portal access"
            permissions={['View projects', 'Submit tickets']}
          />
        </div>
      </Card>

      {/* Custom Roles */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Custom Roles</h3>
          <Badge color="slate">{roles.length} roles</Badge>
        </div>

        {roles.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 mb-1">No custom roles defined</p>
            <p className="text-sm text-slate-500">
              Create custom roles to define specific permissions for your team
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {roles.map((role) => (
              <CustomRoleCard
                key={role.id}
                role={role}
                onDelete={handleDelete}
                canManage={canManage}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Feature Scaffold Info */}
      <Card className="bg-blue-500/10 border-blue-500/20">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-300 mb-1">
              Custom Roles (Enterprise Feature)
            </h4>
            <p className="text-sm text-blue-200">
              Custom role creation and management is scaffolded for future implementation.
              Currently, system roles provide the core permission structure.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

interface SystemRoleCardProps {
  name: string;
  description: string;
  permissions: string[];
}

function SystemRoleCard({ name, description, permissions }: SystemRoleCardProps) {
  return (
    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="text-base font-medium text-white mb-1">{name}</h4>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
        <Badge color="slate" className="text-xs">
          System
        </Badge>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {permissions.map((permission, index) => (
          <span
            key={index}
            className="px-2 py-1 text-xs bg-slate-700/50 text-slate-300 rounded"
          >
            {permission}
          </span>
        ))}
      </div>
    </div>
  );
}

interface CustomRoleCardProps {
  role: CustomRole;
  onDelete: (id: string) => void;
  canManage: boolean;
}

function CustomRoleCard({ role, onDelete, canManage }: CustomRoleCardProps) {
  const permissionCount = Object.keys(role.permissions).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-base font-medium text-white">{role.display_name}</h4>
            <Badge color="blue" className="text-xs">
              Custom
            </Badge>
            {role.inherits_from && (
              <Badge color="slate" className="text-xs">
                Inherits: {role.inherits_from}
              </Badge>
            )}
          </div>
          {role.description && (
            <p className="text-sm text-slate-400">{role.description}</p>
          )}
        </div>

        {canManage && (
          <div className="flex gap-2">
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(role.id)}
              className="p-2 text-slate-400 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
        <span>{permissionCount} permissions</span>
        <span>•</span>
        <span>Created {new Date(role.created_at).toLocaleDateString()}</span>
      </div>
    </motion.div>
  );
}
