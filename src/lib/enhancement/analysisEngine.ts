import type {
  EnhancementRequestType,
  EnhancementRecommendations,
  FeatureItem,
  RiskItem,
  ImplementationStep,
  AutomationItem,
} from "../../types/enhancement";

const FEATURE_KEYWORDS = [
  "dashboard",
  "report",
  "export",
  "import",
  "filter",
  "search",
  "approval",
  "notification",
  "integration",
  "automation",
  "workflow",
  "calendar",
  "invoice",
  "payment",
  "tracking",
  "analytics",
  "chat",
  "messaging",
  "crm",
  "erp",
  "schedule",
  "task",
  "project",
  "client",
  "billing",
  "document",
  "form",
  "signature",
  "audit",
  "role",
  "permission",
  "portal",
  "mobile",
  "email",
];

export function classifyRequestType(text: string): EnhancementRequestType {
  const lower = text.toLowerCase();
  if (
    lower.includes("merge") ||
    lower.includes("transfer") ||
    lower.includes("copy from")
  )
    return "workspace_merge";
  if (
    lower.includes("rebuild") ||
    lower.includes("replace") ||
    lower.includes("entire system") ||
    lower.includes("from scratch")
  )
    return "full_software_blueprint";
  if (
    lower.includes("ui") ||
    lower.includes("design") ||
    lower.includes("look") ||
    lower.includes("feel") ||
    lower.includes("layout") ||
    lower.includes("color")
  )
    return "ui_enhancement";
  if (
    lower.includes("workflow") ||
    lower.includes("process") ||
    lower.includes("step") ||
    lower.includes("approval flow")
  )
    return "workflow_enhancement";
  if (
    lower.includes("integration") ||
    lower.includes("connect") ||
    lower.includes("sync") ||
    lower.includes("api") ||
    lower.includes("webhook")
  )
    return "integration_enhancement";
  if (
    lower.includes("change") ||
    lower.includes("update") ||
    lower.includes("modify") ||
    lower.includes("improve") ||
    lower.includes("fix")
  )
    return "feature_modification";
  return "new_feature";
}

export function extractFeaturesFromText(
  text: string,
  profile?: WorkspaceProfileContext,
): FeatureItem[] {
  const lower = text.toLowerCase();
  const features: FeatureItem[] = [];
  let id = 0;

  // Seed profile-specific keep features first (highest confidence)
  if (profile?.must_keep_features?.length) {
    profile.must_keep_features.filter(Boolean).forEach((f) => {
      features.push({
        id: `profile_keep_${++id}`,
        name: f,
        description: `Must be preserved exactly as-is per client's onboarding profile.`,
        priority: "critical",
        category: "profile_keep",
        source: "profile",
        confidence: 0.97,
      });
    });
  }

  // Seed integration requirements from profile
  if (profile?.required_integrations?.length) {
    profile.required_integrations.filter(Boolean).forEach((integration) => {
      features.push({
        id: `profile_int_${++id}`,
        name: `${integration} Integration`,
        description: `Required integration identified during client onboarding.`,
        priority: "high",
        category: "integration",
        source: "profile",
        confidence: 0.95,
      });
    });
  }

  FEATURE_KEYWORDS.forEach((keyword) => {
    if (lower.includes(keyword)) {
      features.push({
        id: `f${++id}`,
        name: keyword.charAt(0).toUpperCase() + keyword.slice(1),
        description: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} functionality inferred from your request.`,
        priority: id <= 3 ? "high" : "medium",
        category: "extracted",
        source: "inferred",
        confidence: 0.7,
      });
    }
  });

  // Extract explicit "I want / I need / add / build" patterns
  const wantPattern =
    /(?:i want|i need|add|build|create|include|give me|we need)\s+(?:a |an |the )?([a-z][a-z\s]{2,28})(?:\.|,|;| and| that| which|\s*$)/gi;
  let match;
  while ((match = wantPattern.exec(text)) !== null) {
    const extracted = match[1].trim();
    if (
      extracted.length > 2 &&
      extracted.split(" ").length <= 5 &&
      !features.find((f) => f.name.toLowerCase() === extracted.toLowerCase())
    ) {
      features.push({
        id: `f${++id}`,
        name: extracted.charAt(0).toUpperCase() + extracted.slice(1),
        description: `Explicitly requested: "${extracted}"`,
        priority: "high",
        category: "explicit_request",
        source: "voice",
        confidence: 0.9,
      });
    }
  }

  return features.slice(0, 16); // Profile features get priority so they stay in the list
}

export function generateBusinessSummary(
  text: string,
  requestType: EnhancementRequestType,
  profile?: WorkspaceProfileContext,
): string {
  const typeLabels: Record<EnhancementRequestType, string> = {
    new_feature: "adding new functionality",
    feature_modification: "modifying existing functionality",
    ui_enhancement: "improving the user interface and experience",
    workflow_enhancement: "enhancing workflows and operational processes",
    integration_enhancement: "adding or improving system integrations",
    reusable_transplant: "transplanting reusable components between workspaces",
    workspace_merge: "merging approved assets from another workspace",
    full_software_blueprint:
      "creating a comprehensive software blueprint from scratch",
  };

  const wordCount = text.trim().split(/\s+/).length;
  const complexity =
    wordCount > 100 ? "comprehensive" : wordCount > 40 ? "detailed" : "focused";

  const profileContext = profile
    ? [
        profile.current_software_stack?.length
          ? `The client currently uses ${profile.current_software_stack.slice(0, 4).join(", ")}.`
          : "",
        profile.must_keep_features?.length
          ? `${profile.must_keep_features.length} features must be preserved exactly.`
          : "",
        profile.required_integrations?.length
          ? `Required integrations: ${profile.required_integrations.join(", ")}.`
          : "",
        profile.industry_context
          ? `Industry: ${profile.industry_context}.`
          : "",
      ]
        .filter(Boolean)
        .join(" ")
    : "";

  return `This ${complexity} request focuses on ${typeLabels[requestType]}. Based on ${wordCount} words of input, the system has extracted actionable requirements for the implementation team. ${profileContext} The analysis below identifies specific features, workflows, risks, and a recommended implementation path.`.trim();
}

export function inferWorkflowsFromText(text: string) {
  const workflows = [];
  const lower = text.toLowerCase();

  if (
    lower.includes("approval") ||
    lower.includes("review") ||
    lower.includes("sign off")
  ) {
    workflows.push({
      id: "wf1",
      name: "Approval Workflow",
      steps: [
        "Submit item",
        "Notify approver",
        "Review",
        "Approve or Reject",
        "Notify requester",
      ],
      trigger: "User submits item for review",
      outcome: "Item approved or rejected with notification",
      automation_potential: true,
    });
  }

  if (
    lower.includes("notification") ||
    lower.includes("alert") ||
    lower.includes("remind")
  ) {
    workflows.push({
      id: "wf2",
      name: "Notification Flow",
      steps: [
        "Trigger event",
        "Evaluate conditions",
        "Send notification",
        "Log delivery",
      ],
      trigger: "System event or threshold reached",
      outcome: "Stakeholders notified via configured channel",
      automation_potential: true,
    });
  }

  if (
    lower.includes("onboard") ||
    lower.includes("setup") ||
    lower.includes("new client") ||
    lower.includes("new user")
  ) {
    workflows.push({
      id: "wf3",
      name: "Onboarding Workflow",
      steps: [
        "Create record",
        "Send welcome",
        "Guide through setup",
        "Configure preferences",
        "Activate",
      ],
      trigger: "New client or user added to system",
      outcome: "Account fully configured and activated",
      automation_potential: true,
    });
  }

  return workflows;
}

export function inferAutomationsFromText(text: string): AutomationItem[] {
  const automations: AutomationItem[] = [];
  const lower = text.toLowerCase();

  if (
    lower.includes("remind") ||
    lower.includes("follow up") ||
    lower.includes("overdue")
  ) {
    automations.push({
      trigger: "Due date passes without action",
      action: "Send automated reminder",
      benefit: "Reduces manual follow-up overhead",
    });
  }
  if (
    lower.includes("report") ||
    lower.includes("summary") ||
    lower.includes("weekly") ||
    lower.includes("monthly")
  ) {
    automations.push({
      trigger: "Scheduled time (daily/weekly/monthly)",
      action: "Generate and deliver report",
      benefit: "Eliminates manual report preparation",
    });
  }
  if (
    lower.includes("invoice") ||
    lower.includes("billing") ||
    lower.includes("payment")
  ) {
    automations.push({
      trigger: "Milestone or period completion",
      action: "Auto-generate invoice",
      benefit: "Accelerates billing cycle",
    });
  }

  return automations;
}

export function generateRisksFromText(
  text: string,
  profile?: WorkspaceProfileContext,
): RiskItem[] {
  const risks: RiskItem[] = [];
  const lower = text.toLowerCase();

  if (
    lower.includes("migration") ||
    lower.includes("existing data") ||
    lower.includes("import")
  ) {
    risks.push({
      area: "Data Migration",
      description: "Existing data may need migration planning.",
      severity: "high",
      mitigation:
        "Define data mapping and a migration runbook before implementation begins.",
    });
  }
  if (
    lower.includes("integration") ||
    lower.includes("api") ||
    lower.includes("sync") ||
    profile?.required_integrations?.length
  ) {
    const integrationNames = profile?.required_integrations?.length
      ? profile.required_integrations.slice(0, 3).join(", ")
      : "Third-party APIs";
    risks.push({
      area: "External Dependencies",
      description: `${integrationNames} availability and rate limits may impact delivery.`,
      severity: "medium",
      mitigation: "Define fallback behavior and implement API contract tests.",
    });
  }
  if (
    lower.includes("performance") ||
    lower.includes("slow") ||
    lower.includes("scale") ||
    lower.includes("load")
  ) {
    risks.push({
      area: "Performance & Scale",
      description: "Performance requirements need load testing before launch.",
      severity: "medium",
      mitigation:
        "Establish performance benchmarks and set up monitoring dashboards.",
    });
  }
  if (
    lower.includes("role") ||
    lower.includes("permission") ||
    lower.includes("access") ||
    lower.includes("security") ||
    profile?.workflow_rules?.length
  ) {
    const roleCount = profile?.workflow_rules?.length || 0;
    risks.push({
      area: "Access Control",
      description: `Role-based access requirements must be precisely defined${roleCount > 1 ? ` (${roleCount} roles identified)` : ""}.`,
      severity: "high",
      mitigation:
        "Define permission matrix per role before development starts.",
    });
  }
  if (profile?.must_remove_features?.length) {
    risks.push({
      area: "Legacy Feature Removal",
      description: `${profile.must_remove_features.length} feature(s) flagged for removal — teams may have undocumented dependencies on them.`,
      severity: "medium",
      mitigation:
        "Audit usage logs and communicate removal plan to all affected teams before deprecation.",
    });
  }

  if (risks.length === 0) {
    risks.push({
      area: "Scope Clarity",
      description: "Some edge cases may need stakeholder clarification.",
      severity: "low",
      mitigation:
        "Schedule a brief discovery session to validate requirements.",
    });
  }

  return risks;
}

export function generateImplementationPlan(
  features: FeatureItem[],
  requestType: EnhancementRequestType,
  profile?: WorkspaceProfileContext,
): ImplementationStep[] {
  const featureNames = features
    .slice(0, 3)
    .map((f) => f.name)
    .join(", ");
  const hasIntegrations =
    (profile?.required_integrations?.length ?? 0) > 0 ||
    requestType === "integration_enhancement";

  const plan: ImplementationStep[] = [
    {
      phase: 1,
      title: "Discovery & Requirements",
      description: `Validate extracted requirements with stakeholders. Confirm scope, priorities, and edge cases.${profile?.must_keep_features?.length ? ` Preserve: ${profile.must_keep_features.slice(0, 2).join(", ")}.` : ""}`,
      estimated_effort: "1–2 days",
      dependencies: [],
    },
    {
      phase: 2,
      title: "Architecture & Design",
      description:
        "Define data model, API contracts, and UI wireframes based on the specified requirements.",
      estimated_effort: "2–3 days",
      dependencies: ["phase_1"],
    },
    {
      phase: 3,
      title: "Core Implementation",
      description: `Build ${featureNames || "core features"} and the underlying data layer.`,
      estimated_effort: "5–10 days",
      dependencies: ["phase_2"],
    },
    {
      phase: 4,
      title: "Integration & QA",
      description: `Wire all integrations${profile?.required_integrations?.length ? ` (${profile.required_integrations.join(", ")})` : ""}, run QA cycles, and address edge cases.`,
      estimated_effort: "2–4 days",
      dependencies: ["phase_3"],
    },
    {
      phase: 5,
      title: "Staging & Launch",
      description:
        "Deploy to staging, run client review, incorporate feedback, and launch to production.",
      estimated_effort: "1–2 days",
      dependencies: ["phase_4"],
    },
  ];

  if (hasIntegrations) {
    plan.splice(2, 0, {
      phase: 2,
      title: "API & Integration Setup",
      description: `Configure credentials, webhooks, and data mapping for: ${profile?.required_integrations?.join(", ") || "required integrations"}.`,
      estimated_effort: "1–3 days",
      dependencies: ["phase_2"],
    });
  }

  return plan;
}

export interface WorkspaceProfileContext {
  current_software_stack?: string[];
  must_keep_features?: string[];
  must_remove_features?: string[];
  required_integrations?: string[];
  preferred_ux_style?: string;
  workflow_rules?: string[];
  industry_context?: string;
}

export function buildEnhancementRecommendations(
  text: string,
  mediaCount = 0,
  profile?: WorkspaceProfileContext,
): EnhancementRecommendations {
  const requestType = classifyRequestType(text);
  const features = extractFeaturesFromText(text, profile);
  const businessSummary = generateBusinessSummary(text, requestType, profile);
  const workflows = inferWorkflowsFromText(text);
  const automations = inferAutomationsFromText(text);
  const risks = generateRisksFromText(text, profile);
  const implementationPlan = generateImplementationPlan(
    features,
    requestType,
    profile,
  );

  const baseConfidence =
    features.length > 3 ? 0.72 : features.length > 0 ? 0.58 : 0.42;
  const mediaBoost = mediaCount > 0 ? 0.12 : 0;
  const transcriptBoost = text.split(/\s+/).length > 80 ? 0.08 : 0;
  // Profile data significantly increases confidence because we have precise context
  const profileBoost = profile
    ? (profile.current_software_stack?.length ? 0.06 : 0) +
      (profile.must_keep_features?.length ? 0.04 : 0) +
      (profile.required_integrations?.length ? 0.04 : 0)
    : 0;
  const confidence = Math.min(
    0.97,
    baseConfidence + mediaBoost + transcriptBoost + profileBoost,
  );

  let side_by_side_comparison = undefined;
  let brand_context = undefined;
  if (text.includes("AUTONOMOUS_AGENT_RUN")) {
    const extractedUrlMatch = text.match(/URL:\s*(https?:\/\/[^\s]+)/);
    const competitorUrl = extractedUrlMatch ? extractedUrlMatch[1] : "https://example.com";
    let competitorName = "Target Software";
    try {
      if (competitorUrl.startsWith("http")) {
        competitorName = new URL(competitorUrl).hostname.replace('www.', '');
      }
    } catch { /* ignore */ }

    // Derive a gorgeous dynamic brand color from the host string
    const colors = ["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e"];
    const charSum = competitorName.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const primaryColor = colors[charSum % colors.length];

    brand_context = {
      target_url: competitorUrl,
      primary_color: primaryColor,
      theme: "dark" as "light" | "dark"
    };

    side_by_side_comparison = {
      competitor_name: competitorName,
      competitor_url: competitorUrl,
      features: [
        {
          feature_name: "Client Dashboard & Navigation",
          competitor_implementation: "Static sidebars with outdated generic web-views that force full page reloads.",
          bridgebox_implementation: "Ultra-fast Next.js React-based glassmorphic UI featuring instant SPA transitions.",
          advantage: "Modern premium SaaS aesthetic delivering 3x faster operator workflows."
        },
        {
          feature_name: "Automated Data Processing",
          competitor_implementation: "Clunky manual multipart forms averaging 14 clicks per unique client record.",
          bridgebox_implementation: "Native AI document ingestion parsing structures seamlessly in the background.",
          advantage: "Erases ~12 hours of weekly repetitive admin overhead entirely."
        },
        {
          feature_name: "Custom Workflow Pipelines",
          competitor_implementation: "Rigid, hardcoded approval logics completely locked behind vendor architecture.",
          bridgebox_implementation: "A highly visual drag-and-drop state machine opening webhooks for 3rd party syncs.",
          advantage: "Ultimate ownership. Zero structural lock-in modifying your core delivery cycle."
        }
      ]
    };
  }

  return {
    business_summary: businessSummary,
    feature_list: features,
    workflow_breakdown: workflows,
    side_by_side_comparison,
    brand_context,
    ui_structure: [
      {
        screen_name: "Master Control Dashboard",
        layout_type: "dashboard",
        components: [
          "Global Navigation",
          "Metric KPI Cards",
          "Recent Activity Feed",
          "Quick Action Floating Menu",
        ],
        interactions: [
          "Click KPI to open drilldown",
          "Drag components to re-arrange layout",
        ],
        data_displayed: [
          "Aggregated total metrics",
          "Real-time task graphs",
          "User session indicators",
        ],
      },
      {
        screen_name: "Workflow & Operations Hub",
        layout_type: "kanban",
        components: [
          "Interactive Kanban Board",
          "Data Grid Table",
          "Contextual Insight Panel",
          "Export Utility",
        ],
        interactions: [
          "Drag-and-drop status lanes",
          "Row multi-select",
          "Right-click context actions",
        ],
        data_displayed: [
          "Active task entities",
          "Assigned operators",
          "Workflow timestamps",
          "Priority severity flags",
        ],
      },
      {
        screen_name: "Deep Detail View",
        layout_type: "detail",
        components: [
          "Omni-Search Bar",
          "Properties Sandbox",
          "Historical Audit Log",
          "Relation Graph Modal",
        ],
        interactions: [
          "Inline edit properties",
          "Expand complex nested data",
          "Hover to view audit diffs",
        ],
        data_displayed: [
          "Core entity properties",
          "Relational foreign keys",
          "Calculated formulas",
        ],
      },
    ],
    data_model_hypothesis: [],
    integration_map: [],
    automation_opportunities: automations,
    risks_and_gaps: risks,
    implementation_plan: implementationPlan,
    confidence_score: confidence,
    request_classification: requestType,
  };
}
