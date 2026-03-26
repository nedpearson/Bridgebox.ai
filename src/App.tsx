import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
const Home = lazy(() => import('./pages/Home'));
const Platform = lazy(() => import('./pages/Platform'));
const Solutions = lazy(() => import('./pages/Solutions'));
const UseCases = lazy(() => import('./pages/UseCases'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Services = lazy(() => import('./pages/Services'));
const CustomSoftware = lazy(() => import('./pages/CustomSoftware'));
const Dashboards = lazy(() => import('./pages/Dashboards'));
const MobileApps = lazy(() => import('./pages/MobileApps'));
const CaseStudies = lazy(() => import('./pages/CaseStudies'));
const CaseStudyDetail = lazy(() => import('./pages/CaseStudyDetail'));
const Industries = lazy(() => import('./pages/Industries'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Start = lazy(() => import('./pages/Start'));
const Login = lazy(() => import('./pages/auth/Login'));
const Signup = lazy(() => import('./pages/auth/Signup'));
const SalesOnboarding = lazy(() => import('./pages/onboarding/SalesOnboarding'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const OrganizationOnboarding = lazy(() => import('./pages/auth/OrganizationOnboarding'));
const AdminPreview = lazy(() => import('./pages/AdminPreview'));
const DemoSandbox = lazy(() => import('./pages/demo/DemoSandbox'));
const AppOverview = lazy(() => import('./pages/app/AppOverview'));
const Pipeline = lazy(() => import('./pages/app/Pipeline'));
const LeadsList = lazy(() => import('./pages/app/LeadsList'));
const LeadDetail = lazy(() => import('./pages/app/LeadDetail'));
const ProposalsList = lazy(() => import('./pages/app/ProposalsList'));
const ProposalDetail = lazy(() => import('./pages/app/ProposalDetail'));
const ClientsList = lazy(() => import('./pages/app/ClientsList'));
const ClientDetail = lazy(() => import('./pages/app/ClientDetail'));
const ProjectsList = lazy(() => import('./pages/app/ProjectsList'));
const ProjectDetail = lazy(() => import('./pages/app/ProjectDetail'));
const BillingOverview = lazy(() => import('./pages/app/BillingOverview'));
const Integrations = lazy(() => import('./pages/app/Integrations'));
const Settings = lazy(() => import('./pages/app/Settings'));
const ClientHome = lazy(() => import('./pages/client-portal/ClientHome'));
const ClientProjects = lazy(() => import('./pages/client-portal/ClientProjects'));
const ClientDeliverables = lazy(() => import('./pages/client-portal/ClientDeliverables'));
const ClientSupport = lazy(() => import('./pages/client-portal/ClientSupport'));
const ClientBilling = lazy(() => import('./pages/client-portal/ClientBilling'));
const ClientSettings = lazy(() => import('./pages/client-portal/ClientSettings'));
const OnboardingFlow = lazy(() => import('./pages/onboarding/OnboardingFlow'));
const AcceptInvitation = lazy(() => import('./pages/auth/AcceptInvitation'));
const Team = lazy(() => import('./pages/app/Team'));
const ProposalForm = lazy(() => import('./pages/app/ProposalForm'));
const SupportQueue = lazy(() => import('./pages/app/SupportQueue'));
const SupportTicketDetail = lazy(() => import('./pages/app/SupportTicketDetail'));
const ClientSupportDetail = lazy(() => import('./pages/client-portal/ClientSupportDetail'));
const DeliveryOverview = lazy(() => import('./pages/app/DeliveryOverview'));
const ProjectDeliveryDetail = lazy(() => import('./pages/app/ProjectDeliveryDetail'));
const ConversionsDashboard = lazy(() => import('./pages/app/ConversionsDashboard'));
const ProposalView = lazy(() => import('./pages/ProposalView'));
const Analytics = lazy(() => import('./pages/app/Analytics'));
const ExecutiveCommandCenter = lazy(() => import('./pages/app/ExecutiveCommandCenter'));
const ImplementationCenter = lazy(() => import('./pages/app/ImplementationCenter'));
const ImplementationDetail = lazy(() => import('./pages/app/ImplementationDetail'));
const ClientSuccess = lazy(() => import('./pages/app/ClientSuccess'));
const ClientSuccessDetail = lazy(() => import('./pages/app/ClientSuccessDetail'));
const Automations = lazy(() => import('./pages/app/Automations'));
const AutomationForm = lazy(() => import('./pages/app/AutomationForm'));
const Knowledge = lazy(() => import('./pages/app/Knowledge'));
const KnowledgeDetail = lazy(() => import('./pages/app/KnowledgeDetail'));
const Copilot = lazy(() => import('./pages/app/Copilot'));
const DataActivity = lazy(() => import('./pages/app/DataActivity'));
const TrendsCenter = lazy(() => import('./pages/app/TrendsCenter'));
const MarketSignals = lazy(() => import('./pages/app/MarketSignals'));
const Opportunities = lazy(() => import('./pages/app/Opportunities'));
const AgentActions = lazy(() => import('./pages/app/AgentActions'));
const Workflows = lazy(() => import('./pages/app/Workflows').then(module => ({ default: module.Workflows })));
const WorkflowBuilder = lazy(() => import('./pages/app/WorkflowBuilder').then(module => ({ default: module.WorkflowBuilder })));
const WorkflowTemplates = lazy(() => import('./pages/app/WorkflowTemplates').then(module => ({ default: module.WorkflowTemplates })));
const WorkflowExecutions = lazy(() => import('./pages/app/WorkflowExecutions').then(module => ({ default: module.WorkflowExecutions })));
const Documents = lazy(() => import('./pages/app/Documents').then(module => ({ default: module.Documents })));
const DocumentDetail = lazy(() => import('./pages/app/DocumentDetail').then(module => ({ default: module.DocumentDetail })));
const GlobalTasksList = lazy(() => import('./pages/app/GlobalTasksList'));
const GlobalTaskDetail = lazy(() => import('./pages/app/GlobalTaskDetail'));
const CommunicationsList = lazy(() => import('./pages/app/CommunicationsList'));
const CommunicationDetail = lazy(() => import('./pages/app/CommunicationDetail'));
const MobileHome = lazy(() => import('./pages/mobile/MobileHome'));
const MobileTasks = lazy(() => import('./pages/mobile/MobileTasks'));
const MobileTaskDetail = lazy(() => import('./pages/mobile/MobileTaskDetail'));
const MobileProjects = lazy(() => import('./pages/mobile/MobileProjects'));
const MobileProjectDetail = lazy(() => import('./pages/mobile/MobileProjectDetail'));
const MobileUpload = lazy(() => import('./pages/mobile/MobileUpload'));
const BrandingSettings = lazy(() => import('./pages/app/BrandingSettings'));
const FeatureSettings = lazy(() => import('./pages/app/FeatureSettings'));
const RolesSettings = lazy(() => import('./pages/app/RolesSettings'));
const MobileAppStudio = lazy(() => import('./pages/app/MobileAppStudio'));
const AuditLogSettings = lazy(() => import('./pages/app/AuditLogSettings'));
const ExportHub = lazy(() => import('./pages/app/ExportHub'));
const TemplateCenter = lazy(() => import('./pages/app/TemplateCenter'));
const TemplateDetails = lazy(() => import('./pages/app/TemplateDetails'));
const AiTemplateWizard = lazy(() => import('./pages/app/AiTemplateWizard'));
const AiOnboardingWizard = lazy(() => import('./pages/onboarding/AiOnboardingWizard'));
const OnboardingCommandCenter = lazy(() => import('./pages/app/OnboardingCommandCenter'));
import OnboardingShell from './components/onboarding/layout/OnboardingShell';
const ClientIntakeWorkspace = lazy(() => import('./pages/onboarding/ClientIntakeWorkspace'));
const CompetitorAnalysisWorkspace = lazy(() => import('./pages/onboarding/CompetitorAnalysisWorkspace'));
const WorkflowCaptureWorkspace = lazy(() => import('./pages/onboarding/WorkflowCaptureWorkspace'));
const BlueprintReviewWorkspace = lazy(() => import('./pages/onboarding/BlueprintReviewWorkspace'));
const AdminCommandCenterLayout = lazy(() => import('./pages/onboarding/admin/AdminCommandCenterLayout'));
const AdminHubOverview = lazy(() => import('./pages/onboarding/admin/AdminHubOverview'));
const TaskPlanBoard = lazy(() => import('./pages/onboarding/admin/TaskPlanBoard'));
const PromptBuilderPanel = lazy(() => import('./pages/onboarding/admin/PromptBuilderPanel'));
const DashboardPreferenceBuilder = lazy(() => import('./pages/onboarding/admin/DashboardPreferenceBuilder'));
const IntegrationMapBuilder = lazy(() => import('./pages/onboarding/admin/IntegrationMapBuilder'));
const IntegrationIngestionLog = lazy(() => import('./pages/onboarding/admin/IntegrationIngestionLog'));
const FeatureIngestionCard = lazy(() => import('./pages/onboarding/admin/FeatureIngestionCard'));
const CommandCenterDashboard = lazy(() => import('./pages/internal/CommandCenterDashboard'));
import RecorderUI from './components/internal/RecorderUI';
import RecordingLibrary from './components/internal/RecordingLibrary';
const SupportDesk = lazy(() => import('./pages/internal/modules/SupportDesk'));
const AdminSupportTicketDetail = lazy(() => import('./pages/internal/modules/SupportTicketDetail'));
const SupportAnalytics = lazy(() => import('./pages/internal/modules/SupportAnalytics'));
const DevTasksWorkspace = lazy(() => import('./pages/internal/modules/DevTasksWorkspace'));
const DevTaskDetail = lazy(() => import('./pages/internal/modules/DevTaskDetail'));
const BugReportsWorkspace = lazy(() => import('./pages/internal/modules/BugReportsWorkspace'));
const BugReportDetail = lazy(() => import('./pages/internal/modules/BugReportDetail'));
const QaTestCasesWorkspace = lazy(() => import('./pages/internal/modules/QaTestCasesWorkspace'));
const QaTestCaseDetail = lazy(() => import('./pages/internal/modules/QaTestCaseDetail'));
import WebAccess from './components/internal/WebAccess';
const LogsViewer = lazy(() => import('./pages/internal/modules/LogsViewer'));
const JobsMonitor = lazy(() => import('./pages/internal/modules/JobsMonitor'));
const AiPipelineMonitor = lazy(() => import('./pages/internal/modules/AiPipelineMonitor'));
const ErrorConsole = lazy(() => import('./pages/internal/modules/ErrorConsole'));
const IntegrationHealth = lazy(() => import('./pages/internal/modules/IntegrationHealth'));
const ConfigInspector = lazy(() => import('./pages/internal/modules/ConfigInspector'));
const InternalNotes = lazy(() => import('./pages/internal/modules/InternalNotes'));
const SystemDiagnostics = lazy(() => import('./pages/internal/modules/SystemDiagnostics'));
const AuditTrail = lazy(() => import('./pages/internal/modules/AuditTrail'));
const AiKnowledgeBase = lazy(() => import('./pages/internal/modules/AiKnowledgeBase'));
const AiValidationSuite = lazy(() => import('./pages/internal/modules/AiValidationSuite'));
import LoadingSpinner from './components/LoadingSpinner';
const StackDiscoveryWizard = lazy(() => import('./pages/app/StackDiscoveryWizard'));
const AgentControlRoom = lazy(() => import('./pages/internal/modules/AgentControlRoom'));
const TemplateStudio = lazy(() => import('./pages/internal/modules/TemplateStudio'));
const PricingCommandCenter = lazy(() => import('./pages/admin/PricingCommandCenter'));
const PricingPresentation = lazy(() => import('./pages/onboarding/PricingPresentation'));

// Super Admin Layouts & Components
import SuperAdminLayout from './layouts/SuperAdminLayout';
const SuperAdminOverview = lazy(() => import('./pages/admin/SuperAdminOverview'));
const TenantManagement = lazy(() => import('./pages/admin/TenantManagement'));
const TenantDetail = lazy(() => import('./pages/admin/TenantDetail'));
const MonetizationHub = lazy(() => import('./pages/admin/MonetizationHub'));
const EcosystemHub = lazy(() => import('./pages/admin/EcosystemHub'));
const AIUsageDashboard = lazy(() => import('./pages/admin/AIUsageDashboard'));

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
          <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-950"><LoadingSpinner /></div>}>
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<ResetPassword />} />
          <Route path="/onboarding" element={<ProtectedRoute><OrganizationOnboarding /></ProtectedRoute>} />
          <Route path="/setup" element={<ProtectedRoute><OnboardingFlow /></ProtectedRoute>} />
          <Route path="/ai-onboarding" element={<ProtectedRoute><AiOnboardingWizard /></ProtectedRoute>} />
          <Route path="/invitations/accept" element={<AcceptInvitation />} />
          <Route path="/admin-preview" element={<AdminPreview />} />
          <Route path="/proposal/:token" element={<ProposalView />} />
          
          <Route
            path="/app/onboarding/:sessionId"
            element={
              <ProtectedRoute>
                <RoleGuard requireInternalStaff>
                   <OnboardingShell />
                </RoleGuard>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="intake" replace />} />
            <Route path="intake" element={<ClientIntakeWorkspace />} />
            <Route path="analysis" element={<CompetitorAnalysisWorkspace />} />
            <Route path="voice-capture" element={<WorkflowCaptureWorkspace />} />
            <Route path="review" element={<BlueprintReviewWorkspace />} />
            <Route path="admin/*" element={<AdminCommandCenterLayout />}>
                 <Route index element={<AdminHubOverview />} />
                 <Route path="tasks" element={<TaskPlanBoard />} />
                 <Route path="integrations" element={<IntegrationMapBuilder />} />
                 <Route path="webhooks" element={<IntegrationIngestionLog />} />
                 <Route path="dashboards" element={<DashboardPreferenceBuilder />} />
                 <Route path="features" element={<FeatureIngestionCard />} />
                 <Route path="prompts" element={<PromptBuilderPanel />} />
                 <Route path="progress" element={<div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-white">Progress Tracker Roadmap (Phase 13)</div>} />
            </Route>
          </Route>

          <Route
            path="/app/*"
            element={
              <ProtectedRoute>
                <RoleGuard requireInternalStaff>
                  <AppLayout>
                    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-950"><LoadingSpinner /></div>}>
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
                      <Route path="/templates" element={<TemplateCenter />} />
                      <Route path="/templates/ai-wizard" element={<AiTemplateWizard />} />
                      <Route path="/templates/:id" element={<TemplateDetails />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/settings/branding" element={<BrandingSettings />} />
                      <Route path="/settings/features" element={<FeatureSettings />} />
                      <Route path="/settings/roles" element={<RolesSettings />} />
                      <Route path="/settings/studio" element={<MobileAppStudio />} />
                      <Route path="/settings/audit" element={<AuditLogSettings />} />
                      <Route path="/settings/export" element={<ExportHub />} />
                      <Route path="/stack-discovery" element={<StackDiscoveryWizard />} />
                      <Route path="/onboarding-command" element={<OnboardingCommandCenter />} />
                      <Route path="/mobile" element={<MobileHome />} />
                      <Route path="/mobile/tasks" element={<MobileTasks />} />
                      <Route path="/mobile/tasks/:id" element={<MobileTaskDetail />} />
                      <Route path="/mobile/projects" element={<MobileProjects />} />
                      <Route path="/mobile/projects/:id" element={<MobileProjectDetail />} />
                      <Route path="/mobile/upload" element={<MobileUpload />} />
                    </Routes>
          </Suspense>
                  </AppLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['super_admin']}>
                  <SuperAdminLayout>
                    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-950"><LoadingSpinner /></div>}>
                      <Routes>
                        <Route path="/" element={<Navigate to="overview" replace />} />
                        <Route path="/overview" element={<SuperAdminOverview />} />
                        <Route path="/tenants" element={<TenantManagement />} />
                        <Route path="/tenants/:id" element={<TenantDetail />} />
                        <Route path="/monetization" element={<MonetizationHub />} />
                        <Route path="/ecosystem" element={<EcosystemHub />} />
                        <Route path="/ai-usage" element={<AIUsageDashboard />} />
                      </Routes>
                    </Suspense>
                  </SuperAdminLayout>
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
                    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-950"><LoadingSpinner /></div>}>
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
                      <Route path="/recording-center/agents" element={<AgentControlRoom />} />
                       <Route path="/recording-center/pricing" element={<PricingCommandCenter />} />
                    </Routes>
          </Suspense>
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
                    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-950"><LoadingSpinner /></div>}>
          <Routes>
                      <Route path="/" element={<ClientHome />} />
                      <Route path="/projects" element={<ClientProjects />} />
                      <Route path="/deliverables" element={<ClientDeliverables />} />
                      <Route path="/support" element={<ClientSupport />} />
                      <Route path="/support/:id" element={<ClientSupportDetail />} />
                      <Route path="/billing" element={<ClientBilling />} />
                      <Route path="/settings" element={<ClientSettings />} />
                    </Routes>
          </Suspense>
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
                <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-950"><LoadingSpinner /></div>}>
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
                  <Route path="/sales-onboarding" element={<SalesOnboarding />} />
                  <Route path="/start" element={<Start />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/contact" element={<Contact />} />
                </Routes>
          </Suspense>
              </MainLayout>
            }
          />
          )}

        </Routes>
          </Suspense>
        {!isCustomDomain && <VoiceCommandFAB />}
        </CopilotProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
