export type UserRole = 'super_admin' | 'internal_staff' | 'client_admin' | 'client_member';

export interface PermissionContext {
  role: UserRole;
  organizationId?: string;
  organizationType?: 'internal' | 'client';
  userId?: string;
}

const isInternalStaff = (role: UserRole): boolean => {
  return role === 'super_admin' || role === 'internal_staff';
};

const isClientUser = (role: UserRole): boolean => {
  return role === 'client_admin' || role === 'client_member';
};

export const permissions = {
  isInternalStaff,
  isClientUser,

  canAccessAdminPanel(context: PermissionContext): boolean {
    return isInternalStaff(context.role);
  },

  canAccessClientPortal(context: PermissionContext): boolean {
    return isClientUser(context.role);
  },

  canManageLeads(context: PermissionContext): boolean {
    return isInternalStaff(context.role);
  },

  canManageProposals(context: PermissionContext): boolean {
    return isInternalStaff(context.role);
  },

  canManageClients(context: PermissionContext): boolean {
    return isInternalStaff(context.role);
  },

  canViewAllOrganizations(context: PermissionContext): boolean {
    return isInternalStaff(context.role);
  },

  canSwitchOrganization(context: PermissionContext): boolean {
    return isInternalStaff(context.role);
  },

  canManageOrganization(context: PermissionContext, targetOrgId?: string): boolean {
    if (isInternalStaff(context.role)) {
      return true;
    }
    if (!targetOrgId) return false;
    return context.role === 'client_admin' && context.organizationId === targetOrgId;
  },

  canViewProject(context: PermissionContext, projectOrgId: string): boolean {
    if (isInternalStaff(context.role)) {
      return true;
    }
    return context.organizationId === projectOrgId;
  },

  canEditProject(context: PermissionContext, projectOrgId: string): boolean {
    if (isInternalStaff(context.role)) {
      return true;
    }
    return context.role === 'client_admin' && context.organizationId === projectOrgId;
  },

  canDeleteProject(context: PermissionContext): boolean {
    return isInternalStaff(context.role);
  },

  canCreateSupportTicket(context: PermissionContext): boolean {
    return true;
  },

  canManageSupportTickets(context: PermissionContext): boolean {
    return isInternalStaff(context.role);
  },

  canResolveSupportTicket(context: PermissionContext): boolean {
    return isInternalStaff(context.role);
  },

  canViewBilling(context: PermissionContext, billingOrgId?: string): boolean {
    if (isInternalStaff(context.role)) {
      return true;
    }
    if (!billingOrgId) return false;
    return context.organizationId === billingOrgId;
  },

  canManageBilling(context: PermissionContext, billingOrgId?: string): boolean {
    if (context.role === 'super_admin') {
      return true;
    }
    if (!billingOrgId) return false;
    return context.role === 'client_admin' && context.organizationId === billingOrgId;
  },

  canViewIntegrations(context: PermissionContext, integrationOrgId?: string): boolean {
    if (isInternalStaff(context.role)) {
      return true;
    }
    if (!integrationOrgId) return false;
    return context.organizationId === integrationOrgId;
  },

  canManageIntegrations(context: PermissionContext, integrationOrgId?: string): boolean {
    if (isInternalStaff(context.role)) {
      return true;
    }
    if (!integrationOrgId) return false;
    return context.role === 'client_admin' && context.organizationId === integrationOrgId;
  },

  canManageUsers(context: PermissionContext, targetOrgId?: string): boolean {
    if (context.role === 'super_admin') {
      return true;
    }
    if (context.role === 'internal_staff' && context.organizationType === 'internal') {
      return true;
    }
    if (!targetOrgId) return false;
    return context.role === 'client_admin' && context.organizationId === targetOrgId;
  },

  canInviteUsers(context: PermissionContext): boolean {
    return context.role === 'super_admin' || context.role === 'client_admin';
  },

  canDeleteUsers(context: PermissionContext): boolean {
    return context.role === 'super_admin' || context.role === 'client_admin';
  },

  canViewDeliverables(context: PermissionContext, deliverableOrgId?: string): boolean {
    if (isInternalStaff(context.role)) {
      return true;
    }
    if (!deliverableOrgId) return true;
    return context.organizationId === deliverableOrgId;
  },

  canUploadDeliverables(context: PermissionContext): boolean {
    return isInternalStaff(context.role);
  },

  canAccessSettings(context: PermissionContext): boolean {
    return true;
  },

  canManageOrganizationSettings(context: PermissionContext, targetOrgId?: string): boolean {
    if (isInternalStaff(context.role)) {
      return true;
    }
    if (!targetOrgId) return false;
    return context.role === 'client_admin' && context.organizationId === targetOrgId;
  },

  getDefaultRoute(context: PermissionContext): string {
    if (isInternalStaff(context.role)) {
      return '/app';
    }
    if (isClientUser(context.role)) {
      return '/portal';
    }
    return '/';
  },

  getAccessibleRoutes(context: PermissionContext): string[] {
    if (isInternalStaff(context.role)) {
      return [
        '/app',
        '/app/executive',
        '/app/leads',
        '/app/pipeline',
        '/app/clients',
        '/app/projects',
        '/app/proposals',
        '/app/billing',
        '/app/delivery',
        '/app/implementation',
        '/app/support',
        '/app/analytics',
        '/app/conversions',
        '/app/integrations',
        '/app/team',
        '/app/settings',
      ];
    }
    if (isClientUser(context.role)) {
      return [
        '/portal',
        '/portal/projects',
        '/portal/deliverables',
        '/portal/billing',
        '/portal/support',
        '/portal/settings',
      ];
    }
    return ['/'];
  },

  canAccessRoute(context: PermissionContext, route: string): boolean {
    const accessibleRoutes = this.getAccessibleRoutes(context);
    return accessibleRoutes.some(r => route.startsWith(r));
  },
};

export const hasPermission = (
  role: UserRole | undefined,
  resource: string,
  action: 'view' | 'create' | 'update' | 'delete'
): boolean => {
  if (!role) return false;

  if (role === 'super_admin') return true;

  const resourceActions: Record<string, Record<string, UserRole[]>> = {
    settings: {
      view: ['super_admin', 'internal_staff', 'client_admin'],
      create: ['super_admin'],
      update: ['super_admin'],
      delete: ['super_admin'],
    },
    branding: {
      view: ['super_admin', 'internal_staff', 'client_admin', 'client_member'],
      create: ['super_admin'],
      update: ['super_admin'],
      delete: ['super_admin'],
    },
    features: {
      view: ['super_admin', 'internal_staff', 'client_admin'],
      create: ['super_admin'],
      update: ['super_admin'],
      delete: ['super_admin'],
    },
    roles: {
      view: ['super_admin', 'internal_staff'],
      create: ['super_admin'],
      update: ['super_admin'],
      delete: ['super_admin'],
    },
  };

  const allowedRoles = resourceActions[resource]?.[action];
  if (!allowedRoles) return false;

  return allowedRoles.includes(role);
};
