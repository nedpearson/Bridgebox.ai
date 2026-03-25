import { intelligenceGraph } from '../graph/IntelligenceGraph';
import type { GraphNode, NodeType } from '../graph/types';
import { AIProviderFactory } from '../providers';

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

export class CopilotEngine {
  /**
   * Main entrypoint for the newly architected context-aware LLM reasoning core.
   * Extracts user prompt, validates RBAC via Graph nodes, and hits the RAG AI models.
   */
  public async generateReasonedResponse(
    userPrompt: string,
    systemContext: UserContext,
    domContext: DOMContext
  ): Promise<{ text: string; provenance: GraphNode[], execution_time_ms: number }> {
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

    // 3. Assemble Grounding Pipeline Prompt
    const systemInstruction = this.buildContextualSystemPrompt(
      authorizedNodes,
      contextNodes,
      domContext,
      systemContext.role
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
      });

      return {
        text: response.content.trim(),
        provenance: contextNodes.length > 0 ? contextNodes : authorizedNodes.slice(0, 3), // Return the matching nodes
        execution_time_ms: Date.now() - startTime
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
    userRole: string
  ): string {
    const activeModuleDescription = contextNodes.length > 0 
      ? `\nActive Focus Area: The user is currently looking at: ${contextNodes[0].name}. Description: ${contextNodes[0].description}`
      : '\nActive Focus Area: The user is on a general dashboard.';

    const domActions = (domContext.onScreenActions && domContext.onScreenActions.length > 0)
      ? `\nVisible Actions on screen: ${domContext.onScreenActions.join(', ')}.`
      : '';

    const payload = `
You are the Bridgebox Super AI Intelligence Copilot.
You have absolute knowledge of the platform capabilities strictly governed by what is provided in this prompt context. 
NEVER hallucinate features, menus, buttons, or workflows that do not exist within the context.

Current User Role: ${userRole}. Only suggest actions or pages available to this role.

CRITICAL SECURITY DIRECTIVE (TENANT ISOLATION):
You are operating in a multi-tenant environment. When generating strategies, discussing database capabilities, or explaining data visibility, recognize that users can ONLY access data belonging to their own organization. You MUST NOT reveal or suggest queries for internal recording UUIDs, internal Dev/QA artifacts, or Super Admin routing paths unless the User Role explicitly equals "super_admin".

${activeModuleDescription}${domActions}

ACTIVE CONTEXT KNOWLEDGE BASE (Deep Dive):
${contextNodes.length > 0 
  ? contextNodes.map((n, i) => `${i + 1}. [${n.type.toUpperCase()}] ${n.name} (ID: ${n.id})\nDescription: ${n.description}\nActions: ${n.actions.map(a => a.name).join(', ')}`).join('\n')
  : 'The user is not actively viewing a deep-mapped module. Utilize general knowledge.'}

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
