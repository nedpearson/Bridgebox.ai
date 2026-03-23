import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { permissions, PermissionContext } from '../../lib/permissions';
import LoadingSpinner from '../LoadingSpinner';
import UnauthorizedState from '../UnauthorizedState';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: Array<'super_admin' | 'internal_staff' | 'client_admin' | 'client_member'>;
  requireInternalStaff?: boolean;
  requireClientUser?: boolean;
  checkPermission?: (context: PermissionContext) => boolean;
  fallback?: ReactNode;
}

export default function RoleGuard({
  children,
  allowedRoles,
  requireInternalStaff = false,
  requireClientUser = false,
  checkPermission,
  fallback,
}: RoleGuardProps) {
  const { user, profile, loading, currentOrganization } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user || !profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const permissionContext: PermissionContext = {
    role: profile.role,
    organizationId: currentOrganization?.id,
    organizationType: currentOrganization?.organization_type,
    userId: user.id,
  };

  let hasAccess = true;

  if (allowedRoles && allowedRoles.length > 0) {
    hasAccess = allowedRoles.includes(profile.role);
  }

  if (requireInternalStaff) {
    hasAccess = hasAccess && permissions.isInternalStaff(profile.role);
  }

  if (requireClientUser) {
    hasAccess = hasAccess && permissions.isClientUser(profile.role);
  }

  if (checkPermission) {
    hasAccess = hasAccess && checkPermission(permissionContext);
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <UnauthorizedState />;
  }

  return <>{children}</>;
}
