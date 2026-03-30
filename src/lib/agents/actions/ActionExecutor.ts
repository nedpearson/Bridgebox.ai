// @ts-nocheck
import { supabase } from "../../supabase";
import type {
  AgentAction,
  ActionExecutionContext,
  ActionExecutionResult,
  ActionHandler,
  ActionType,
} from "../types";

class FlagHighValueLeadHandler implements ActionHandler {
  canHandle(actionType: ActionType): boolean {
    return actionType === "flag_high_value_lead";
  }

  async validate(
    action: AgentAction,
  ): Promise<{ valid: boolean; error?: string }> {
    const leadId = action.payload.parameters?.lead_id;
    if (!leadId) {
      return { valid: false, error: "Lead ID is required" };
    }
    return { valid: true };
  }

  async execute(
    context: ActionExecutionContext,
  ): Promise<ActionExecutionResult> {
    const leadId = context.action.payload.parameters?.lead_id;

    if (context.dry_run) {
      return {
        success: true,
        result: { dry_run: true, lead_id: leadId },
        executed_at: new Date().toISOString(),
      };
    }

    try {
      const { error } = await supabase
        .from("bb_leads")
        .update({
          priority: "high",
          tags: supabase.raw("array_append(tags, ?)", ["high-value"]),
        })
        .eq("id", leadId);

      if (error) throw error;

      return {
        success: true,
        result: { lead_id: leadId, flag_added: "high-value" },
        executed_at: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        executed_at: new Date().toISOString(),
      };
    }
  }
}

class FlagDeliveryRiskHandler implements ActionHandler {
  canHandle(actionType: ActionType): boolean {
    return actionType === "flag_delivery_risk";
  }

  async validate(
    action: AgentAction,
  ): Promise<{ valid: boolean; error?: string }> {
    const projectId = action.payload.parameters?.project_id;
    if (!projectId) {
      return { valid: false, error: "Project ID is required" };
    }
    return { valid: true };
  }

  async execute(
    context: ActionExecutionContext,
  ): Promise<ActionExecutionResult> {
    const { project_id, risk_type, severity } =
      context.action.payload.parameters || {};

    if (context.dry_run) {
      return {
        success: true,
        result: { dry_run: true, project_id },
        executed_at: new Date().toISOString(),
      };
    }

    try {
      const { data: healthRecord, error: healthError } = await supabase
        .from("bb_client_health_scores")
        .select("id")
        .eq("project_id", project_id)
        .single();

      if (healthRecord) {
        await supabase.from("bb_client_risks").insert({
          health_score_id: healthRecord.id,
          risk_type: risk_type || "delivery_delay",
          severity: severity || "medium",
          description: `Flagged by AI: ${context.action.description}`,
          identified_at: new Date().toISOString(),
          status: "open",
        });
      }

      return {
        success: true,
        result: { project_id, risk_flagged: true },
        executed_at: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        executed_at: new Date().toISOString(),
      };
    }
  }
}

class EscalateUrgentIssueHandler implements ActionHandler {
  canHandle(actionType: ActionType): boolean {
    return actionType === "escalate_urgent_issue";
  }

  async validate(
    action: AgentAction,
  ): Promise<{ valid: boolean; error?: string }> {
    const ticketId = action.payload.parameters?.ticket_id;
    if (!ticketId) {
      return { valid: false, error: "Ticket ID is required" };
    }
    return { valid: true };
  }

  async execute(
    context: ActionExecutionContext,
  ): Promise<ActionExecutionResult> {
    const ticketId = context.action.payload.parameters?.ticket_id;

    if (context.dry_run) {
      return {
        success: true,
        result: { dry_run: true, ticket_id: ticketId },
        executed_at: new Date().toISOString(),
      };
    }

    try {
      const { error } = await supabase
        .from("bb_support_tickets")
        .update({
          priority: "urgent",
          escalated: true,
          escalated_at: new Date().toISOString(),
        })
        .eq("id", ticketId);

      if (error) throw error;

      return {
        success: true,
        result: { ticket_id: ticketId, escalated: true },
        executed_at: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        executed_at: new Date().toISOString(),
      };
    }
  }
}

export class ActionExecutor {
  private handlers: ActionHandler[] = [
    new FlagHighValueLeadHandler(),
    new FlagDeliveryRiskHandler(),
    new EscalateUrgentIssueHandler(),
  ];

  async executeAction(
    context: ActionExecutionContext,
  ): Promise<ActionExecutionResult> {
    const handler = this.handlers.find((h) =>
      h.canHandle(context.action.action_type),
    );

    if (!handler) {
      return {
        success: false,
        error: `No handler found for action type: ${context.action.action_type}`,
        executed_at: new Date().toISOString(),
      };
    }

    const validation = await handler.validate(context.action);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error || "Validation failed",
        executed_at: new Date().toISOString(),
      };
    }

    if (
      context.action.requires_approval &&
      context.action.status !== "approved"
    ) {
      return {
        success: false,
        error: "Action requires approval before execution",
        executed_at: new Date().toISOString(),
      };
    }

    return handler.execute(context);
  }

  registerHandler(handler: ActionHandler): void {
    this.handlers.push(handler);
  }
}

export const actionExecutor = new ActionExecutor();
