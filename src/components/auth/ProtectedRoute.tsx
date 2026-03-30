import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { permissions } from "../../lib/permissions";
import LoadingSpinner from "../LoadingSpinner";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireRole?:
    | "super_admin"
    | "internal_staff"
    | "client_admin"
    | "client_member";
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
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  // Phase 8: Global Forced Onboarding Guard
  // Redirect authenticated, orphaned users accessing /app/* securely into the AI setup wizard.
  if (
    requireAuth &&
    user &&
    profile &&
    !currentOrganization &&
    location.pathname.startsWith("/app")
  ) {
    return <Navigate to="/ai-onboarding" replace />;
  }

  // If we are no longer loading but still don't have a profile, the fetch failed or the profile is missing.
  // Instead of an infinite spinner, force a sign-out or show an error state so the user isn't stuck.
  if (requireAuth && user && !profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-red-500/30 p-8 rounded-xl max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-white mb-2">
            Profile Incomplete
          </h2>
          <p className="text-slate-400 mb-6">
            Your user profile could not be loaded. This may happen if your
            account creation was interrupted.
          </p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
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
