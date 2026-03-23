import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { permissions } from '../../lib/permissions';
import LoadingSpinner from '../LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireRole?: 'super_admin' | 'internal_staff' | 'client_admin' | 'client_member';
  requireAdminAccess?: boolean;
  requireClientAccess?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requireRole,
  requireAdminAccess = false,
  requireClientAccess = false,
}: ProtectedRouteProps) {
  const { user, profile, loading, currentOrganization } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAuth && user && !profile) {
    return <LoadingSpinner fullScreen />;
  }

  if (profile) {
    const context = {
      role: profile.role,
      organizationId: currentOrganization?.id,
      organizationType: currentOrganization?.type,
    };

    if (requireRole && profile.role !== requireRole) {
      return <Navigate to={permissions.getDefaultRoute(context)} replace />;
    }

    if (requireAdminAccess && !permissions.canAccessAdminPanel(context)) {
      return <Navigate to={permissions.getDefaultRoute(context)} replace />;
    }

    if (requireClientAccess && !permissions.canAccessClientPortal(context)) {
      return <Navigate to={permissions.getDefaultRoute(context)} replace />;
    }
  }

  return <>{children}</>;
}
