import { Industry } from '../types';

export const industries: Industry[] = [
  {
    id: 'logistics',
    name: 'Logistics & Transportation',
    slug: 'logistics-transportation',
    tagline: 'Real-time visibility across complex supply chains',
    challenge:
      'Logistics operations struggle with fragmented carrier systems, delayed tracking updates, manual coordination across warehouses, and disconnected tools that prevent operational visibility. Multiple data sources create information silos that lead to reactive decision-making and customer service challenges.',
    solution:
      'Bridgebox builds unified logistics platforms that consolidate real-time data from all carrier APIs, warehouse systems, and internal operations. Custom dashboards provide instant visibility, automated workflows eliminate manual coordination, and predictive analytics enable proactive issue resolution before customer impact.',
    benefits: [
      'Real-time shipment tracking across all carriers and systems',
      'Automated exception handling and proactive delay alerts',
      'Executive dashboards with performance analytics',
      'Reduced manual data entry and coordination time',
      'Improved on-time performance and customer satisfaction',
    ],
    keyCapabilities: [
      'Multi-carrier API integration',
      'Real-time operations dashboards',
      'Predictive delay analytics',
      'Mobile apps for field teams',
      'Automated customer communication',
      'Route optimization algorithms',
    ],
    caseStudySlugs: ['unified-logistics-operations'],
    iconColor: '#F59E0B',
  },
  {
    id: 'finance',
    name: 'Finance & Accounting',
    slug: 'finance-accounting',
    tagline: 'Intelligent automation for financial operations',
    challenge:
      'Finance teams spend excessive time on manual transaction processing, data validation, compliance checking, and report consolidation. Week-old data prevents timely strategic decisions, and manual workflows increase error risk while limiting team capacity for strategic analysis.',
    solution:
      'Bridgebox engineers financial automation platforms with AI-powered validation, automated compliance checking, and real-time executive dashboards. Systems integrate seamlessly with existing accounting software and banking APIs while maintaining strict security and comprehensive audit trails.',
    benefits: [
      'AI-powered transaction validation and anomaly detection',
      'Automated compliance checking and regulatory reporting',
      'Real-time financial visibility for leadership',
      'Significant reduction in processing time and errors',
      'Team shift from tactical processing to strategic analysis',
    ],
    keyCapabilities: [
      'AI transaction validation',
      'Automated compliance engines',
      'Real-time financial dashboards',
      'Banking and accounting integrations',
      'Automated report generation',
      'Complete audit trail automation',
    ],
    caseStudySlugs: ['finance-team-automation'],
    iconColor: '#8B5CF6',
  },
  {
    id: 'legal',
    name: 'Legal & Compliance',
    slug: 'legal-compliance',
    tagline: 'AI-powered case management and document intelligence',
    challenge:
      'Legal teams face overwhelming document volumes, manual case file organization, time-consuming contract review, and spreadsheet-based deadline tracking. Traditional legal tech solutions are too rigid for specialized practice areas, and scaling operations requires proportional headcount increases.',
    solution:
      'Bridgebox designs intelligent document management systems with AI-powered classification, automatic information extraction, and custom case workflow automation. Systems are tailored to specific practice areas while integrating with existing practice management platforms.',
    benefits: [
      'Automatic document classification and metadata extraction',
      'Significant reduction in document processing time',
      'AI-powered contract analysis and key clause identification',
      'Intelligent deadline monitoring with escalations',
      'Increased case capacity without additional headcount',
    ],
    keyCapabilities: [
      'AI document analysis and classification',
      'Natural language processing',
      'Custom case management dashboards',
      'Automated deadline tracking',
      'Document assembly workflows',
      'Secure client collaboration portals',
    ],
    caseStudySlugs: ['legal-document-intelligence'],
    iconColor: '#EC4899',
  },
  {
    id: 'operations',
    name: 'Operations & Manufacturing',
    slug: 'operations-manufacturing',
    tagline: 'Unified control across distributed operations',
    challenge:
      'Multi-site operations struggle with disconnected inventory, scheduling, maintenance, and customer systems. Regional managers lack unified performance visibility, and executives make decisions based on outdated consolidated reports. Identifying operational issues requires manual investigation across multiple platforms.',
    solution:
      'Bridgebox engineers unified operations command centers consolidating data from all operational systems. Real-time dashboards serve both tactical operations and strategic leadership, with AI-powered insights identifying trends and potential issues before they impact operations.',
    benefits: [
      'Real-time visibility across all locations and systems',
      'Rapid issue identification through automated monitoring',
      'AI-powered predictive maintenance alerts',
      'Cross-site performance analytics enabling best practice sharing',
      'Executive decision-making based on live operational data',
    ],
    keyCapabilities: [
      'Enterprise system integration',
      'Real-time operations dashboards',
      'Mobile apps with offline sync',
      'AI anomaly detection',
      'Predictive maintenance systems',
      'Automated reporting pipelines',
    ],
    caseStudySlugs: ['unified-operations-command-center'],
    iconColor: '#3B82F6',
  },
  {
    id: 'services',
    name: 'Service-Based Businesses',
    slug: 'service-businesses',
    tagline: 'Connected workflows from dispatch to delivery',
    challenge:
      'Service businesses with distributed teams face coordination challenges between field workers, dispatchers, and customers. Manual status updates, paper-based forms, and phone coordination create inefficiencies. Limited real-time visibility prevents optimal scheduling, and delayed customer communication impacts satisfaction.',
    solution:
      'Bridgebox builds comprehensive mobile workforce platforms connecting field teams, dispatchers, and customers in real-time. Native mobile apps with offline capability, intelligent routing, and automated communication workflows transform field service operations.',
    benefits: [
      'Real-time coordination between field, office, and customers',
      'Optimized routing and scheduling for increased daily capacity',
      'Elimination of paper forms and manual data entry',
      'Proactive customer communication with automated updates',
      'Complete operational visibility and data accuracy',
    ],
    keyCapabilities: [
      'Native mobile apps (iOS/Android)',
      'GPS tracking and intelligent routing',
      'Digital forms with photo capture',
      'Automated customer notifications',
      'Dispatch command center',
      'CRM and billing integrations',
    ],
    caseStudySlugs: ['mobile-workforce-coordination'],
    iconColor: '#10B981',
  },
];

export function getIndustryBySlug(slug: string): Industry | undefined {
  return industries.find((industry) => industry.slug === slug);
}
