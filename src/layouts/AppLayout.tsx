import { ReactNode } from 'react';
import AppSidebar from '../components/app/AppSidebar';
import EmptyOrganizationState from '../components/app/EmptyOrganizationState';
import FloatingAssistant from '../components/copilot/FloatingAssistant';
import IssueReporter from '../components/support/IssueReporter';
import { useAuth } from '../contexts/AuthContext';
import { MobileNavProvider } from '../contexts/MobileNavContext';
import LeadModal from '../components/LeadModal';
import { useLeadModal } from '../hooks/useLeadModal';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { organizations, currentOrganization } = useAuth();
  const { isOpen, formType, closeModal } = useLeadModal();

  if (organizations.length === 0) {
    return <EmptyOrganizationState />;
  }

  if (!currentOrganization) {
    return <EmptyOrganizationState />;
  }

  return (
    <MobileNavProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <AppSidebar />
        <div className="md:ml-64">
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
        </div>
        <FloatingAssistant />
        <IssueReporter />
        <LeadModal isOpen={isOpen} onClose={closeModal} formType={formType} />
      </div>
    </MobileNavProvider>
  );
}
