import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CopilotProvider } from './contexts/CopilotContext';
import { useCustomDomain } from './hooks/useCustomDomain';
import VoiceCommandFAB from './components/app/VoiceCommandFAB';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleGuard from './components/auth/RoleGuard';
import MainLayout from './layouts/MainLayout';
import AppLayout from './layouts/AppLayout';
import ClientPortalLayout from './layouts/ClientPortalLayout';
import RecordingCenterLayout from './layouts/RecordingCenterLayout';
import Home from './pages/Home';
import Platform from './pages/Platform';
import Solutions from './pages/Solutions';
import UseCases from './pages/UseCases';
import About from './pages/About';
import Contact from './pages/Contact';
import Pricing from './pages/Pricing';
import Services from './pages/Services';
import CustomSoftware from './pages/CustomSoftware';
import Dashboards from './pages/Dashboards';
import MobileApps from './pages/MobileApps';
import CaseStudies from './pages/CaseStudies';
import CaseStudyDetail from './pages/CaseStudyDetail';
import Industries from './pages/Industries';
import FAQ from './pages/FAQ';
import Start from './pages/Start';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import OrganizationOnboarding from './pages/auth/OrganizationOnboarding';
import AdminPreview from './pages/AdminPreview';
import AppOverview from './pages/app/AppOverview';
import Pipeline from './pages/app/Pipeline';
import LeadsList from './pages/app/LeadsList';
import LeadDetail from './pages/app/LeadDetail';
import ProposalsList from './pages/app/ProposalsList';
import ProposalDetail from './pages/app/ProposalDetail';
import ClientsList from './pages/app/ClientsList';
import ClientDetail from './pages/app/ClientDetail';
import ProjectsList from './pages/app/ProjectsList';
import ProjectDetail from './pages/app/ProjectDetail';
import BillingOverview from './pages/app/BillingOverview';
import Integrations from './pages/app/Integrations';
import Settings from './pages/app/Settings';
import ClientHome from './pages/client-portal/ClientHome';
import ClientProjects from './pages/client-portal/ClientProjects';
import ClientDeliverables from './pages/client-portal/ClientDeliverables';
import ClientSupport from './pages/client-portal/ClientSupport';
import ClientBilling from './pages/client-portal/ClientBilling';
import ClientSettings from './pages/client-portal/ClientSettings';
import OnboardingFlow from './pages/onboarding/OnboardingFlow';
import AcceptInvitation from './pages/auth/AcceptInvitation';
import Team from './pages/app/Team';
import ProposalForm from './pages/app/ProposalForm';
import SupportQueue from './pages/app/SupportQueue';
import SupportTicketDetail from './pages/app/SupportTicketDetail';
import ClientSupportDetail from './pages/client-portal/ClientSupportDetail';
import DeliveryOverview from './pages/app/DeliveryOverview';
import ProjectDeliveryDetail from './pages/app/ProjectDeliveryDetail';
import ConversionsDashboard from './pages/app/ConversionsDashboard';
import ProposalView from './pages/ProposalView';
import Analytics from './pages/app/Analytics';
import ExecutiveCommandCenter from './pages/app/ExecutiveCommandCenter';
import ImplementationCenter from './pages/app/ImplementationCenter';
import ImplementationDetail from './pages/app/ImplementationDetail';
import ClientSuccess from './pages/app/ClientSuccess';
import ClientSuccessDetail from './pages/app/ClientSuccessDetail';
import Automations from './pages/app/Automations';
import AutomationForm from './pages/app/AutomationForm';
import Knowledge from './pages/app/Knowledge';
import KnowledgeDetail from './pages/app/KnowledgeDetail';
import Copilot from './pages/app/Copilot';
import DataActivity from './pages/app/DataActivity';
import TrendsCenter from './pages/app/TrendsCenter';
import MarketSignals from './pages/app/MarketSignals';
import Opportunities from './pages/app/Opportunities';
import AgentActions from './pages/app/AgentActions';
import { Workflows } from './pages/app/Workflows';
import { WorkflowBuilder } from './pages/app/WorkflowBuilder';
import { WorkflowTemplates } from './pages/app/WorkflowTemplates';
import { WorkflowExecutions } from './pages/app/WorkflowExecutions';
import { Documents } from './pages/app/Documents';
import { DocumentDetail } from './pages/app/DocumentDetail';
import GlobalTasksList from './pages/app/GlobalTasksList';
import GlobalTaskDetail from './pages/app/GlobalTaskDetail';
import CommunicationsList from './pages/app/CommunicationsList';
import CommunicationDetail from './pages/app/CommunicationDetail';
import MobileHome from './pages/mobile/MobileHome';
import MobileTasks from './pages/mobile/MobileTasks';
import MobileTaskDetail from './pages/mobile/MobileTaskDetail';
import MobileProjects from './pages/mobile/MobileProjects';
import MobileProjectDetail from './pages/mobile/MobileProjectDetail';
import MobileUpload from './pages/mobile/MobileUpload';
import BrandingSettings from './pages/app/BrandingSettings';
import FeatureSettings from './pages/app/FeatureSettings';
import RolesSettings from './pages/app/RolesSettings';
import MobileAppStudio from './pages/app/MobileAppStudio';
import AuditLogSettings from './pages/app/AuditLogSettings';
import ExportHub from './pages/app/ExportHub';
import CommandCenterDashboard from './pages/internal/CommandCenterDashboard';
import RecorderUI from './components/internal/RecorderUI';
import RecordingLibrary from './components/internal/RecordingLibrary';
import SupportDesk from './pages/internal/modules/SupportDesk';
import AdminSupportTicketDetail from './pages/internal/modules/SupportTicketDetail';
import SupportAnalytics from './pages/internal/modules/SupportAnalytics';
import DevTasksWorkspace from './pages/internal/modules/DevTasksWorkspace';
import DevTaskDetail from './pages/internal/modules/DevTaskDetail';
import BugReportsWorkspace from './pages/internal/modules/BugReportsWorkspace';
import BugReportDetail from './pages/internal/modules/BugReportDetail';
import QaTestCasesWorkspace from './pages/internal/modules/QaTestCasesWorkspace';
import QaTestCaseDetail from './pages/internal/modules/QaTestCaseDetail';
import WebAccess from './components/internal/WebAccess';
import LogsViewer from './pages/internal/modules/LogsViewer';
import JobsMonitor from './pages/internal/modules/JobsMonitor';
import AiPipelineMonitor from './pages/internal/modules/AiPipelineMonitor';
import ErrorConsole from './pages/internal/modules/ErrorConsole';
import IntegrationHealth from './pages/internal/modules/IntegrationHealth';
import ConfigInspector from './pages/internal/modules/ConfigInspector';
import InternalNotes from './pages/internal/modules/InternalNotes';
import SystemDiagnostics from './pages/internal/modules/SystemDiagnostics';
import AuditTrail from './pages/internal/modules/AuditTrail';
import AiKnowledgeBase from './pages/internal/modules/AiKnowledgeBase';
import AiValidationSuite from './pages/internal/modules/AiValidationSuite';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { isCustomDomain, loading: domainLoading } = useCustomDomain();

  if (domainLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Router>
      <AuthProvider>
        <CopilotProvider>
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/onboarding" element={<ProtectedRoute><OrganizationOnboarding /></ProtectedRoute>} />
          <Route path="/setup" element={<ProtectedRoute><OnboardingFlow /></ProtectedRoute>} />
          <Route path="/invitations/accept" element={<AcceptInvitation />} />
          <Route path="/admin-preview" element={<AdminPreview />} />
          <Route path="/proposal/:token" element={<ProposalView />} />
          <Route
            path="/app/*"
            element={
              <ProtectedRoute>
                <RoleGuard requireInternalStaff>
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<AppOverview />} />
                      <Route path="/executive" element={<ExecutiveCommandCenter />} />
                      <Route path="/pipeline" element={<Pipeline />} />
                      <Route path="/leads" element={<LeadsList />} />
                      <Route path="/leads/:id" element={<LeadDetail />} />
                      <Route path="/proposals" element={<ProposalsList />} />
                      <Route path="/proposals/new" element={<ProposalForm />} />
                      <Route path="/proposals/:id" element={<ProposalDetail />} />
                      <Route path="/clients" element={<ClientsList />} />
                      <Route path="/clients/:id" element={<ClientDetail />} />
                      <Route path="/projects" element={<ProjectsList />} />
                      <Route path="/projects/:id" element={<ProjectDetail />} />
                      <Route path="/billing" element={<BillingOverview />} />
                      <Route path="/integrations" element={<Integrations />} />
                      <Route path="/delivery" element={<DeliveryOverview />} />
                      <Route path="/delivery/:projectId" element={<ProjectDeliveryDetail />} />
                      <Route path="/implementation" element={<ImplementationCenter />} />
                      <Route path="/implementation/:projectId" element={<ImplementationDetail />} />
                      <Route path="/client-success" element={<ClientSuccess />} />
                      <Route path="/client-success/:clientId" element={<ClientSuccessDetail />} />
                      <Route path="/automations" element={<Automations />} />
                      <Route path="/automations/new" element={<AutomationForm />} />
                      <Route path="/workflows" element={<Workflows />} />
                      <Route path="/workflows/new" element={<WorkflowBuilder />} />
                      <Route path="/workflows/templates" element={<WorkflowTemplates />} />
                      <Route path="/workflows/:id" element={<WorkflowBuilder />} />
                      <Route path="/workflows/:id/executions" element={<WorkflowExecutions />} />
                      <Route path="/documents" element={<Documents />} />
                      <Route path="/documents/:id" element={<DocumentDetail />} />
                      <Route path="/tasks" element={<GlobalTasksList />} />
                      <Route path="/tasks/:id" element={<GlobalTaskDetail />} />
                      <Route path="/communications" element={<CommunicationsList />} />
                      <Route path="/communications/:id" element={<CommunicationDetail />} />
                      <Route path="/knowledge" element={<Knowledge />} />
                      <Route path="/knowledge/:docId" element={<KnowledgeDetail />} />
                      <Route path="/copilot" element={<Copilot />} />
                      <Route path="/support" element={<SupportQueue />} />
                      <Route path="/support/:id" element={<SupportTicketDetail />} />
                      <Route path="/team" element={<Team />} />
                      <Route path="/conversions" element={<ConversionsDashboard />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/trends" element={<TrendsCenter />} />
                      <Route path="/market-signals" element={<MarketSignals />} />
                      <Route path="/opportunities" element={<Opportunities />} />
                      <Route path="/agent-actions" element={<AgentActions />} />
                      <Route path="/data-activity" element={<DataActivity />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/settings/branding" element={<BrandingSettings />} />
                      <Route path="/settings/features" element={<FeatureSettings />} />
                      <Route path="/settings/roles" element={<RolesSettings />} />
                      <Route path="/settings/studio" element={<MobileAppStudio />} />
                      <Route path="/settings/audit" element={<AuditLogSettings />} />
                      <Route path="/settings/export" element={<ExportHub />} />
                      <Route path="/mobile" element={<MobileHome />} />
                      <Route path="/mobile/tasks" element={<MobileTasks />} />
                      <Route path="/mobile/tasks/:id" element={<MobileTaskDetail />} />
                      <Route path="/mobile/projects" element={<MobileProjects />} />
                      <Route path="/mobile/projects/:id" element={<MobileProjectDetail />} />
                      <Route path="/mobile/upload" element={<MobileUpload />} />
                    </Routes>
                  </AppLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/internal/*"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['super_admin']}>
                  <RecordingCenterLayout>
                    <Routes>
                      <Route path="/recording-center" element={<CommandCenterDashboard />} />
                      <Route path="/recording-center/capture" element={<RecorderUI />} />
                      <Route path="/recording-center/library" element={<RecordingLibrary />} />
                      <Route path="/recording-center/support" element={<SupportDesk />} />
                      <Route path="/recording-center/support/:id" element={<AdminSupportTicketDetail />} />
                      <Route path="/recording-center/support-analytics" element={<SupportAnalytics />} />
                      <Route path="/recording-center/dev-tasks" element={<DevTasksWorkspace />} />
                      <Route path="/recording-center/dev-tasks/:id" element={<DevTaskDetail />} />
                      <Route path="/recording-center/bug-reports" element={<BugReportsWorkspace />} />
                      <Route path="/recording-center/bug-reports/:id" element={<BugReportDetail />} />
                      <Route path="/recording-center/qa-test-cases" element={<QaTestCasesWorkspace />} />
                      <Route path="/recording-center/qa-test-cases/:id" element={<QaTestCaseDetail />} />
                      <Route path="/recording-center/web" element={<WebAccess />} />
                      <Route path="/recording-center/logs" element={<LogsViewer />} />
                      <Route path="/recording-center/jobs" element={<JobsMonitor />} />
                      <Route path="/recording-center/ai-pipeline" element={<AiPipelineMonitor />} />
                      <Route path="/recording-center/ai-knowledge" element={<AiKnowledgeBase />} />
                      <Route path="/recording-center/ai-validation" element={<AiValidationSuite />} />
                      <Route path="/recording-center/errors" element={<ErrorConsole />} />
                      <Route path="/recording-center/integrations" element={<IntegrationHealth />} />
                      <Route path="/recording-center/notes" element={<InternalNotes />} />
                      <Route path="/recording-center/config" element={<ConfigInspector />} />
                      <Route path="/recording-center/diagnostics" element={<SystemDiagnostics />} />
                      <Route path="/recording-center/audit" element={<AuditTrail />} />
                    </Routes>
                  </RecordingCenterLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/*"
            element={
              <ProtectedRoute>
                <RoleGuard requireClientUser>
                  <ClientPortalLayout>
                    <Routes>
                      <Route path="/" element={<ClientHome />} />
                      <Route path="/projects" element={<ClientProjects />} />
                      <Route path="/deliverables" element={<ClientDeliverables />} />
                      <Route path="/support" element={<ClientSupport />} />
                      <Route path="/support/:id" element={<ClientSupportDetail />} />
                      <Route path="/billing" element={<ClientBilling />} />
                      <Route path="/settings" element={<ClientSettings />} />
                    </Routes>
                  </ClientPortalLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          
          {/* If accessed via Custom Domain, aggressively fallback unauthorized requests strictly to the Client Portal login wrapper */}
          {isCustomDomain && (
            <Route path="*" element={<Login />} />
          )}

          {!isCustomDomain && (
            <Route
              path="*"
              element={
                <MainLayout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/platform" element={<Platform />} />
                  <Route path="/solutions" element={<Solutions />} />
                  <Route path="/use-cases" element={<UseCases />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/custom-software" element={<CustomSoftware />} />
                  <Route path="/dashboards" element={<Dashboards />} />
                  <Route path="/mobile-apps" element={<MobileApps />} />
                  <Route path="/case-studies" element={<CaseStudies />} />
                  <Route path="/case-studies/:slug" element={<CaseStudyDetail />} />
                  <Route path="/industries" element={<Industries />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/start" element={<Start />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/contact" element={<Contact />} />
                </Routes>
              </MainLayout>
            }
          />
          )}

        </Routes>
        {!isCustomDomain && <VoiceCommandFAB />}
        </CopilotProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
