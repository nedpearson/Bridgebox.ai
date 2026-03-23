import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FinalCTA from '../components/FinalCTA';
import BackgroundAtmosphere from '../components/BackgroundAtmosphere';
import PageTransition from '../components/PageTransition';
import LeadModal from '../components/LeadModal';
import { useLeadModal } from '../hooks/useLeadModal';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const showFinalCTA = location.pathname !== '/' && location.pathname !== '/contact';
  const { isOpen, closeModal } = useLeadModal();

  return (
    <div className="min-h-screen bg-[#0B0F1A] relative overflow-hidden">
      <BackgroundAtmosphere />
      <Header />
      <PageTransition>
        <main>{children}</main>
      </PageTransition>
      {showFinalCTA && <FinalCTA />}
      <Footer />
      <LeadModal isOpen={isOpen} onClose={closeModal} formType="custom_build" />
    </div>
  );
}
