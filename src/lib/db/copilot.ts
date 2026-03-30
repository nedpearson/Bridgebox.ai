import { supabase } from "../supabase";

export type ContextType =
  | "general"
  | "crm"
  | "project"
  | "support"
  | "automation"
  | "analytics";
export type MessageRole = "user" | "assistant" | "system";
export type SuggestionType =
  | "workflow"
  | "automation"
  | "next_step"
  | "risk_alert"
  | "opportunity";
export type Priority = "low" | "medium" | "high" | "urgent";
export type SuggestionStatus = "pending" | "accepted" | "dismissed";

export interface CopilotConversation {
  id: string;
  user_id: string;
  organization_id: string | null;
  title: string;
  context_type: ContextType;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface CopilotMessage {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface CopilotSuggestion {
  id: string;
  user_id: string;
  organization_id: string | null;
  suggestion_type: SuggestionType;
  title: string;
  description: string | null;
  context: Record<string, any>;
  priority: Priority;
  status: SuggestionStatus;
  created_at: string;
  updated_at: string;
}

export const CONTEXT_TYPE_LABELS: Record<ContextType, string> = {
  general: "General",
  crm: "CRM & Leads",
  project: "Projects",
  support: "Support",
  automation: "Automation",
  analytics: "Analytics",
};

export const SUGGESTION_TYPE_LABELS: Record<SuggestionType, string> = {
  workflow: "Workflow Optimization",
  automation: "Automation Opportunity",
  next_step: "Suggested Next Step",
  risk_alert: "Risk Alert",
  opportunity: "Growth Opportunity",
};

export const PRIORITY_COLORS: Record<
  Priority,
  { bg: string; text: string; border: string }
> = {
  low: {
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    border: "border-slate-500/20",
  },
  medium: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
  },
  high: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
  },
  urgent: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/20",
  },
};

class CopilotService {
  async getConversations(
    userId: string,
    includeArchived = false,
  ): Promise<CopilotConversation[]> {
    let query = supabase
      .from("bb_copilot_conversations")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (!includeArchived) {
      query = query.eq("is_archived", false);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async getConversationById(id: string): Promise<CopilotConversation | null> {
    const { data, error } = await supabase
      .from("bb_copilot_conversations")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createConversation(
    userId: string,
    organizationId: string | null,
    contextType: ContextType = "general",
  ): Promise<CopilotConversation> {
    const { data, error } = await supabase
      .from("bb_copilot_conversations")
      .insert({
        user_id: userId,
        organization_id: organizationId,
        context_type: contextType,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateConversation(
    id: string,
    updates: Partial<CopilotConversation>,
  ): Promise<CopilotConversation> {
    const { data, error } = await supabase
      .from("bb_copilot_conversations")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async archiveConversation(id: string): Promise<void> {
    const { error } = await supabase
      .from("bb_copilot_conversations")
      .update({ is_archived: true })
      .eq("id", id);

    if (error) throw error;
  }

  async deleteConversation(id: string): Promise<void> {
    const { error } = await supabase
      .from("bb_copilot_conversations")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async getMessages(conversationId: string): Promise<CopilotMessage[]> {
    const { data, error } = await supabase
      .from("bb_copilot_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createMessage(
    conversationId: string,
    role: MessageRole,
    content: string,
    metadata: Record<string, any> = {},
  ): Promise<CopilotMessage> {
    const { data, error } = await supabase
      .from("bb_copilot_messages")
      .insert({
        conversation_id: conversationId,
        role,
        content,
        metadata,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getSuggestions(
    userId: string,
    filters?: {
      status?: SuggestionStatus;
      type?: SuggestionType;
      priority?: Priority;
    },
  ): Promise<CopilotSuggestion[]> {
    let query = supabase
      .from("bb_copilot_suggestions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.type) {
      query = query.eq("suggestion_type", filters.type);
    }

    if (filters?.priority) {
      query = query.eq("priority", filters.priority);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async createSuggestion(
    userId: string,
    organizationId: string | null,
    type: SuggestionType,
    title: string,
    description: string | null,
    context: Record<string, any> = {},
    priority: Priority = "medium",
  ): Promise<CopilotSuggestion> {
    const { data, error } = await supabase
      .from("bb_copilot_suggestions")
      .insert({
        user_id: userId,
        organization_id: organizationId,
        suggestion_type: type,
        title,
        description,
        context,
        priority,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSuggestionStatus(
    id: string,
    status: SuggestionStatus,
  ): Promise<void> {
    const { error } = await supabase
      .from("bb_copilot_suggestions")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  }

  async generateResponse(
    userMessage: string,
    conversationId: string,
    contextType: ContextType,
    userId?: string,
  ): Promise<string> {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes("lead") || lowerMessage.includes("crm")) {
      return this.generateCRMResponse(lowerMessage);
    }

    if (lowerMessage.includes("project") || lowerMessage.includes("delivery")) {
      return this.generateProjectResponse(lowerMessage);
    }

    if (lowerMessage.includes("support") || lowerMessage.includes("ticket")) {
      return this.generateSupportResponse(lowerMessage);
    }

    if (lowerMessage.includes("automat") || lowerMessage.includes("workflow")) {
      return this.generateAutomationResponse(lowerMessage);
    }

    if (
      lowerMessage.includes("invoice") ||
      lowerMessage.includes("billing") ||
      lowerMessage.includes("payment")
    ) {
      return this.generateBillingResponse(lowerMessage);
    }

    if (lowerMessage.includes("onboard")) {
      return "I can help with onboarding! New clients should complete the onboarding flow to set up their organization, define goals, and connect systems. Would you like to see onboarding status or knowledge base articles?";
    }

    if (lowerMessage.includes("help") || lowerMessage.includes("how")) {
      return "I'm here to help you navigate Bridgebox! You can ask me about:\n\n- Lead management and CRM\n- Project status and delivery\n- Support tickets and responses\n- Automation rules and workflows\n- Billing and invoices\n- Analytics and insights\n- Knowledge base articles\n\nWhat would you like to know more about?";
    }

    const responses: Record<ContextType, string[]> = {
      general: [
        "I can help you navigate Bridgebox! I can assist with leads, projects, support tickets, and more. What would you like to know?",
        "I'm here to help! You can ask me about your CRM data, project status, automations, or how to use specific features.",
        "Welcome! I can provide insights on your business operations, suggest workflows, and help you get the most out of Bridgebox.",
      ],
      crm: [
        "I can help you analyze your leads and suggest follow-up actions. Try asking about lead status, pipeline conversion, or next steps.",
        "Looking at your CRM, I can help prioritize leads, suggest automation rules, or provide insights on conversion rates.",
      ],
      project: [
        "I can provide status updates on your active projects and highlight any potential risks. Ask me about specific projects or overall metrics.",
        "Your projects are tracked in the delivery system. I can help identify blockers, review timelines, or suggest resource allocation.",
      ],
      support: [
        "I can help you manage support tickets more efficiently. Ask about open tickets, response suggestions, or knowledge base articles.",
        "Looking at your support queue, I can help prioritize tickets by urgency or identify patterns that might indicate product issues.",
      ],
      automation: [
        "I've identified several workflow opportunities that could be automated. Ask me about automation rules, triggers, or integration points.",
        "Based on your operations, I can suggest automation rules for lead assignment, project creation, or risk flagging.",
      ],
      analytics: [
        "I can provide insights from your business data. Ask about conversion rates, project success metrics, or revenue trends.",
        "Your analytics show patterns across CRM, delivery, and support. What metrics would you like to explore?",
      ],
    };

    const contextResponses = responses[contextType];
    const randomResponse =
      contextResponses[Math.floor(Math.random() * contextResponses.length)];

    return randomResponse;
  }

  private generateCRMResponse(message: string): string {
    if (message.includes("status") || message.includes("how many")) {
      return "To check your lead status, navigate to the Leads page where you can see all leads organized by stage. I can help you filter by status, budget, or timeline. The Pipeline view shows your conversion funnel across stages.";
    }

    if (message.includes("next step") || message.includes("follow up")) {
      return "For effective lead follow-up:\n\n1. Review leads in 'contacted' stage that haven't been updated in 3+ days\n2. Send proposal to qualified leads in 'qualified' stage\n3. Schedule demos for interested prospects\n4. Set up automation rules for automatic lead assignment and follow-up reminders";
    }

    if (message.includes("convert") || message.includes("close")) {
      return "To improve lead conversion:\n\n- Focus on high-budget leads ($50K+) first\n- Ensure all qualified leads have proposals within 48 hours\n- Use the knowledge base to share case studies relevant to their industry\n- Set up automation to flag leads inactive for 5+ days";
    }

    return "I can help you manage leads more effectively. The CRM tracks leads from initial contact through conversion. You can set up automation rules to assign leads, send notifications, and flag opportunities. What specific aspect would you like to focus on?";
  }

  private generateProjectResponse(message: string): string {
    if (message.includes("status") || message.includes("progress")) {
      return "To view project status:\n\n1. Go to Projects page for overview of all active projects\n2. Use the Delivery view to see milestones and deliverables\n3. Check the Implementation Center for deployment tracking\n4. Review health indicators (green/yellow/red) for at-risk projects";
    }

    if (
      message.includes("risk") ||
      message.includes("delay") ||
      message.includes("block")
    ) {
      return "To address project risks:\n\n- Review projects marked yellow or red in health status\n- Check for overdue deliverables in the Delivery view\n- Look at Implementation Center for deployment blockers\n- Client Success system tracks risks across all client touchpoints";
    }

    if (message.includes("timeline") || message.includes("deadline")) {
      return "Project timelines are managed through:\n\n- Milestones in the Delivery system\n- Deployment phases in Implementation Center\n- Automatic risk flagging for overdue items\n- Client Success tracking for timeline impacts on health score";
    }

    return "I can help you monitor project delivery! Projects connect to the Implementation Center for deployment tracking, Client Success for health monitoring, and Support for issue resolution. What aspect of project management do you need help with?";
  }

  private generateSupportResponse(message: string): string {
    if (message.includes("open") || message.includes("pending")) {
      return "To manage open tickets:\n\n1. Go to Support Queue to see all active tickets\n2. Prioritize urgent and high-priority tickets first\n3. Use Knowledge Base to find solutions for common issues\n4. High-volume tickets automatically create risk alerts in Client Success";
    }

    if (message.includes("response") || message.includes("reply")) {
      return "For efficient ticket responses:\n\n- Check Knowledge Base for documented solutions\n- Review similar past tickets for effective responses\n- Urgent tickets automatically flag risks in Client Success system\n- Set up automation to notify team of high-priority tickets";
    }

    if (message.includes("knowledge") || message.includes("documentation")) {
      return "The Knowledge Base integrates with support:\n\n- Create articles from resolved tickets\n- Share relevant docs with clients during onboarding\n- Link articles in ticket responses\n- Track which articles are most helpful";
    }

    return "I can help you manage support tickets! The support system connects to the Knowledge Base for solutions, Client Success for risk tracking, and Automation for ticket routing. What support area needs attention?";
  }

  private generateAutomationResponse(message: string): string {
    if (
      message.includes("create") ||
      message.includes("set up") ||
      message.includes("add")
    ) {
      return "To create automation rules:\n\n1. Go to Automations page\n2. Click 'New Rule'\n3. Select trigger (lead created, proposal approved, etc.)\n4. Define conditions (budget, type, priority)\n5. Choose action (assign member, create project, flag risk)\n\nPopular automations: auto-assign leads, create projects from approved proposals, flag risks for overdue invoices.";
    }

    if (message.includes("recommend") || message.includes("suggest")) {
      return "Recommended automations based on common workflows:\n\n- Auto-assign new leads using round-robin distribution\n- Create projects automatically when proposals are approved\n- Flag client success risks for high-priority support tickets\n- Send notifications for overdue invoices\n- Create tasks when onboarding is completed";
    }

    return "Automation rules connect all parts of Bridgebox:\n\n- CRM triggers from leads and proposals\n- Project creation from onboarding completion\n- Risk flags sent to Client Success\n- Support ticket routing and escalation\n- Invoice reminders through billing system\n\nWhat process would you like to automate?";
  }

  private generateBillingResponse(message: string): string {
    if (message.includes("overdue") || message.includes("late")) {
      return "For overdue invoices:\n\n1. Check Billing page for payment status\n2. Automation can send automatic reminders\n3. Overdue invoices (30+ days) create risk alerts in Client Success\n4. Set up escalation rules for critical overdue amounts";
    }

    if (message.includes("subscription") || message.includes("plan")) {
      return "Subscription management:\n\n- View current plan and usage in Billing\n- Subscriptions sync with Stripe automatically\n- Plan changes affect feature access immediately\n- Client Success tracks billing health as part of overall score";
    }

    return "Billing integrates across Bridgebox:\n\n- Stripe sync for payments and subscriptions\n- Automatic risk alerts for overdue invoices\n- Client Success health score factors in payment status\n- Automation rules for payment reminders\n\nWhat billing aspect do you need help with?";
  }

  async generateConversationTitle(messages: CopilotMessage[]): Promise<string> {
    if (messages.length === 0) return "New Conversation";

    const firstUserMessage = messages.find((m) => m.role === "user");
    if (!firstUserMessage) return "New Conversation";

    const words = firstUserMessage.content.split(" ").slice(0, 6);
    return (
      words.join(" ") +
      (firstUserMessage.content.split(" ").length > 6 ? "..." : "")
    );
  }
}

export const copilotService = new CopilotService();
