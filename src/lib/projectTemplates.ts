import { DeliveryPhase, MilestoneStatus } from './db/delivery';

export type ProjectTemplateType =
  | 'custom_software'
  | 'dashboard'
  | 'mobile_app'
  | 'ai_automation'
  | 'integration'
  | 'retainer';

export interface ProjectTemplate {
  type: ProjectTemplateType;
  name: string;
  description: string;
  defaultPhase: DeliveryPhase;
  suggestedMilestones: Array<{
    title: string;
    description: string;
    order_index: number;
  }>;
  defaultDeliverables: Array<{
    title: string;
    description: string;
    category: string;
  }>;
  onboardingQuestions: string[];
  estimatedDuration: string;
}

export const projectTemplates: Record<ProjectTemplateType, ProjectTemplate> = {
  custom_software: {
    type: 'custom_software',
    name: 'Custom Software Development',
    description: 'Full-stack custom software application',
    defaultPhase: 'discovery',
    estimatedDuration: '3-6 months',
    suggestedMilestones: [
      {
        title: 'Requirements & Discovery',
        description: 'Gather requirements, define scope, and create technical specifications',
        order_index: 1,
      },
      {
        title: 'Architecture & Design',
        description: 'Design system architecture, database schema, and UI/UX mockups',
        order_index: 2,
      },
      {
        title: 'MVP Development',
        description: 'Build core functionality and essential features',
        order_index: 3,
      },
      {
        title: 'Feature Completion',
        description: 'Implement remaining features and integrations',
        order_index: 4,
      },
      {
        title: 'Testing & QA',
        description: 'Comprehensive testing, bug fixes, and quality assurance',
        order_index: 5,
      },
      {
        title: 'Deployment & Launch',
        description: 'Production deployment, monitoring, and go-live',
        order_index: 6,
      },
    ],
    defaultDeliverables: [
      {
        title: 'Technical Specification Document',
        description: 'Detailed technical requirements and architecture',
        category: 'Documentation',
      },
      {
        title: 'UI/UX Design Files',
        description: 'Complete design system and mockups',
        category: 'Design',
      },
      {
        title: 'Source Code Repository',
        description: 'Access to version-controlled codebase',
        category: 'Development',
      },
      {
        title: 'API Documentation',
        description: 'Complete API reference and integration guides',
        category: 'Documentation',
      },
      {
        title: 'Production Application',
        description: 'Deployed and operational software',
        category: 'Deployment',
      },
    ],
    onboardingQuestions: [
      'What problem is this software solving?',
      'Who are the primary users?',
      'What are the must-have features for launch?',
      'What existing systems need integration?',
      'What are your security and compliance requirements?',
    ],
  },

  dashboard: {
    type: 'dashboard',
    name: 'Dashboard & Analytics',
    description: 'Custom data visualization and analytics dashboard',
    defaultPhase: 'planning',
    estimatedDuration: '2-4 months',
    suggestedMilestones: [
      {
        title: 'Data Discovery & Mapping',
        description: 'Identify data sources and define metrics',
        order_index: 1,
      },
      {
        title: 'Dashboard Design',
        description: 'Design visualizations and user interface',
        order_index: 2,
      },
      {
        title: 'Data Pipeline Setup',
        description: 'Build ETL pipelines and data connections',
        order_index: 3,
      },
      {
        title: 'Dashboard Development',
        description: 'Implement visualizations and interactive features',
        order_index: 4,
      },
      {
        title: 'Testing & Refinement',
        description: 'Validate data accuracy and user experience',
        order_index: 5,
      },
      {
        title: 'Launch & Training',
        description: 'Deploy dashboard and train users',
        order_index: 6,
      },
    ],
    defaultDeliverables: [
      {
        title: 'Metrics Definition Document',
        description: 'KPIs, calculations, and data sources',
        category: 'Documentation',
      },
      {
        title: 'Dashboard UI Design',
        description: 'Visual design of all dashboard views',
        category: 'Design',
      },
      {
        title: 'Live Dashboard Application',
        description: 'Deployed and functional dashboard',
        category: 'Deployment',
      },
      {
        title: 'User Training Materials',
        description: 'Guides and tutorials for dashboard users',
        category: 'Documentation',
      },
    ],
    onboardingQuestions: [
      'What key metrics do you need to track?',
      'Where is your data currently stored?',
      'Who will be using the dashboard?',
      'How often does data need to refresh?',
      'What existing BI tools are you using?',
    ],
  },

  mobile_app: {
    type: 'mobile_app',
    name: 'Mobile App Development',
    description: 'Native or cross-platform mobile application',
    defaultPhase: 'design',
    estimatedDuration: '3-5 months',
    suggestedMilestones: [
      {
        title: 'Product Definition',
        description: 'Define app features, flows, and requirements',
        order_index: 1,
      },
      {
        title: 'UI/UX Design',
        description: 'Create mobile-optimized designs and prototypes',
        order_index: 2,
      },
      {
        title: 'Core Feature Development',
        description: 'Build essential app functionality',
        order_index: 3,
      },
      {
        title: 'Backend Integration',
        description: 'Connect to APIs and backend services',
        order_index: 4,
      },
      {
        title: 'Testing & Beta',
        description: 'QA testing and beta user feedback',
        order_index: 5,
      },
      {
        title: 'App Store Launch',
        description: 'Submit to app stores and launch',
        order_index: 6,
      },
    ],
    defaultDeliverables: [
      {
        title: 'Mobile App Design',
        description: 'Complete UI/UX design for iOS and Android',
        category: 'Design',
      },
      {
        title: 'iOS Application',
        description: 'Native or cross-platform iOS app',
        category: 'Development',
      },
      {
        title: 'Android Application',
        description: 'Native or cross-platform Android app',
        category: 'Development',
      },
      {
        title: 'App Store Assets',
        description: 'Icons, screenshots, and store listings',
        category: 'Marketing',
      },
      {
        title: 'Backend API',
        description: 'Server infrastructure for the mobile app',
        category: 'Development',
      },
    ],
    onboardingQuestions: [
      'Which platforms do you need (iOS, Android, both)?',
      'What are the core features of your app?',
      'Do you need offline functionality?',
      'What third-party services will you integrate?',
      'What is your target launch date?',
    ],
  },

  ai_automation: {
    type: 'ai_automation',
    name: 'AI & Automation',
    description: 'AI-powered automation and intelligent workflows',
    defaultPhase: 'discovery',
    estimatedDuration: '2-4 months',
    suggestedMilestones: [
      {
        title: 'Process Analysis',
        description: 'Map current workflows and automation opportunities',
        order_index: 1,
      },
      {
        title: 'AI Model Selection',
        description: 'Choose or train appropriate AI models',
        order_index: 2,
      },
      {
        title: 'Integration Development',
        description: 'Build connections to existing systems',
        order_index: 3,
      },
      {
        title: 'Automation Implementation',
        description: 'Deploy automated workflows',
        order_index: 4,
      },
      {
        title: 'Testing & Optimization',
        description: 'Validate accuracy and optimize performance',
        order_index: 5,
      },
      {
        title: 'Production Deployment',
        description: 'Launch automation in production',
        order_index: 6,
      },
    ],
    defaultDeliverables: [
      {
        title: 'Process Automation Map',
        description: 'Documentation of automated workflows',
        category: 'Documentation',
      },
      {
        title: 'AI Model Configuration',
        description: 'Trained or configured AI models',
        category: 'Development',
      },
      {
        title: 'Automation Platform',
        description: 'Deployed automation system',
        category: 'Deployment',
      },
      {
        title: 'Performance Metrics Dashboard',
        description: 'Track automation efficiency and accuracy',
        category: 'Analytics',
      },
    ],
    onboardingQuestions: [
      'What processes do you want to automate?',
      'What data is available for AI training?',
      'What systems need to be integrated?',
      'What accuracy levels are required?',
      'What is the expected ROI timeline?',
    ],
  },

  integration: {
    type: 'integration',
    name: 'Enterprise Integration',
    description: 'Connect and synchronize business systems',
    defaultPhase: 'planning',
    estimatedDuration: '1-3 months',
    suggestedMilestones: [
      {
        title: 'Integration Mapping',
        description: 'Document systems, data flows, and requirements',
        order_index: 1,
      },
      {
        title: 'API Development',
        description: 'Build integration layer and APIs',
        order_index: 2,
      },
      {
        title: 'Data Synchronization',
        description: 'Implement data sync and transformation',
        order_index: 3,
      },
      {
        title: 'Testing & Validation',
        description: 'Verify data integrity and reliability',
        order_index: 4,
      },
      {
        title: 'Production Cutover',
        description: 'Go live with integrated systems',
        order_index: 5,
      },
    ],
    defaultDeliverables: [
      {
        title: 'Integration Architecture',
        description: 'System architecture and data flow diagrams',
        category: 'Documentation',
      },
      {
        title: 'API Endpoints',
        description: 'Custom APIs for system integration',
        category: 'Development',
      },
      {
        title: 'Monitoring Dashboard',
        description: 'Real-time integration health monitoring',
        category: 'Operations',
      },
      {
        title: 'Runbook Documentation',
        description: 'Operations guide for integration maintenance',
        category: 'Documentation',
      },
    ],
    onboardingQuestions: [
      'Which systems need to be integrated?',
      'What data needs to sync between systems?',
      'How often should data sync occur?',
      'What are the critical dependencies?',
      'What is your rollback strategy?',
    ],
  },

  retainer: {
    type: 'retainer',
    name: 'Support & Retainer',
    description: 'Ongoing support, maintenance, and enhancements',
    defaultPhase: 'support',
    estimatedDuration: 'Ongoing',
    suggestedMilestones: [
      {
        title: 'Onboarding & Setup',
        description: 'Establish communication and workflows',
        order_index: 1,
      },
      {
        title: 'Month 1 Deliverables',
        description: 'First month support and enhancements',
        order_index: 2,
      },
      {
        title: 'Month 2 Deliverables',
        description: 'Second month support and enhancements',
        order_index: 3,
      },
      {
        title: 'Month 3 Deliverables',
        description: 'Third month support and enhancements',
        order_index: 4,
      },
    ],
    defaultDeliverables: [
      {
        title: 'Monthly Status Report',
        description: 'Summary of work completed and hours used',
        category: 'Reporting',
      },
      {
        title: 'Bug Fixes & Maintenance',
        description: 'Ongoing technical support',
        category: 'Support',
      },
      {
        title: 'Feature Enhancements',
        description: 'Small improvements and new features',
        category: 'Development',
      },
    ],
    onboardingQuestions: [
      'What is the scope of ongoing support?',
      'How many hours per month are included?',
      'What is your preferred communication method?',
      'What are your typical enhancement priorities?',
      'What response times do you expect?',
    ],
  },
};

export function getProjectTemplate(type: ProjectTemplateType): ProjectTemplate | null {
  return projectTemplates[type] || null;
}

export function getTemplateTypes(): ProjectTemplateType[] {
  return Object.keys(projectTemplates) as ProjectTemplateType[];
}
