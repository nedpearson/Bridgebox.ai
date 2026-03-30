import { ReactNode } from "react";
import ClientPortalNav from "../components/client-portal/ClientPortalNav";
import BackgroundAtmosphere from "../components/BackgroundAtmosphere";
import EmptyOrganizationState from "../components/app/EmptyOrganizationState";
import IssueReporter from "../components/support/IssueReporter";
import { useAuth } from "../contexts/AuthContext";

interface ClientPortalLayoutProps {
  children: ReactNode;
}

export default function ClientPortalLayout({
  children,
}: ClientPortalLayoutProps) {
  const { organizations, currentOrganization } = useAuth();

  if (organizations.length === 0) {
    return <EmptyOrganizationState />;
  }

  if (!currentOrganization) {
    return <EmptyOrganizationState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative">
      <BackgroundAtmosphere />
      <ClientPortalNav />
      <div className="ml-64">
        <div className="min-h-screen">{children}</div>
      </div>
      <IssueReporter />
    </div>
  );
}
