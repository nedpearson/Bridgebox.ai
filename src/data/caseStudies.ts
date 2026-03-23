import { CaseStudy } from '../types';

export const caseStudies: CaseStudy[] = [
  {
    slug: 'unified-logistics-operations',
    title: 'Unified Logistics Operations Platform',
    industry: 'Logistics & Supply Chain',
    tagline: 'Real-time visibility across a fragmented multi-carrier network',
    client_type: 'Mid-Market Logistics Company',
    challenge:
      'A growing logistics company was operating with fragmented tracking systems across multiple carriers, third-party warehouses, and internal operations. Critical shipment data was trapped in isolated systems, leading to delayed updates, manual data entry, and limited operational visibility. The executive team had no unified view of performance metrics, resulting in reactive rather than proactive decision-making.',
    solution:
      'Bridgebox designed and deployed a unified operations platform that consolidated real-time data from all carrier APIs, warehouse management systems, and internal tools. We built custom dashboards for operations teams and executive leadership, implemented automated tracking workflows, and created predictive alerts for potential delays. The system integrated with existing CRM and ERP platforms while providing a single source of truth for all shipment data.',
    implementation: [
      'Custom API integrations with 12+ carrier systems and warehouse platforms',
      'Real-time operational dashboard with live tracking and performance KPIs',
      'Executive reporting system with predictive analytics and trend analysis',
      'Automated workflow engine for exception handling and escalations',
      'Mobile application for field teams with offline capability',
      'AI-powered delay prediction and route optimization',
    ],
    results: {
      primary:
        'The company achieved complete operational visibility and reduced manual coordination by 70%. Real-time tracking eliminated customer inquiry calls by 45%, and predictive analytics enabled proactive issue resolution before customer impact.',
      metrics: [
        {
          label: 'Operational Efficiency',
          value: '70%',
          description: 'Reduction in manual data entry and coordination time',
        },
        {
          label: 'Customer Inquiries',
          value: '45%',
          description: 'Decrease in tracking and status inquiry calls',
        },
        {
          label: 'On-Time Performance',
          value: '28%',
          description: 'Improvement through predictive delay management',
        },
        {
          label: 'Data Accuracy',
          value: '99.8%',
          description: 'Automated sync eliminated human error',
        },
      ],
    },
    testimonial: {
      quote:
        'Bridgebox transformed our operations from reactive chaos to proactive control. We now see everything in real-time and can solve problems before they impact customers. This system has become the backbone of our business.',
      author: 'Michael Rodriguez',
      role: 'VP of Operations',
      company: 'Mid-Market Logistics',
    },
    services: ['custom_software', 'dashboard', 'mobile_app', 'integration', 'ai_automation'],
    thumbnail_color: '#F59E0B',
  },
  {
    slug: 'finance-team-automation',
    title: 'Financial Operations Automation System',
    industry: 'Financial Services',
    tagline: 'From manual workflows to intelligent automation',
    client_type: 'Enterprise Finance Team',
    challenge:
      'A mid-sized financial services firm was processing hundreds of transactions daily through manual workflows. Data validation, compliance checks, and report generation consumed significant team resources, creating bottlenecks and increasing error risk. Month-end reporting required multiple team members working late nights to consolidate data from various systems. The lack of real-time financial visibility prevented leadership from making timely strategic decisions.',
    solution:
      'Bridgebox engineered a comprehensive financial automation platform that eliminated manual processing bottlenecks. We built intelligent validation workflows powered by AI, created automated compliance checking systems, and developed real-time financial dashboards for executive decision-making. The system integrated with existing accounting software, banking APIs, and CRM platforms while maintaining strict security and audit trail requirements.',
    implementation: [
      'AI-powered transaction validation and anomaly detection system',
      'Automated compliance checking with regulatory rule engine',
      'Real-time financial dashboards for executive leadership',
      'Custom reporting engine with automated distribution',
      'Secure API integrations with banking and accounting platforms',
      'Audit trail and documentation automation',
    ],
    results: {
      primary:
        'Processing time decreased by 85% while error rates dropped to near zero. Month-end reporting that previously took days now completes in hours with full automation. The finance team shifted from tactical processing to strategic analysis, and leadership gained real-time visibility into financial performance.',
      metrics: [
        {
          label: 'Processing Speed',
          value: '85%',
          description: 'Faster transaction processing with full automation',
        },
        {
          label: 'Error Reduction',
          value: '98%',
          description: 'AI validation eliminated manual entry mistakes',
        },
        {
          label: 'Month-End Reporting',
          value: '90%',
          description: 'Time savings through automated consolidation',
        },
        {
          label: 'Team Productivity',
          value: '3x',
          description: 'Shift from processing to strategic analysis',
        },
      ],
    },
    testimonial: {
      quote:
        'This system transformed our finance team from order-takers to strategic advisors. We now spend our time analyzing trends and advising leadership instead of manually processing transactions. The ROI was immediate.',
      author: 'Sarah Chen',
      role: 'Director of Finance',
      company: 'Financial Services Firm',
    },
    services: ['custom_software', 'dashboard', 'ai_automation', 'integration'],
    thumbnail_color: '#8B5CF6',
  },
  {
    slug: 'legal-document-intelligence',
    title: 'Legal Document Intelligence System',
    industry: 'Legal Services',
    tagline: 'AI-powered case management and document automation',
    client_type: 'Mid-Size Law Firm',
    challenge:
      'A growing law firm was drowning in document overload. Lawyers spent hours searching through case files, manually organizing documents, and extracting key information from contracts and briefs. Case preparation required extensive manual review, and critical deadlines were tracked in spreadsheets. The firm needed to scale operations without proportionally increasing headcount, but traditional legal tech solutions were too rigid for their specialized practice areas.',
    solution:
      'Bridgebox designed an intelligent document management and case workflow system tailored to the firm\'s specific practice areas. We implemented AI-powered document analysis for automatic classification and key information extraction, built custom case management dashboards with deadline tracking and matter visibility, and created workflow automation for routine legal processes. The system integrated with existing practice management software while providing advanced capabilities beyond standard legal tech platforms.',
    implementation: [
      'AI document analysis engine with natural language processing',
      'Automatic document classification and metadata extraction',
      'Custom case management dashboards with matter tracking',
      'Automated deadline monitoring with intelligent escalations',
      'Document assembly and contract generation workflows',
      'Secure client portal for document sharing and collaboration',
    ],
    results: {
      primary:
        'Document processing time dropped by 65%, and lawyers reclaimed 15+ hours per week previously spent on administrative tasks. Case preparation became significantly faster, allowing the firm to handle 40% more matters with existing staff. The system paid for itself within 6 months through increased capacity and reduced overtime costs.',
      metrics: [
        {
          label: 'Document Processing',
          value: '65%',
          description: 'Faster classification and information extraction',
        },
        {
          label: 'Lawyer Time Saved',
          value: '15 hrs/week',
          description: 'Per attorney through automation of admin tasks',
        },
        {
          label: 'Capacity Increase',
          value: '40%',
          description: 'More matters handled with same team size',
        },
        {
          label: 'ROI Timeline',
          value: '6 months',
          description: 'Full system cost recovery through efficiency gains',
        },
      ],
    },
    testimonial: {
      quote:
        'Bridgebox built exactly what we needed—not a one-size-fits-all legal platform, but a custom system designed around our practice. Our lawyers can now focus on legal work instead of document management. The efficiency gains have been transformational.',
      author: 'Emily Watson',
      role: 'Managing Partner',
      company: 'Mid-Size Law Firm',
    },
    services: ['custom_software', 'dashboard', 'ai_automation'],
    thumbnail_color: '#EC4899',
  },
  {
    slug: 'unified-operations-command-center',
    title: 'Unified Operations Command Center',
    industry: 'Multi-Site Operations',
    tagline: 'One platform controlling disconnected operational systems',
    client_type: 'Enterprise Operations Team',
    challenge:
      'An enterprise with 30+ locations was operating with disconnected tools across inventory management, workforce scheduling, maintenance tracking, and customer operations. Regional managers had no unified view of performance across sites. Data lived in isolated systems requiring manual export and consolidation for reporting. The executive team made strategic decisions based on week-old data, and identifying operational issues required manual investigation across multiple platforms.',
    solution:
      'Bridgebox engineered a unified operations command center that consolidated data from all operational systems into one intelligent platform. We built real-time dashboards for site managers and executives, created automated alerting for operational anomalies, and developed mobile applications for field teams. The system provided both operational detail and strategic overview, with AI-powered insights highlighting trends and potential issues before they became problems.',
    implementation: [
      'Enterprise integration layer connecting 15+ operational systems',
      'Real-time operations dashboard with drill-down capabilities',
      'Executive command center with cross-site analytics',
      'Mobile apps for field teams with offline synchronization',
      'AI anomaly detection and predictive alerting engine',
      'Automated reporting and data pipeline orchestration',
    ],
    results: {
      primary:
        'The operations team achieved unified visibility across all locations for the first time. Issue identification time dropped from days to minutes, and executive reporting became real-time instead of retrospective. Cross-site performance comparisons enabled best practice sharing, and predictive alerts prevented operational disruptions before they impacted customers.',
      metrics: [
        {
          label: 'Operational Visibility',
          value: 'Real-time',
          description: 'Instant access to all site data vs. week-old reports',
        },
        {
          label: 'Issue Detection',
          value: '95%',
          description: 'Faster identification through automated monitoring',
        },
        {
          label: 'Reporting Efficiency',
          value: '80%',
          description: 'Time saved through automated consolidation',
        },
        {
          label: 'Downtime Prevention',
          value: '60%',
          description: 'Reduction through predictive maintenance alerts',
        },
      ],
    },
    testimonial: {
      quote:
        'This system gave us something we never had: complete operational control. We can now see everything happening across all locations in real-time and act on insights before they become problems. It\'s been a game-changer for how we run the business.',
      author: 'David Martinez',
      role: 'Chief Operations Officer',
      company: 'Enterprise Operations',
    },
    services: ['custom_software', 'dashboard', 'mobile_app', 'integration', 'ai_automation'],
    thumbnail_color: '#3B82F6',
  },
  {
    slug: 'mobile-workforce-coordination',
    title: 'Mobile Workforce Coordination Platform',
    industry: 'Field Services',
    tagline: 'Real-time coordination for distributed field teams',
    client_type: 'Field Services Company',
    challenge:
      'A field services company with 200+ technicians struggled with disconnected coordination between office dispatch, field teams, and customers. Technicians relied on paper forms and phone calls to update job status. Dispatchers had no real-time visibility into technician locations or availability. Customer updates were manual, and job completion data required manual entry back in the office. The lack of real-time coordination led to scheduling inefficiencies, delayed customer communication, and lost data.',
    solution:
      'Bridgebox built a comprehensive mobile workforce platform connecting field technicians, dispatchers, and customers in real-time. We developed native mobile applications for iOS and Android with offline capability, created a dispatch command center with live tracking and intelligent routing, and automated customer communication workflows. The system integrated with existing CRM and billing platforms while providing GPS tracking, digital forms, photo capture, and real-time status updates.',
    implementation: [
      'Native mobile apps for iOS and Android with offline mode',
      'Dispatch command center with live GPS tracking',
      'Intelligent routing and scheduling optimization',
      'Digital forms with photo capture and e-signatures',
      'Automated customer communication and ETA updates',
      'Integration with CRM, billing, and inventory systems',
    ],
    results: {
      primary:
        'Field coordination efficiency increased dramatically with real-time visibility and automated workflows. Daily job capacity increased by 25% through optimized routing and reduced administrative time. Customer satisfaction scores improved significantly due to proactive communication and faster service completion. Paperwork elimination saved thousands in administrative overhead annually.',
      metrics: [
        {
          label: 'Daily Capacity',
          value: '25%',
          description: 'More jobs completed through optimized routing',
        },
        {
          label: 'Admin Time',
          value: '75%',
          description: 'Reduction through digital forms and automation',
        },
        {
          label: 'Customer Satisfaction',
          value: '92%',
          description: 'Score improvement from proactive communication',
        },
        {
          label: 'Data Accuracy',
          value: '100%',
          description: 'Real-time sync eliminated data entry errors',
        },
      ],
    },
    testimonial: {
      quote:
        'Our field teams used to be disconnected islands. Now we have complete visibility and coordination in real-time. Technicians love the mobile app, dispatchers can optimize on the fly, and customers get proactive updates. This system has transformed how we operate.',
      author: 'Jennifer Lee',
      role: 'VP of Field Operations',
      company: 'Field Services Company',
    },
    services: ['mobile_app', 'custom_software', 'dashboard', 'integration'],
    thumbnail_color: '#10B981',
  },
  {
    slug: 'data-consolidation-executive-intelligence',
    title: 'Executive Intelligence & Data Consolidation',
    industry: 'Multi-Department Enterprise',
    tagline: 'Strategic insights from fragmented enterprise data',
    client_type: 'Enterprise Leadership Team',
    challenge:
      'An enterprise leadership team was making strategic decisions based on fragmented data from multiple departments. Sales, operations, finance, and customer success each used different systems with incompatible reporting formats. Preparing for board meetings required days of manual data gathering and spreadsheet consolidation. Real-time business health visibility did not exist, and identifying cross-departmental trends was nearly impossible. The executive team needed unified intelligence across the entire business without disrupting existing departmental workflows.',
    solution:
      'Bridgebox engineered an executive intelligence platform that consolidated data from all departmental systems into unified dashboards and automated reporting. We built a centralized data warehouse with real-time ETL pipelines, created executive dashboards with customizable KPI tracking, and implemented AI-powered insights highlighting trends and anomalies. The system provided strategic overview while maintaining departmental operational detail, with automated report generation and distribution for board meetings and leadership reviews.',
    implementation: [
      'Centralized data warehouse with real-time ETL pipelines',
      'Executive dashboard with unified KPIs across departments',
      'AI-powered trend analysis and anomaly detection',
      'Automated board report generation and distribution',
      'Predictive analytics for revenue and operations forecasting',
      'Secure mobile access for leadership team',
    ],
    results: {
      primary:
        'Executive decision-making shifted from reactive to proactive with real-time business intelligence. Board meeting preparation time dropped from days to hours with automated reporting. Cross-departmental insights revealed optimization opportunities worth millions annually. The leadership team gained confidence in strategic planning through data-driven forecasting and trend analysis.',
      metrics: [
        {
          label: 'Decision Speed',
          value: 'Real-time',
          description: 'Strategic decisions based on live data vs. week-old reports',
        },
        {
          label: 'Board Prep Time',
          value: '85%',
          description: 'Reduction through automated report generation',
        },
        {
          label: 'Data Accuracy',
          value: '99.9%',
          description: 'Automated consolidation eliminated manual errors',
        },
        {
          label: 'Strategic Value',
          value: '$2M+',
          description: 'Annual value from data-driven optimization insights',
        },
      ],
    },
    testimonial: {
      quote:
        'For the first time, we have a complete view of our business in real-time. Strategic planning is now data-driven instead of intuition-based. The insights this system provides have uncovered opportunities we never would have found manually. It\'s invaluable.',
      author: 'Robert Thompson',
      role: 'Chief Executive Officer',
      company: 'Enterprise Leadership',
    },
    services: ['dashboard', 'custom_software', 'integration', 'ai_automation'],
    thumbnail_color: '#6366F1',
  },
];

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((study) => study.slug === slug);
}

export function getFeaturedCaseStudies(count: number = 3): CaseStudy[] {
  return caseStudies.slice(0, count);
}
