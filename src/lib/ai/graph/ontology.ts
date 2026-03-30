import type { GraphNode } from "./types";

const timestamp = new Date().toISOString();

export const bridgeboxOntology: GraphNode[] = [
  // COGNITIVE LAYER
  {
    id: "module:copilot",
    name: "Super AI Copilot Workspace",
    type: "module",
    description:
      "The central AI command center, accessing the Bridgebox Intelligence Graph to reason across organizational data, execute workflows, and summarize analytics.",
    relatedNodes: ["page:copilot"],
    visibility: {
      roles: [
        "super_admin",
        "tenant_admin",
        "manager",
        "agent",
        "client_admin",
        "client_user",
      ],
    },
    actions: [],
    sourceOfTruth: "static",
    updatedAt: timestamp,
  },

  // RELATIONAL GRAPH MATRIX
  {
    id: "module:relational_core",
    name: "Relational Graph Engine & Command Center",
    type: "module",
    description:
      "The connective tissue of the Bridgebox OS. Allows Tasks, Documents, Communications, and Workflows to be dynamically bound to any Client, Project, or generic entity node via the `entity_links` matrix. Powered by the Relational Command Center UI tabs.",
    relatedNodes: [
      "module:crm",
      "module:delivery",
      "module:automations",
      "module:support",
    ],
    visibility: {
      roles: [
        "super_admin",
        "tenant_admin",
        "manager",
        "agent",
        "client_admin",
        "client_user",
      ],
    },
    actions: [],
    sourceOfTruth: "static",
    updatedAt: timestamp,
  },

  // CRM / SALES
  {
    id: "module:crm",
    name: "CRM & Lead Management",
    type: "module",
    description:
      "The commercial engine parsing inbound sales opportunities. Includes robust pipeline visualization, conversion tracking, AI-assisted lead scoring, and automated task generation.",
    relatedNodes: ["page:pipeline", "page:leads_list"],
    visibility: { roles: ["super_admin", "tenant_admin", "manager", "agent"] },
    actions: [],
    sourceOfTruth: "static",
    updatedAt: timestamp,
  },
  {
    id: "page:pipeline",
    name: "Sales Pipeline Kanban",
    type: "page",
    description:
      "A visual drag-and-drop board displaying lead progression from New to Converted/Lost. Automatically calculates stage velocities and aggregates potential budget ranges.",
    route: "/app/pipeline",
    relatedNodes: ["module:crm"],
    visibility: { roles: ["super_admin", "tenant_admin", "manager", "agent"] },
    actions: [],
    sourceOfTruth: "static",
    updatedAt: timestamp,
  },

  // DELIVERY / PROJECTS
  {
    id: "module:delivery",
    name: "Project Implementation Center",
    type: "module",
    description:
      "Manages post-sale execution. Tracks critical path milestones, active implementation risks, developer workloads, and deployment schedules.",
    relatedNodes: ["page:projects_list", "page:implementation_center"],
    visibility: {
      roles: [
        "super_admin",
        "tenant_admin",
        "manager",
        "agent",
        "client_admin",
      ],
    },
    actions: [],
    sourceOfTruth: "static",
    updatedAt: timestamp,
  },

  // AUTOMATIONS
  {
    id: "module:automations",
    name: "Workflow Engine",
    type: "module",
    description:
      "A dedicated node-based workflow builder enabling reactive systems. Monitors CRM/Billing triggers and executes outbound actions like Emails, Alerts, and Stage updates.",
    relatedNodes: ["page:workflows_list"],
    visibility: { roles: ["super_admin", "tenant_admin", "manager"] },
    actions: [],
    sourceOfTruth: "static",
    updatedAt: timestamp,
  },

  // SUPPORT
  {
    id: "module:support",
    name: "Support Operations Hub",
    type: "module",
    description:
      "Client-facing and internal ticketing system. Aggregates bug reports, screen recordings, and priority queries into a triage queue feeding the engineering floor.",
    relatedNodes: ["page:support_queue"],
    visibility: {
      roles: [
        "super_admin",
        "tenant_admin",
        "manager",
        "agent",
        "client_admin",
        "client_user",
      ],
    },
    actions: [],
    sourceOfTruth: "static",
    updatedAt: timestamp,
  },

  // EXECUTIVE ANALYTICS
  {
    id: "module:analytics",
    name: "Executive Analytics & Insights",
    type: "module",
    description:
      "Aggregated macro-level reporting surfacing conversion ratios, churn risk, SLA adherence, and MRR. The intelligence engine regularly parses this module to alert administrators independently.",
    relatedNodes: ["page:analytics_dashboard", "page:conversions"],
    visibility: { roles: ["super_admin", "tenant_admin", "manager"] },
    actions: [],
    sourceOfTruth: "static",
    updatedAt: timestamp,
  },

  // ADMIN RECORDING CENTER (Secret / Internal Only)
  {
    id: "module:recording_center",
    name: "Super Admin Recording & Observability Center",
    type: "module",
    description:
      "Highly restricted master observatory. Records internal interactions, audits API traces, triggers internal Bug & Dev QA generations via Copilot, maps underlying cluster health, and provides autonomous AI validation simulation logic natively to admins.",
    relatedNodes: [
      "page:admin_logs",
      "page:ai_pipeline_monitor",
      "page:bug_reports",
      "page:dev_tasks",
      "page:qa_test_cases",
      "page:ai_validation_suite",
    ],
    visibility: { roles: ["super_admin"] },
    actions: [],
    sourceOfTruth: "static",
    updatedAt: timestamp,
  },
];
