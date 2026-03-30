export interface FeatureSEO {
  slug: string;
  title: string;
  description: string;
  h1: string;
  subtitle: string;
  capabilities: string[];
}

export const featuresData: Record<string, FeatureSEO> = {
  'ai-workflow-automation': {
    slug: 'ai-workflow-automation',
    title: 'Enterprise AI Workflow Automation Software',
    description: 'Automate complex business operations with Bridgebox AI. Route documents, sync software pipelines, and eliminate manual processes instantly.',
    h1: 'Intelligent Enterprise Workflow Automation',
    subtitle: 'Deploy self-executing AI logic that bridges your disconnected data silos without writing code.',
    capabilities: [
      'Multi-step logical webhook routing',
      'Native Natural Language Processing (NLP) parameter extraction',
      'Automated error-handling and fallback queues'
    ]
  },
  'custom-software-orchestration': {
    slug: 'custom-software-orchestration',
    title: 'Custom Software & UI Generation Orchestration',
    description: 'Bridgebox AI orchestrates the full lifecycle of custom software generation. Turn voice memos directly into fully functional React dashboards.',
    h1: 'Generative Custom Software Orchestration',
    subtitle: 'Stop waiting on IT backlogs. Use AI to construct production-ready tools, UIs, and backend endpoints instantly.',
    capabilities: [
      'Voice-to-Build generative logic generation',
      'Deterministic state management mapping natively to Postgres schemas',
      'Secure Role-Based Access Control (RBAC) enforced natively'
    ]
  }
};
