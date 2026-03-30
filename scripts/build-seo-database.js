import fs from 'fs';
import path from 'path';

const SEO_DIR = path.join(process.cwd(), 'src', 'data', 'seo-content');

// Helper to ensure directories exist
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ---------------------------------------------------------
// 🧠 PHASE 1 — KEYWORD INTELLIGENCE ENGINE & VARIATIONS
// ---------------------------------------------------------
const intentClusters = {
  core: ['ai workflow automation platform', 'custom ai software development', 'workflow automation software for businesses', 'ai integration platform', 'business automation platform', 'enterprise workflow automation', 'build custom software without coding', 'ai business operating system'],
  industries: ['law firms', 'logistics', 'accounting', 'healthcare', 'real estate', 'dealerships', 'construction', 'agencies', 'e-commerce', 'financial services', 'manufacturing', 'education', 'hospitality', 'retail', 'insurance', 'wealth management', 'dental clinics', 'veterinary', 'property management', 'automotive repair', 'nonprofits', 'recruiting', 'staffing', 'architecture', 'engineering', 'energy', 'oil and gas', 'telecommunications', 'media', 'entertainment', 'travel', 'food and beverage', 'warehousing', 'beauty and wellness', 'fitness', 'landscaping', 'pest control', 'hvac', 'plumbing', 'security'],
  industrySubWorkflows: ['client intake automation', 'document management workflow', 'payroll processing compliance', 'inventory depletion alerts'],
  useCases: ['invoice processing', 'client onboarding', 'logistics tracking', 'inventory management', 'document extraction', 'contract generation', 'employee onboarding', 'lead qualification', 'support ticket routing', 'compliance reporting', 'expense approvals', 'shift scheduling', 'data entry', 'payment reconciliation', 'CRM sync', 'proposal drafting', 'social media posting', 'email triage', 'appointment booking', 'vendor management', 'supply chain alerts', 'quality assurance', 'refund processing', 'commission tracking', 'fleet routing', 'tax document sorting', 'asset management', 'maintenance requests', 'loan processing', 'event registration', 'lead nurturing', 'candidate screening', 'order fulfillment', 'subscription billing', 'cancellation flows', 'booking reminders', 'quote generation', 'inventory auditing', 'audit logs reporting', 'vendor onboarding'],
  features: ['voice-to-build', 'screen recording ingestion', 'integration engine', 'workflow orchestration', 'visual canvas', 'data normalization', 'ai logic gates', 'human-in-the-loop approvals', 'multi-tenant architecture', 'role-based access control', 'webhook listeners', 'scheduled triggers', 'api proxying', 'audit logging', 'custom form builder', 'cron schedulers', 'branching logic'],
  competitors: ['zapier', 'make.com', 'workato', 'tray.io', 'n8n', 'retool', 'bubble', 'autocode', 'custom development', 'manual labor', 'pipedream', 'boomi', 'mulesoft', 'ifttt', 'celigo', 'integrately', 'power automate', 'appsheet', 'glide'],
  integrations: ['quickbooks', 'salesforce', 'google drive', 'slack', 'gmail', 'hubspot', 'jira', 'monday.com', 'airtable', 'notion', 'stripe', 'shopify', 'xero', 'zendesk', 'dropbox', 'docusign', 'teams', 'asana', 'trello', 'mailchimp', 'zoom', 'github', 'gitlab', 'aws', 'twilio', 'sendgrid', 'mailgun', 'intercom', 'activecampaign', 'typeform', 'calendly', 'harvest', 'toggl', 'bamboo hr', 'workday', 'sap', 'oracle', 'netsuite', 'pipedrive', 'smartsheet']
};

const internalLinks = [];

// ---------------------------------------------------------
// ⚡ PHASE 2 — CONTENT GENERATION LOGIC (Unique permutations)
// ---------------------------------------------------------

function buildPageData(category, slug, keyword, data) {
  const filePath = path.join(SEO_DIR, category, `${slug}.json`);
  ensureDir(path.parse(filePath).dir);
  
  const payload = {
    id: `${category}-${slug}`,
    category,
    slug,
    keyword,
    intent: data.intent || "informational",
    difficulty: data.difficulty || "medium",
    priority: data.priority || "high",
    metadata: {
      title: `${data.titlePrefix} | Bridgebox AI`,
      description: data.metaDescription || `Discover how Bridgebox AI can streamline your operations with ${keyword}. Automate intelligently and scale without heavy custom development.`,
      canonical: `https://bridgebox.ai/${category}/${slug}`
    },
    content: {
      heroH1: data.h1 || `Automate Your Business with ${keyword}`,
      heroSubtitle: data.subtitle || `Stop doing manual work. Bridgebox AI builds and orchestrates your ${keyword} processes automatically using intelligent voice and visual mapping.`,
      problemStatement: data.problem || `Most organizations struggle to implement ${keyword} because traditional software development is too slow and generic no-code tools lack enterprise robustness.`,
      solutionExplanation: data.solution || `Bridgebox provides a dedicated AI intelligence layer that understands your distinct operations. We translate your natural voice and workflow recordings directly into a scalable ${keyword} environment.`,
      benefits: data.benefits || [
        { title: "Rapid Deployment", description: "Launch enterprise-grade automations in days, not months." },
        { title: "Zero Technical Debt", description: "Our AI generates clean, scalable architecture behind the scenes." },
        { title: "End-to-End Security", description: "Bank-level encryption and strict multi-tenant data isolation natively." }
      ],
      featuresUsed: data.features || [intentClusters.features[0], intentClusters.features[1], intentClusters.features[2]],
      integrationsReferenced: data.integrations || [intentClusters.integrations[0], intentClusters.integrations[1]],
      faq: data.faq || [
        { question: `How long does it take to implement ${keyword} logic?`, answer: "Depending on complexity, Bridgebox can orchestrate your initial workflow in minutes to hours using Voice-to-Build capabilities." },
        { question: `Do I need a database administrator?`, answer: "No. Bridgebox natively provisions and scales your relational tables autonomously through your conversational intents." }
      ],
      cta: {
        primary: "Start Building for Free",
        secondary: "Talk to an Automation Architect",
        trustText: "Join innovative companies replacing legacy systems with autonomous software."
      }
    },
    // Phase 5 automated pathing
    internalLinks: [] 
  };
  
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
  internalLinks.push({ category, slug, keyword });
  return payload;
}

const formatSlug = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const capitalize = (str) => str.replace(/\b\w/g, l => l.toUpperCase());

// GENERATE 40+ INDUSTRY PAGES
console.log("Generating Industry Pages...");
intentClusters.industries.forEach((industry, i) => {
  // Main Industry Hub
  buildPageData("industry", formatSlug(industry), `ai automation for ${industry}`, {
    intent: "commercial",
    titlePrefix: `AI Automation Software for ${capitalize(industry)}`,
    h1: `Intelligent Software & Workflow Automation for ${capitalize(industry)}`,
    problem: `For ${industry}, relying on disjointed SaaS stacks and manual data transfer causes severe operational lag and critical data errors.`,
    solution: `Bridgebox unifies your entire operations. By understanding the unique logistical rules of ${industry}, our platform generates perfectly tailored data moats and unified dashboards dynamically.`,
    benefits: [
      { title: `Reduce Overhead in ${capitalize(industry)}`, description: "Cut operational friction by up to 80% replacing manual admin tasks with event-driven automation." },
      { title: "Unified Client Portals", description: "Provide an elite, white-labeled experience seamlessly connecting your backend processing directly to the front line." },
      { title: "Compliance Automations", description: "Never miss a step. Force strict logic gates across your workflow ensuring regulatory rules are fired consistently." }
    ],
    features: [intentClusters.features[0], intentClusters.features[5], intentClusters.features[7]],
    integrations: [intentClusters.integrations[i % intentClusters.integrations.length], intentClusters.integrations[(i+1) % intentClusters.integrations.length]]
  });

  // Industry Sub-pages
  intentClusters.industrySubWorkflows.forEach((subFlow) => {
     buildPageData("industry", `${formatSlug(industry)}-${formatSlug(subFlow)}`, `${subFlow} for ${industry}`, {
       intent: "transactional",
       titlePrefix: `${capitalize(subFlow)} Software for ${capitalize(industry)}`,
       h1: `Automate ${capitalize(subFlow)} in ${capitalize(industry)}`,
       problem: `Handling ${subFlow} manually inside ${industry} introduces devastating risks, bottlenecks, and compliance issues.`,
       solution: `Bridgebox orchestrates perfect conditional execution of ${subFlow} explicitly conforming to the rigor required by ${industry} operations.`,
       features: [intentClusters.features[2], intentClusters.features[4]],
       integrations: [intentClusters.integrations[i % intentClusters.integrations.length]]
     });
  });
});

// GENERATE 30+ USE CASE PAGES
console.log("Generating Use Case Pages...");
intentClusters.useCases.forEach((useCase, i) => {
  buildPageData("use-cases", formatSlug(useCase), `automate ${useCase}`, {
    intent: "transactional",
    titlePrefix: `How to Automate ${capitalize(useCase)} with AI`,
    h1: `Automate ${capitalize(useCase)} Workflows Instantly`,
    problem: `Manual ${useCase} processes are the largest bottleneck scaling an organization, requiring constant human oversight and repetitive clicks.`,
    solution: `Bridgebox's automation engine listens for your internal triggers to autonomously run ${useCase} without dropping context, scaling infinitely alongside your volume.`,
    features: [intentClusters.features[3], intentClusters.features[6]],
    integrations: [intentClusters.integrations[i % intentClusters.integrations.length]]
  });
});

// GENERATE 10+ COMPARISON PAGES
console.log("Generating Comparison Pages...");
intentClusters.competitors.forEach((competitor) => {
  buildPageData("compare", `bridgebox-vs-${formatSlug(competitor)}`, `bridgebox vs ${competitor}`, {
    intent: "comparison",
    priority: "highest",
    difficulty: "high",
    titlePrefix: `Bridgebox AI vs ${capitalize(competitor)} | The Better Alternative`,
    h1: `Looking for a ${capitalize(competitor)} Alternative?`,
    subtitle: `Unlike ${capitalize(competitor)}, Bridgebox doesn't just pass payloads between tools. We construct persistent, custom relational software designed to replace your manual workflow entirely.`,
    problem: `${capitalize(competitor)} becomes exponentially expensive, fragile, and difficult to manage visually as your workflows scale and require rigorous branching logic or nested data.`,
    benefits: [
      { title: "Persistent Data States", description: `Where ${capitalize(competitor)} just acts as a pipeline, Bridgebox gives you a full database backend to store and command your data infinitely.` },
      { title: "Deep UI Generation", description: `You can't easily deploy customized client portals via ${capitalize(competitor)}. Bridgebox auto-generates your front-ends tied directly to your pipelines.` }
    ]
  });
});

// GENERATE 20+ INTEGRATION PAGES
console.log("Generating Integration Pages...");
intentClusters.integrations.forEach((integration, i) => {
  buildPageData("integrations", formatSlug(integration), `bridgebox ${integration} integration`, {
    intent: "navigational",
    titlePrefix: `Connect ${capitalize(integration)} via Bridgebox AI Automation`,
    h1: `Supercharge ${capitalize(integration)} with AI Automations`,
    problem: `${capitalize(integration)} is powerful, but when it operates in a silo it limits your revenue operations and necessitates manual synchronization.`,
    solution: `Wire ${capitalize(integration)} natively into the Bridgebox Orchestration engine. React to updates, extract payloads, and format JSON seamlessly into your ecosystem.`
  });
});

// GENERATE 10+ FEATURE PAGES
console.log("Generating Feature Pages...");
intentClusters.features.forEach((feature) => {
  buildPageData("features", formatSlug(feature), feature, {
    intent: "informational",
    titlePrefix: `${capitalize(feature)} - Core Capability`,
    h1: capitalize(feature),
    subtitle: `Discover how the ${feature} capability empowers the next generation of enterprise architecture.`
  });
});

// GENERATE 50+ BLOG / LONG TAIL PAGES
console.log("Generating Long Tail Knowledge Base...");
const blogTopics = [];
intentClusters.industries.forEach((ind) => {
  blogTopics.push(`How AI is disrupting ${ind} in 2026`);
  blogTopics.push(`5 ways to automate ${ind} operations without coding`);
});
intentClusters.useCases.slice(0, 10).forEach((useCase) => {
  blogTopics.push(`The Ultimate Guide to scaling ${useCase} processes`);
});

blogTopics.forEach((topic) => {
  buildPageData("blog", formatSlug(topic), topic.toLowerCase(), {
    intent: "informational",
    titlePrefix: topic,
    h1: topic,
    problem: "Keeping pace with modernization requires systemic understanding of automation ecosystems.",
    solution: "We break down proven architectures to bridge legacy operations into cohesive AI frameworks."
  });
});

// ---------------------------------------------------------
// ⚡ PHASE 5 — INTERNAL LINKING AUTOMATION (Post-Processing)
// ---------------------------------------------------------
// Automatically wire the links between pages to form a strong crawl map
console.log("Weaving Semantic Link Graph...");

function wireJSONLinks() {
  const routes = internalLinks; // all routes mapped
  routes.forEach(route => {
    const filePath = path.join(SEO_DIR, route.category, `${route.slug}.json`);
    const pageData = JSON.parse(fs.readFileSync(filePath));
    
    // Pick 3-5 random relevant contextual links
    const relevantLinks = routes
      .filter(r => r.category !== route.category || Math.random() > 0.8) // bias to cross-linking
      .sort(() => 0.5 - Math.random())
      .slice(0, 5)
      .map(r => ({
        text: `Explore ${capitalize(r.keyword.replace('ai automation for ', ''))}`,
        url: `/${r.category}/${r.slug}`
      }));
      
    pageData.internalLinks = relevantLinks;
    fs.writeFileSync(filePath, JSON.stringify(pageData, null, 2));
  });
}

wireJSONLinks();

// Write the Registry File for Routing Maps
fs.writeFileSync(path.join(SEO_DIR, 'registry.json'), JSON.stringify(internalLinks, null, 2));

console.log(`✅ successfully synthesized ${internalLinks.length} dynamic SEO endpoints!`);
