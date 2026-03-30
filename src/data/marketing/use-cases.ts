export interface UseCaseSEO {
  slug: string;
  title: string;
  description: string;
  h1: string;
  challenges: string[];
  solutions: string[];
}

export const useCasesData: Record<string, UseCaseSEO> = {
  'centralize-reporting': {
    slug: 'centralize-reporting',
    title: 'Centralize Business Reporting with AI Software',
    description: 'Stop manually aggregating spreadsheets. Use Bridgebox AI to automatically extract, normalize, and visualize your most critical data silos.',
    h1: 'Centralize Your Cross-Platform Business Reporting',
    challenges: [
      'Data isolated across 5+ different disconnected software tools',
      'Hours lost each week compiling executive summaries via Excel',
      'Human error causing discrepancies in final board reports'
    ],
    solutions: [
      'Bridgebox connectors pull real-time native data via API schedules',
      'AI models normalize formatting artifacts and resolve data type collisions natively',
      'Interactive executive dashboards serve live, accurate metrics seamlessly'
    ]
  },
  'automate-client-onboarding': {
    slug: 'automate-client-onboarding',
    title: 'Automate Client Onboarding Workflows',
    description: 'Transform manual client intake arrays into dynamic, AI-powered automation sequences that sync perfectly into your CRM and project management tools.',
    h1: 'Frictionless Client Onboarding Workflows',
    challenges: [
      'Back-and-forth email chains to collect intake documents',
      'Manual CRM profile creation leading to typos and duplicate records',
      'Drop-offs caused by overly complex, disjointed form tools'
    ],
    solutions: [
      'Conversational AI assistants dynamically capture client requirements via chat or form',
      'Automated backend pipelines instantly sync data to your CRM (HubSpot, Salesforce)',
      'Secure document request portals drastically reduce processing time'
    ]
  },
  'ai-custom-internal-tools': {
    slug: 'ai-custom-internal-tools',
    title: 'Build Custom Internal Software Tools with AI',
    description: 'Don\'t settle for inflexible off-the-shelf admin panels. Let Bridgebox generate precise, custom internal tools tailored to your exact operational logic.',
    h1: 'Custom Internal Tools Designed for Your Exact Operations',
    challenges: [
      'Generic SaaS platforms force businesses to adapt to rigid logic models',
      'Traditional engineering cycles take months and cost $100k+',
      'Connecting legacy databases to modern interfaces is highly fragile'
    ],
    solutions: [
      'Use screen-recording or voice prompts to dictate the exact software you need',
      'Bridgebox Generative AI constructs real TypeScript/React interfaces in minutes',
      'Natively connect to your existing SQL, Postgres, or API endpoints securely'
    ]
  }
};
