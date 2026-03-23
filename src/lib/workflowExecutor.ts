import { workflowService } from './db/workflows';
import type {
  WorkflowWithSteps,
  WorkflowStep,
  WorkflowExecution,
  WorkflowStepExecution,
} from '../types/workflow';

interface ExecutionContext {
  variables: Record<string, any>;
  triggerData: Record<string, any>;
}

class WorkflowExecutor {
  async executeWorkflow(
    workflowId: string,
    organizationId: string,
    triggerData: {
      entityType: string;
      entityId: string;
      data: Record<string, any>;
    }
  ): Promise<void> {
    try {
      const workflow = await workflowService.getWorkflowWithSteps(workflowId);
      if (!workflow) {
        throw new Error('Workflow not found');
      }

      if (!workflow.is_active) {
        throw new Error('Workflow is not active');
      }

      const execution = await workflowService.startExecution(
        workflowId,
        organizationId,
        triggerData
      );

      const context: ExecutionContext = {
        variables: {},
        triggerData: triggerData.data,
      };

      await this.executeSteps(workflow, execution, context);

      await workflowService.updateExecutionStatus(execution.id, 'completed');
    } catch (error) {
      console.error('Workflow execution failed:', error);
      throw error;
    }
  }

  private async executeSteps(
    workflow: WorkflowWithSteps,
    execution: WorkflowExecution,
    context: ExecutionContext
  ): Promise<void> {
    const steps = workflow.steps.sort((a, b) => a.order_index - b.order_index);

    let currentStep = steps.find(s => s.order_index === 0);

    while (currentStep) {
      try {
        const result = await this.executeStep(currentStep, execution, context);

        if (currentStep.step_type === 'condition' && result.conditionResult !== undefined) {
          currentStep = result.conditionResult
            ? steps.find(s => s.id === currentStep?.on_true_step_id)
            : steps.find(s => s.id === currentStep?.on_false_step_id);
        } else {
          currentStep = steps.find(s => s.id === currentStep?.next_step_id);
        }
      } catch (error) {
        await workflowService.updateExecutionStatus(
          execution.id,
          'failed',
          error instanceof Error ? error.message : 'Unknown error'
        );
        throw error;
      }
    }
  }

  private async executeStep(
    step: WorkflowStep,
    execution: WorkflowExecution,
    context: ExecutionContext
  ): Promise<{ conditionResult?: boolean; output?: any }> {
    const stepExecution = await workflowService.createStepExecution(execution.id, step.id);
    const startTime = Date.now();

    try {
      await workflowService.updateStepExecution(stepExecution.id, {
        status: 'running',
        started_at: new Date().toISOString(),
      });

      let result: any;

      switch (step.step_type) {
        case 'action':
          result = await this.executeAction(step, context);
          break;
        case 'condition':
          result = await this.evaluateCondition(step, context);
          break;
        case 'delay':
          result = await this.executeDelay(step);
          break;
        case 'parallel':
          result = await this.executeParallel(step, execution, context);
          break;
        default:
          throw new Error(`Unknown step type: ${step.step_type}`);
      }

      const duration = Date.now() - startTime;

      await workflowService.updateStepExecution(stepExecution.id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        duration_ms: duration,
        output_data: result,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      await workflowService.updateStepExecution(stepExecution.id, {
        status: 'failed',
        completed_at: new Date().toISOString(),
        duration_ms: duration,
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  private async executeAction(
    step: WorkflowStep,
    context: ExecutionContext
  ): Promise<any> {
    const config = this.interpolateVariables(step.action_config, context);

    switch (step.action_type) {
      case 'send_notification':
        return { sent: true, message: config.message };
      case 'update_status':
        return { updated: true, status: config.status };
      case 'create_task':
        return { task_id: 'mock-task-id', title: config.title };
      case 'flag_risk':
        return { flagged: true, severity: config.severity };
      case 'assign_team_member':
        return { assigned: true, member_id: config.member_id };
      default:
        console.log(`Action ${step.action_type} not yet implemented`);
        return { skipped: true };
    }
  }

  private async evaluateCondition(
    step: WorkflowStep,
    context: ExecutionContext
  ): Promise<{ conditionResult: boolean }> {
    if (!step.condition_expression) {
      throw new Error('Condition expression is required for condition steps');
    }

    const { field, operator, value } = step.condition_expression;
    const fieldValue = this.getFieldValue(field, context);

    let result = false;

    switch (operator) {
      case 'equals':
        result = fieldValue === value;
        break;
      case 'not_equals':
        result = fieldValue !== value;
        break;
      case 'greater_than':
        result = fieldValue > value;
        break;
      case 'less_than':
        result = fieldValue < value;
        break;
      case 'contains':
        result = String(fieldValue).includes(String(value));
        break;
      case 'exists':
        result = fieldValue !== undefined && fieldValue !== null;
        break;
      default:
        throw new Error(`Unknown operator: ${operator}`);
    }

    return { conditionResult: result };
  }

  private async executeDelay(step: WorkflowStep): Promise<any> {
    if (!step.delay_amount || !step.delay_unit) {
      throw new Error('Delay amount and unit are required for delay steps');
    }

    let delayMs = step.delay_amount;

    switch (step.delay_unit) {
      case 'minutes':
        delayMs *= 60 * 1000;
        break;
      case 'hours':
        delayMs *= 60 * 60 * 1000;
        break;
      case 'days':
        delayMs *= 24 * 60 * 60 * 1000;
        break;
    }

    await new Promise(resolve => setTimeout(resolve, Math.min(delayMs, 1000)));

    return { delayed: true, duration: `${step.delay_amount} ${step.delay_unit}` };
  }

  private async executeParallel(
    step: WorkflowStep,
    execution: WorkflowExecution,
    context: ExecutionContext
  ): Promise<any> {
    console.log('Parallel execution not yet implemented');
    return { parallel: true };
  }

  private interpolateVariables(
    config: Record<string, any>,
    context: ExecutionContext
  ): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(config)) {
      if (typeof value === 'string') {
        result[key] = value.replace(/\{\{(.+?)\}\}/g, (_, variable) => {
          return this.getFieldValue(variable.trim(), context);
        });
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  private getFieldValue(field: string, context: ExecutionContext): any {
    if (field.startsWith('trigger.')) {
      const path = field.substring(8);
      return this.getNestedValue(context.triggerData, path);
    }

    if (field.startsWith('var.')) {
      const path = field.substring(4);
      return this.getNestedValue(context.variables, path);
    }

    return context.variables[field] || context.triggerData[field];
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

export const workflowExecutor = new WorkflowExecutor();
