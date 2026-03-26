import { supabase } from '../supabase';
import type {
  Workflow,
  WorkflowStep,
  WorkflowExecution,
  WorkflowStepExecution,
  WorkflowTemplate,
  WorkflowWithSteps,
  WorkflowExecutionDetail,
  WorkflowStats,
  WorkflowCategory,
  WorkflowTriggerType,
  WorkflowExecutionStatus,
} from '../../types/workflow';

class WorkflowService {
  async getWorkflows(organizationId: string): Promise<Workflow[]> {
    const { data, error } = await supabase
      .from('bb_workflows')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_template', false)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getWorkflowById(workflowId: string): Promise<Workflow | null> {
    const { data, error } = await supabase
      .from('bb_workflows')
      .select('*')
      .eq('id', workflowId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getWorkflowWithSteps(workflowId: string): Promise<WorkflowWithSteps | null> {
    const { data: workflow, error: workflowError } = await supabase
      .from('bb_workflows')
      .select('*')
      .eq('id', workflowId)
      .maybeSingle();

    if (workflowError) throw workflowError;
    if (!workflow) return null;

    const { data: steps, error: stepsError } = await supabase
      .from('bb_workflow_steps')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('order_index', { ascending: true });

    if (stepsError) throw stepsError;

    return {
      ...workflow,
      steps: steps || [],
    };
  }

  async createWorkflow(workflow: Partial<Workflow>): Promise<Workflow> {
    const { data, error } = await supabase
      .from('bb_workflows')
      .insert({
        ...workflow,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateWorkflow(workflowId: string, updates: Partial<Workflow>): Promise<Workflow> {
    const { data, error } = await supabase
      .from('bb_workflows')
      .update({
        ...updates,
        last_modified_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .eq('id', workflowId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteWorkflow(workflowId: string): Promise<void> {
    const { error } = await supabase
      .from('bb_workflows')
      .delete()
      .eq('id', workflowId);

    if (error) throw error;
  }

  async toggleWorkflowStatus(workflowId: string, isActive: boolean): Promise<Workflow> {
    const { data, error } = await supabase
      .from('bb_workflows')
      .update({ is_active: isActive })
      .eq('id', workflowId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async createWorkflowStep(step: Partial<WorkflowStep>): Promise<WorkflowStep> {
    const { data, error } = await supabase
      .from('bb_workflow_steps')
      .insert(step)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateWorkflowStep(stepId: string, updates: Partial<WorkflowStep>): Promise<WorkflowStep> {
    const { data, error } = await supabase
      .from('bb_workflow_steps')
      .update(updates)
      .eq('id', stepId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteWorkflowStep(stepId: string): Promise<void> {
    const { error } = await supabase
      .from('bb_workflow_steps')
      .delete()
      .eq('id', stepId);

    if (error) throw error;
  }

  async getWorkflowExecutions(
    workflowId: string,
    limit = 50
  ): Promise<WorkflowExecution[]> {
    const { data, error } = await supabase
      .from('bb_workflow_executions')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getExecutionsByEntity(entityType: string, entityId: string): Promise<(WorkflowExecution & { workflow?: { name: string, category: string } })[]> {
    const { data, error } = await supabase
      .from('bb_workflow_executions')
      .select('*, workflow:bb_workflows(name, category)')
      .eq('trigger_entity_type', entityType)
      .eq('trigger_entity_id', entityId)
      .order('started_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getExecutionDetail(executionId: string): Promise<WorkflowExecutionDetail | null> {
    const { data: execution, error: executionError } = await supabase
      .from('bb_workflow_executions')
      .select(`
        *,
        workflow:bb_workflows(*)
      `)
      .eq('id', executionId)
      .maybeSingle();

    if (executionError) throw executionError;
    if (!execution) return null;

    const { data: stepExecutions, error: stepsError } = await supabase
      .from('bb_workflow_step_executions')
      .select(`
        *,
        step:bb_workflow_steps(*)
      `)
      .eq('workflow_execution_id', executionId)
      .order('created_at', { ascending: true });

    if (stepsError) throw stepsError;

    return {
      ...execution,
      workflow: execution.workflow as Workflow,
      step_executions: stepExecutions || [],
    } as WorkflowExecutionDetail;
  }

  async startExecution(
    workflowId: string,
    organizationId: string,
    triggerData: {
      entityType: string;
      entityId: string;
      data: Record<string, any>;
    }
  ): Promise<WorkflowExecution> {
    const { data, error } = await supabase
      .from('bb_workflow_executions')
      .insert({
        workflow_id: workflowId,
        organization_id: organizationId,
        trigger_entity_type: triggerData.entityType,
        trigger_entity_id: triggerData.entityId,
        trigger_data: triggerData.data,
        status: 'running',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateExecutionStatus(
    executionId: string,
    status: WorkflowExecutionStatus,
    errorMessage?: string
  ): Promise<void> {
    const updates: any = { status };
    if (status === 'completed' || status === 'failed' || status === 'cancelled') {
      updates.completed_at = new Date().toISOString();
    }
    if (errorMessage) {
      updates.error_message = errorMessage;
    }

    const { error } = await supabase
      .from('bb_workflow_executions')
      .update(updates)
      .eq('id', executionId);

    if (error) throw error;
  }

  async createStepExecution(
    executionId: string,
    stepId: string
  ): Promise<WorkflowStepExecution> {
    const { data, error } = await supabase
      .from('bb_workflow_step_executions')
      .insert({
        workflow_execution_id: executionId,
        step_id: stepId,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateStepExecution(
    stepExecutionId: string,
    updates: Partial<WorkflowStepExecution>
  ): Promise<void> {
    const { error } = await supabase
      .from('bb_workflow_step_executions')
      .update(updates)
      .eq('id', stepExecutionId);

    if (error) throw error;
  }

  async getWorkflowStats(organizationId: string): Promise<WorkflowStats> {
    const { data: workflows, error: workflowsError } = await supabase
      .from('bb_workflows')
      .select('category, is_active')
      .eq('organization_id', organizationId)
      .eq('is_template', false);

    if (workflowsError) throw workflowsError;

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: executions, error: executionsError } = await supabase
      .from('bb_workflow_executions')
      .select('status, started_at')
      .eq('organization_id', organizationId)
      .gte('started_at', oneDayAgo);

    if (executionsError) throw executionsError;

    const total = workflows?.length || 0;
    const active = workflows?.filter(w => w.is_active).length || 0;
    const executions24h = executions?.length || 0;
    const completed = executions?.filter(e => e.status === 'completed').length || 0;
    const successRate = executions24h > 0 ? (completed / executions24h) * 100 : 0;

    const byCategory = workflows?.reduce((acc, w) => {
      acc[w.category as WorkflowCategory] = (acc[w.category as WorkflowCategory] || 0) + 1;
      return acc;
    }, {} as Record<WorkflowCategory, number>) || {} as Record<WorkflowCategory, number>;

    return {
      total,
      active,
      executions_24h: executions24h,
      success_rate: Math.round(successRate),
      by_category: byCategory,
    };
  }

  async getActiveWorkflowsByTrigger(
    organizationId: string,
    triggerType: WorkflowTriggerType
  ): Promise<WorkflowWithSteps[]> {
    const { data: workflows, error: workflowsError } = await supabase
      .from('bb_workflows')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('trigger_type', triggerType)
      .eq('is_active', true);

    if (workflowsError) throw workflowsError;
    if (!workflows || workflows.length === 0) return [];

    const workflowsWithSteps = await Promise.all(
      workflows.map(async (workflow) => {
        const { data: steps, error: stepsError } = await supabase
          .from('bb_workflow_steps')
          .select('*')
          .eq('workflow_id', workflow.id)
          .order('order_index', { ascending: true });

        if (stepsError) throw stepsError;

        return {
          ...workflow,
          steps: steps || [],
        };
      })
    );

    return workflowsWithSteps;
  }

  async getTemplates(category?: WorkflowCategory): Promise<WorkflowTemplate[]> {
    let query = supabase
      .from('bb_workflow_templates')
      .select('*')
      .order('times_used', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async createFromTemplate(
    templateId: string,
    organizationId: string,
    name: string
  ): Promise<WorkflowWithSteps> {
    const { data: template, error: templateError } = await supabase
      .from('bb_workflow_templates')
      .select('*')
      .eq('id', templateId)
      .maybeSingle();

    if (templateError) throw templateError;
    if (!template) throw new Error('Template not found');

    const workflow = await this.createWorkflow({
      organization_id: organizationId,
      name,
      description: template.description,
      category: template.category,
      trigger_type: template.template_config.trigger.type,
      trigger_conditions: template.template_config.trigger.conditions || {},
      is_active: false,
    });

    const steps = await Promise.all(
      template.template_config.steps.map((stepConfig: any) =>
        this.createWorkflowStep({
          workflow_id: workflow.id,
          step_key: stepConfig.key,
          step_name: stepConfig.name,
          step_type: stepConfig.type,
          action_type: stepConfig.config.actionType,
          action_config: stepConfig.config,
          condition_expression: stepConfig.config.condition,
          delay_amount: stepConfig.config.delayAmount,
          delay_unit: stepConfig.config.delayUnit,
          position_x: stepConfig.position.x,
          position_y: stepConfig.position.y,
          order_index: template.template_config.steps.indexOf(stepConfig),
        })
      )
    );

    await supabase
      .from('bb_workflow_templates')
      .update({ times_used: template.times_used + 1 })
      .eq('id', templateId);

    return {
      ...workflow,
      steps,
    };
  }
}

export const workflowService = new WorkflowService();
