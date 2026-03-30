export interface IndustrySEO {
  slug: string;
  title: string;
  description: string;
  h1: string;
  painPoints: string[];
  workflowAutomation: string[];
  metrics: string[];
}

export const industriesData: Record<string, IndustrySEO> = {
  legal: {
    slug: 'legal',
    title: 'AI Workflow Automation for Law Firms',
    description: 'Bridgebox AI streamlines legal intake, document generation, and compliance routing. Replace manual data entry with custom AI software for law firms.',
    h1: 'Automate Legal Intake and Matter Management with AI',
    painPoints: [
      'Hours lost on manual client intake forms',
      'Fragmented case data across disconnected tools',
      'Compliance risks from inconsistent document drafting'
    ],
    workflowAutomation: [
      'Automated new matter creation from voice recordings',
      'AI-driven contract analysis and metadata extraction',
      'Secure client portals mapped directly to your practice management software'
    ],
    metrics: ['Save 15+ hours per attorney monthly', 'Reduce intake errors by 98%']
  },
  logistics: {
    slug: 'logistics',
    title: 'Logistics AI Software & Operations Automation',
    description: 'Build custom operational dashboards and automate dispatch scheduling, inventory tracking, and supply chain reporting with Bridgebox AI.',
    h1: 'Unify Your Supply Chain with Custom AI Operations',
    painPoints: [
      'Blind spots between dispatch and warehouse systems',
      'Manual bill of lading reconciliation',
      'Inconsistent vendor communication chains'
    ],
    workflowAutomation: [
      'Real-time automated inventory mapping',
      'Voice-to-dispatch workflow generation',
      'Intelligent carrier routing based on historical metrics'
    ],
    metrics: ['Decrease processing latency by 60%', 'Unify 100% of vendor data']
  },
  finance: {
    slug: 'finance',
    title: 'Financial Services AI & Workflow Automation',
    description: 'Bridgebox provides secure AI automation for accounting firms, financial advisors, and banks. Automate reconciliation and client reporting natively.',
    h1: 'Securely Automate Financial Reconciliation and Reporting',
    painPoints: [
      'End-of-month reconciliation bottleneck',
      'Sensitive client data spanning non-compliant channels',
      'Manual PDF statement data extraction'
    ],
    workflowAutomation: [
      'AI-powered transaction categorization and anomaly detection',
      'Automated SOC2-compliant client statement generation',
      'Instant synchronization between CRM and accounting tools (QBO, Xero)'
    ],
    metrics: ['Automate 90% of manual data entry', 'Eliminate reconciliation lag']
  },
  accounting: {
    slug: 'accounting',
    title: 'Custom AI Software for Accounting Firms',
    description: 'Optimize your CPA firm with Bridgebox. Automate tax document collection, client onboarding, and secure financial workflow orchestration.',
    h1: 'Scale Your CPA Firm with Intelligent Workflow Automation',
    painPoints: [
      'Chasing clients for missing tax documents via email',
      'Manual cross-referencing of GL codes',
      'Capacity limits during peak tax season'
    ],
    workflowAutomation: [
      'Automated document request and reminder pipelines',
      'AI tax document parsing and data alignment',
      'Custom secure client portals for unified document exchange'
    ],
    metrics: ['Increase firm capacity by 35%', 'Save 20 hours per CPA weekly']
  },
  healthcare: {
    slug: 'healthcare',
    title: 'Healthcare AI Workflow Automation & Integration',
    description: 'Secure, HIPAA-compliant custom software and workflow automation for clinics and healthcare providers. Bridge disconnected patient systems.',
    h1: 'Bridge EMR Systems and Automate Patient Journeys',
    painPoints: [
      'Disconnected Electronic Medical Record (EMR) systems',
      'High administrative burden for clinical staff',
      'Manual appointment scheduling and follow-ups'
    ],
    workflowAutomation: [
      'Automated secure patient intake pipelines',
      'Cross-system EMR data synchronization',
      'AI-assisted clinical note transcription and structuring'
    ],
    metrics: ['Reduce administrative overhead by 40%', 'Eliminate double data entry']
  },
  construction: {
    slug: 'construction',
    title: 'Construction Management Software & AI Automation',
    description: 'Build custom tools for job site reporting, subcontractor management, and RFIs using Bridgebox AI. Stop relying on paper forms.',
    h1: 'Digitize and Automate Construction Workflows',
    painPoints: [
      'Lost paper field reports and daily logs',
      'Delayed RFI and submittal approvals',
      'Disconnect between the field and the back office'
    ],
    workflowAutomation: [
      'Voice-based daily field reporting converted to structured data',
      'Automated RFI routing to project managers',
      'Real-time equipment and materials tracking dashboards'
    ],
    metrics: ['Accelerate project reporting by 50%', 'Centralize 100% of job data']
  },
  real_estate: {
    slug: 'real-estate',
    title: 'Real Estate AI Software & Operations',
    description: 'Bridgebox helps brokerages and property managers automate leasing workflows, client CRM syncing, and transaction coordination with custom AI.',
    h1: 'Automate Real Estate Transactions and Property Management',
    painPoints: [
      'Scattered listing data across multiple MLS systems',
      'Manual tracking of lease renewals and maintenance requests',
      'Inefficient lead routing and follow-up'
    ],
    workflowAutomation: [
      'Automated MLS data ingestion and portfolio matching',
      'Intelligent maintenance ticket routing and vendor dispatch',
      'Custom transaction coordination dashboards'
    ],
    metrics: ['Close deals 20% faster', 'Automate 80% of routine client comms']
  }
};
