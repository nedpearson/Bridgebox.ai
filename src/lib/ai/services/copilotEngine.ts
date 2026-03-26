import { intelligenceGraph } from '../graph/IntelligenceGraph';
import type { GraphNode, NodeType } from '../graph/types';
import { AIProviderFactory } from '../providers';
import { supabase } from '../../supabase';

export type UserContext = {
  role: string;
  organizationId: string | null;
  userId: string;
};

export type DOMContext = {
  activeModule?: string;
  activeRecordId?: string;
  activeRecordType?: string;
  pageTitle?: string;
  visibleMetrics?: Record<string, string | number>;
  onScreenActions?: string[];
};

const PLATFORM_TOOLS = [
  {
    type: "function",
    function: {
      name: "create_global_task",
      description: "Creates a new task in the platform.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "The task title" },
          description: { type: "string", description: "Detailed description of the task" },
          priority: { type: "string", enum: ["low", "medium", "high"], description: "Task priority" }
        },
        required: ["title", "priority"]
      }
    }
  },
  {
    type: "function",
    function: {
        name: "update_project_target_date",
        description: "Updates the target completion date for a given project.",
        parameters: {
             type: "object",
             properties: {
                 project_id: { type: "string", description: "The UUID of the project" },
                 new_target_date: { type: "string", description: "The new target date in YYYY-MM-DD format" },
                 reason: { type: "string", description: "Reason for the date change." }
             },
             required: ["project_id", "new_target_date"]
        }
    }
  },
  {
    type: "function",
    function: {
        name: "draft_autonomous_email",
        description: "Generates an intelligent unblocking email draft for an overdue or stalled task natively mapped to an edge extraction node.",
        parameters: {
             type: "object",
             properties: {
                 task_id: { type: "string", description: "The UUID of the blocked task" },
                 context_notes: { type: "string", description: "Any specific notes the Copilot wants to include in the email draft inference." }
             },
             required: ["task_id"]
        }
    }
  }
];

export class CopilotEngine {
  /**
   * Main entrypoint for the newly architected context-aware LLM reasoning core.
   * Extracts user prompt, validates RBAC via Graph nodes, and hits the RAG AI models.
   */
  public async generateReasonedResponse(
    userPrompt: string,
    systemContext: UserContext,
    domContext: DOMContext
  ): Promise<{ text: string; provenance: GraphNode[], execution_time_ms: number, tool_calls?: any[] }> {
    const startTime = Date.now();
    const provider = AIProviderFactory.getProvider();
    
    if (!provider.isConfigured()) {
      return {
        text: "The AI Copilot Intelligence layer is disabled because no AI provider is configured.",
        provenance: [],
        execution_time_ms: 0
      };
    }

    // 1. Resolve which nodes the user is allowed to "know" about
    const authorizedNodes = intelligenceGraph.getNodesByRoleScope(systemContext.role);
    
    // 2. Extract DOM matching nodes
    const contextNodes: GraphNode[] = [];
    if (domContext.activeModule) {
      const parent = authorizedNodes.find(n => n.id === domContext.activeModule);
      if (parent) {
        contextNodes.push(parent);
        parent.relatedNodes.forEach(id => {
          const relation = authorizedNodes.find(n => n.id === id);
          if (relation) contextNodes.push(relation);
        });
      }
    }

    // 3. Optional: Semantic Vector Search
    let semanticContext = '';
    if (provider.generateEmbedding && systemContext.organizationId) {
      try {
        const embedding = await provider.generateEmbedding(userPrompt);
        const { data: vectorMatches, error } = await supabase.rpc('match_platform_embeddings', {
          query_embedding: embedding,
          match_threshold: 0.7,
          match_count: 5,
          p_organization_id: systemContext.organizationId
        });

        if (!error && vectorMatches && vectorMatches.length > 0) {
          semanticContext = `\n\nSEMANTIC VECTOR MATCHES (Relevant Historical Records):\n` +
            vectorMatches.map((m: any, i: number) => 
              `${i + 1}. [${m.entity_type.toUpperCase()}] Content: ${m.content} (Similarity: ${(m.similarity * 100).toFixed(1)}%)`
            ).join('\n');
        }
      } catch (err) {
        console.warn('Vector proximity search failed silently:', err);
      }
    }

    // 4. Determine Specialized Multi-Agent Route
    let dynamicPersona = "You are the Bridgebox Master Copilot. You are a helpful, capable assistant overseeing the general relational OS.";
    try {
      const { data, error } = await supabase.functions.invoke('agent-router', {
          body: { prompt: userPrompt }
      });
      if (!error && data?.agent) {
          if (data.agent === 'finance') {
             dynamicPersona = "You are the Bridgebox Finance Agent. You specialize in analyzing budgets, MRR, billing, payments, and financial timelines. You are highly analytical and strict.";
          } else if (data.agent === 'operations') {
             dynamicPersona = "You are the Bridgebox Operations Agent. You specialize in resolving blockers, escalating overdue tasks, resource allocation, and workflow unblocking. You are highly action-oriented.";
          }
      }
    } catch (routeErr) {
       console.warn("Routing delegation failed softly, falling back to General Copilot", routeErr);
    }

    // 5. Assemble Grounding Pipeline Prompt
    const systemInstruction = this.buildContextualSystemPrompt(
      authorizedNodes,
      contextNodes,
      domContext,
      systemContext.role,
      semanticContext,
      dynamicPersona
    );

    const messages = [
      { role: 'system' as const, content: systemInstruction },
      { role: 'user' as const, content: userPrompt }
    ];

    try {
      const response = await provider.complete({
        messages,
        temperature: 0.2, // Low temperature for high precision grounding
        maxTokens: 1000,
        tools: PLATFORM_TOOLS
      });

      return {
        text: response.content ? response.content.trim() : "Proposed system action:",
        provenance: contextNodes.length > 0 ? contextNodes : authorizedNodes.slice(0, 3), // Return the matching nodes
        execution_time_ms: Date.now() - startTime,
        tool_calls: response.tool_calls
      };
    } catch (e: any) {
      console.error('Copilot Engine RAG Execution Error', e);
      return {
        text: "An error occurred while securely resolving your query against the Bridgebox Intelligence Graph.",
        provenance: [],
        execution_time_ms: Date.now() - startTime
      };
    }
  }

  private buildContextualSystemPrompt(
    authorizedNodes: GraphNode[],
    contextNodes: GraphNode[],
    domContext: DOMContext,
    userRole: string,
    semanticContext: string,
    dynamicPersona: string
  ): string {
    const activeModuleDescription = contextNodes.length > 0 
      ? `\nActive Focus Area: The user is currently looking at: ${contextNodes[0].name}. Description: ${contextNodes[0].description}`
      : '\nActive Focus Area: The user is on a general dashboard.';

    const domActions = (domContext.onScreenActions && domContext.onScreenActions.length > 0)
      ? `\nVisible Actions on screen: ${domContext.onScreenActions.join(', ')}.`
      : '';

    const payload = `
${dynamicPersona}
You have absolute knowledge of the platform capabilities strictly governed by what is provided in this prompt context. 
NEVER hallucinate features, menus, buttons, or workflows that do not exist within the context.

Current User Role: ${userRole}. Only suggest actions or pages available to this role.

CRITICAL SECURITY DIRECTIVE (TENANT ISOLATION):
You are operating in a multi-tenant environment. When generating strategies, discussing database capabilities, or explaining data visibility, recognize that users can ONLY access data belonging to their own organization. You MUST NOT reveal or suggest queries for internal recording UUIDs, internal Dev/QA artifacts, or Super Admin routing paths unless the User Role explicitly equals "super_admin".

${activeModuleDescription}${domActions}

ACTIVE CONTEXT KNOWLEDGE BASE (Deep Dive):
${contextNodes.length > 0 
  ? contextNodes.map((n, i) => `${i + 1}. [${n.type.toUpperCase()}] ${n.name} (ID: ${n.id})\nDescription: ${n.description}\nActions: ${(n.actions || []).map(a => a.name).join(', ')}`).join('\n')
  : 'The user is not actively viewing a deep-mapped module. Utilize general knowledge.'}
${semanticContext}

PLATFORM MODULE DIRECTORY (Global Overview):
${authorizedNodes.map((n) => `- ${n.name} (${n.id})`).join('\n')}

OPERATIONAL MODES (Implicitly adopt the best mode based on the user's question):
1. Navigation Mode: Tell them exactly where to go.
2. How-To Mode: Step-by-step guidance.
3. Capability Mode: Answer what the software can/cannot do.
4. Data Meaning Mode: Explain fields and statuses on the current screen.
5. Troubleshooting Mode: Check blocked permissions or configs.

RULES:
- Answer confidently based on the knowledge base.
- If uncertain, explain that the answer depends on configuration and point them towards the relevant module above.
- If you recommend an interactive action from the ACTIVE CONTEXT KNOWLEDGE BASE, you MUST render it as a clickable button using this exact markdown token format: [Action:action_id|Button Label]. Example: [Action:add_lead|Create New Lead]
- Never write raw markdown code blocks unless explicitly requested. 
- Format your response for a beautiful chat UI.
    `.trim();

    return payload;
  }
}

export const copilotEngine = new CopilotEngine();
