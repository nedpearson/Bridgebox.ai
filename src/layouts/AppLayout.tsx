import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import AppSidebar from '../components/app/AppSidebar';
import EmptyOrganizationState from '../components/app/EmptyOrganizationState';
import FloatingAssistant from '../components/copilot/FloatingAssistant';
import IssueReporter from '../components/support/IssueReporter';
import { useAuth } from '../contexts/AuthContext';
import { MobileNavProvider } from '../contexts/MobileNavContext';
import LeadModal from '../components/LeadModal';
import { useLeadModal } from '../hooks/useLeadModal';
import GlobalCommandPalette from '../components/intelligence/GlobalCommandPalette';
import SubNav from '../components/app/SubNav';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { organizations, currentOrganization } = useAuth();
  const { isOpen, formType, closeModal } = useLeadModal();
  const location = useLocation();

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
        <div className="md:ml-64 relative">
          <div className="min-h-screen flex flex-col">
            <SubNav />
            <motion.main
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex-1 flex flex-col w-full"
            >
              {children}
            </motion.main>
          </div>
        </div>
        <FloatingAssistant />
        <IssueReporter />
        <LeadModal isOpen={isOpen} onClose={closeModal} formType={formType} />
        <GlobalCommandPalette />
      </div>
    </MobileNavProvider>
  );
}
