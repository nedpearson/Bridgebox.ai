import { PermissionContext, permissions } from './permissions';

export interface TenantContext {
  organizationId: string;
  userId: string;
  role: PermissionContext['role'];
}

export const securityHelpers = {
  enforceOrganizationAccess(
    context: PermissionContext,
    resourceOrganizationId: string
  ): void {
    if (permissions.isInternalStaff(context.role)) {
      return;
    }

    if (context.organizationId !== resourceOrganizationId) {
      throw new Error('Access denied: You do not have permission to access this resource');
    }
  },

  canAccessResource(
    context: PermissionContext,
    resourceOrganizationId: string
  ): boolean {
    if (permissions.isInternalStaff(context.role)) {
      return true;
    }

    return context.organizationId === resourceOrganizationId;
  },

  sanitizeForClient(data: any, context: PermissionContext): any {
    if (permissions.isInternalStaff(context.role)) {
      return data;
    }

    const sensitiveFields = ['internal_notes', 'cost', 'margin', 'commission'];

    if (Array.isArray(data)) {
      return data.map(item => this.removeSensitiveFields(item, sensitiveFields));
    }

    return this.removeSensitiveFields(data, sensitiveFields);
  },

  removeSensitiveFields(obj: any, fields: string[]): any {
    if (!obj || typeof obj !== 'object') return obj;

    const sanitized = { ...obj };
    fields.forEach(field => {
      delete sanitized[field];
    });

    return sanitized;
  },

  validateOwnership(
    context: PermissionContext,
    resourceOwnerId: string
  ): void {
    if (permissions.isInternalStaff(context.role)) {
      return;
    }

    if (context.userId !== resourceOwnerId) {
      throw new Error('Access denied: You can only access your own resources');
    }
  },

  getOrganizationFilter(context: PermissionContext): string | null {
    if (permissions.isInternalStaff(context.role)) {
      return null;
    }

    return context.organizationId || null;
  },

  assertOrganizationMembership(
    context: PermissionContext,
    organizationId: string
  ): void {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    if (permissions.isInternalStaff(context.role)) {
      return;
    }

    if (context.organizationId !== organizationId) {
      throw new Error('Access denied: You are not a member of this organization');
    }
  },

  logSecurityEvent(
    event: string,
    context: PermissionContext,
    details?: Record<string, any>
  ): void {
    console.warn('[SECURITY]', {
      event,
      userId: context.userId,
      organizationId: context.organizationId,
      role: context.role,
      timestamp: new Date().toISOString(),
      ...details,
    });
  },
};
