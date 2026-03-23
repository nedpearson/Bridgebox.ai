import { FAQItem } from '../types';

export const faqItems: FAQItem[] = [
  {
    id: 'what-does-bridgebox-do',
    question: 'What does Bridgebox actually do?',
    answer:
      'Bridgebox connects systems, builds custom software, and automates workflows using AI. We engineer solutions that integrate your existing tools, create unified operational dashboards, and eliminate manual processes. Whether you need custom software from scratch, intelligent automation, or powerful integrations, we build technology tailored specifically to your business operations.',
    category: 'General',
  },
  {
    id: 'custom-software',
    question: 'Do you build custom software?',
    answer:
      'Yes, all solutions can be tailored to your business. We specialize in building custom software engineered specifically for your operational needs. Whether you need a complete platform, specialized workflow tools, customer portals, or internal operations systems, we design and build solutions that fit your exact requirements rather than forcing you to adapt to off-the-shelf software limitations.',
    category: 'Services',
  },
  {
    id: 'integrations',
    question: 'Can you integrate with our existing tools?',
    answer:
      'Yes, Bridgebox is designed to integrate with your current systems. We connect with virtually any platform through APIs, webhooks, database connections, or custom integrations. Common integrations include CRMs, ERPs, accounting software, carrier systems, warehousing platforms, and proprietary internal tools. Our goal is to create a unified system that leverages your existing technology investments.',
    category: 'Technical',
  },
  {
    id: 'dashboards',
    question: 'Do you build dashboards?',
    answer:
      'Yes, we build real-time dashboards with actionable insights. Our dashboards consolidate data from all your systems into unified views tailored to different roles—from operational teams needing real-time alerts to executives requiring strategic KPIs. Dashboards update in real-time, include predictive analytics, and are fully customizable to your specific metrics and workflows.',
    category: 'Services',
  },
  {
    id: 'mobile-apps',
    question: 'Do you build mobile apps?',
    answer:
      'Yes, we develop custom mobile applications for iOS and Android. Our mobile solutions include native apps for field teams with offline capability, customer-facing applications, mobile dashboards for executives, and workforce coordination platforms. All mobile apps integrate seamlessly with your backend systems and are designed for the specific workflows your teams use in the field.',
    category: 'Services',
  },
  {
    id: 'timeline',
    question: 'How long does a project take?',
    answer:
      'Project duration depends on scope, but we provide clear timelines upfront. Simple integrations and dashboards can launch in 4-6 weeks. Mid-complexity projects like custom operational platforms typically take 3-4 months. Comprehensive enterprise solutions may require 6-12 months. We work in phases with regular deployments, so you see progress and gain value throughout the project rather than waiting for a final delivery.',
    category: 'Process',
  },
  {
    id: 'saas-or-custom',
    question: 'Is this a SaaS or custom service?',
    answer:
      'Both. We offer a platform and custom builds. The Bridgebox Platform provides pre-built integrations, AI automation capabilities, and dashboard frameworks that can be configured for your needs. For unique requirements or specialized workflows, we build fully custom solutions from the ground up. Many clients start with our platform and expand with custom development as their needs evolve.',
    category: 'General',
  },
  {
    id: 'getting-started',
    question: 'How do we get started?',
    answer:
      'Schedule a demo or request a custom build. We begin with a discovery call to understand your current systems, pain points, and goals. For platform solutions, we can demo relevant capabilities immediately. For custom projects, we provide a detailed proposal outlining the solution architecture, timeline, and investment. Most clients move from initial conversation to project kickoff within 2-3 weeks.',
    category: 'Process',
  },
];

export function getFAQByCategory(): Record<string, FAQItem[]> {
  const categorized: Record<string, FAQItem[]> = {};

  faqItems.forEach((item) => {
    const category = item.category || 'General';
    if (!categorized[category]) {
      categorized[category] = [];
    }
    categorized[category].push(item);
  });

  return categorized;
}
