export interface IntegrationSEO {
  slug: string;
  title: string;
  description: string;
  h1: string;
  provider: string;
  features: string[];
}

export const integrationsData: Record<string, IntegrationSEO> = {
  'salesforce': {
    slug: 'salesforce',
    title: 'Salesforce AI Integration & Automation',
    description: 'Natively connect Bridgebox AI to Salesforce. Automate lead routing, object generation, and custom workflows cleanly over API.',
    h1: 'Enhance Salesforce with Bridgebox AI Automated Workflows',
    provider: 'Salesforce',
    features: [
      'Two-way sync of Accounts, Contacts, and Opportunities',
      'Automated custom object generation from unstructured voice/email models',
      'Unified dashboards mapping Salesforce pipelines alongside external production data'
    ]
  },
  'quickbooks-online': {
    slug: 'quickbooks-online',
    title: 'QuickBooks Online Direct Automation',
    description: 'Bridge Quickbooks Online natively using Bridgebox. Autonomously generate invoices, reconcile statements, and sync operational transactions.',
    h1: 'Automate Accounting Natively with QuickBooks Online',
    provider: 'QuickBooks',
    features: [
      'Automatic invoice creation from CRM triggers',
      'Statement reconciliation parsing across vendor PDF documents',
      'Instant synchronization of complex inventory adjustments'
    ]
  },
  'hubspot': {
    slug: 'hubspot',
    title: 'HubSpot Marketing & CRM Automation',
    description: 'Extend HubSpot limits. Build custom onboarding engines, automated client success workflows, and custom portals connected directly to your HubSpot data.',
    h1: 'Custom Portals and AI Tooling Powered by HubSpot',
    provider: 'HubSpot',
    features: [
      'Trigger custom multi-step onboarding journeys off HubSpot Deal Stages',
      'Automatically compile dynamic client-facing web portals utilizing HubSpot CRM data',
      'Intelligent routing of support tickets based on NLP sentiment analysis'
    ]
  }
};
