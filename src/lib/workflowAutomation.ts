import { supabase } from './supabase';
import { getProjectTemplate, ProjectTemplateType } from './projectTemplates';

export interface ConversionResult {
  success: boolean;
  organizationId?: string;
  projectId?: string;
  deliveryId?: string;
  error?: string;
  message: string;
}

export interface ProposalToProjectData {
  proposalId: string;
  proposalTitle: string;
  organizationId: string;
  serviceTypes?: string[];
  scopeSummary?: string;
  pricingAmount?: number;
  projectType?: string;
}

export interface ProposalApprovalData {
  proposalId: string;
  approverName?: string;
  approverTitle?: string;
  approverEmail?: string;
  agreedToTerms?: boolean;
}

/**
 * Convert an approved proposal into a project with delivery tracking
 */
export async function convertProposalToProject(
  data: ProposalToProjectData
): Promise<ConversionResult> {
  try {
    // 1. Check if proposal already converted
    const { data: existingProject } = await supabase
      .from('bb_projects')
      .select('id')
      .eq('proposal_id', data.proposalId)
      .maybeSingle();

    if (existingProject) {
      return {
        success: false,
        error: 'Proposal already converted',
        message: 'This proposal has already been converted to a project',
      };
    }

    // 2. Determine project type and template
    const projectType = determineProjectType(data.serviceTypes || [], data.projectType);
    const template = getProjectTemplate(projectType as ProjectTemplateType);

    // 3. Create project
    const { data: project, error: projectError } = await supabase
      .from('bb_projects')
      .insert({
        organization_id: data.organizationId,
        proposal_id: data.proposalId,
        name: data.proposalTitle,
        description: data.scopeSummary || 'Project created from approved proposal',
        type: mapTemplateTypeToProjectType(projectType),
        status: 'planning',
        contract_value: data.pricingAmount,
        source: 'proposal_conversion',
        template_applied: !!template,
      })
      .select()
      .single();

    if (projectError || !project) {
      throw new Error(`Failed to create project: ${projectError?.message}`);
    }

    // 4. Mark proposal as converted
    await supabase
      .from('bb_proposals')
      .update({
        converted_to_project: true,
        converted_at: new Date().toISOString(),
      })
      .eq('id', data.proposalId);

    // 5. Apply project template if available
    let deliveryId: string | undefined;
    if (template) {
      deliveryId = await applyProjectTemplate(project.id, template);
    }

    // 6. Update organization onboarding status if needed
    const { data: org } = await supabase
      .from('bb_organizations')
      .select('onboarding_status')
      .eq('id', data.organizationId)
      .single();

    if (org?.onboarding_status === 'not_started') {
      await supabase
        .from('bb_organizations')
        .update({ onboarding_status: 'in_progress' })
        .eq('id', data.organizationId);
    }

    return {
      success: true,
      organizationId: data.organizationId,
      projectId: project.id,
      deliveryId,
      message: 'Project created successfully from proposal',
    };
  } catch (error) {
    console.error('Proposal conversion error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to convert proposal to project',
    };
  }
}

/**
 * Apply project template to create delivery tracking, milestones, and deliverables
 */
async function applyProjectTemplate(
  projectId: string,
  template: any
): Promise<string | undefined> {
  try {
    // Create project delivery record
    const { data: delivery, error: deliveryError } = await supabase
      .from('bb_project_delivery')
      .insert({
        project_id: projectId,
        delivery_phase: template.defaultPhase,
        health_status: 'green',
        risk_level: 'none',
        completion_percentage: 0,
      })
      .select()
      .single();

    if (deliveryError || !delivery) {
      console.error('Failed to create delivery:', deliveryError);
      return undefined;
    }

    // Create suggested milestones
    if (template.suggestedMilestones && template.suggestedMilestones.length > 0) {
      const milestones = template.suggestedMilestones.map((m: any) => ({
        project_id: projectId,
        title: m.title,
        description: m.description,
        status: m.order_index === 1 ? 'in_progress' : 'not_started',
        order_index: m.order_index,
      }));

      await supabase.from('bb_milestones').insert(milestones);
    }

    // Create default deliverables
    if (template.defaultDeliverables && template.defaultDeliverables.length > 0) {
      const deliverables = template.defaultDeliverables.map((d: any) => ({
        project_id: projectId,
        title: d.title,
        description: d.description,
        status: 'pending',
      }));

      await supabase.from('bb_deliverables').insert(deliverables);
    }

    return delivery.id;
  } catch (error) {
    console.error('Failed to apply template:', error);
    return undefined;
  }
}

/**
 * Convert a lead to a client organization
 */
export async function convertLeadToClient(leadId: string): Promise<ConversionResult> {
  try {
    // 1. Get lead data
    const { data: lead, error: leadError } = await supabase
      .from('bb_leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      throw new Error('Lead not found');
    }

    // 2. Check if lead already converted
    if (lead.converted_to_client && lead.organization_id) {
      return {
        success: true,
        organizationId: lead.organization_id,
        message: 'Lead already converted to client',
      };
    }

    // 3. Check if organization with same name exists
    let organizationId = lead.organization_id;

    if (!organizationId && lead.company) {
      const { data: existingOrg } = await supabase
        .from('bb_organizations')
        .select('id')
        .ilike('name', lead.company)
        .maybeSingle();

      organizationId = existingOrg?.id;
    }

    // 4. Create organization if needed
    if (!organizationId) {
      const { data: newOrg, error: orgError } = await supabase
        .from('bb_organizations')
        .insert({
          name: lead.company || lead.name,
          onboarding_status: 'not_started',
        })
        .select()
        .single();

      if (orgError || !newOrg) {
        throw new Error(`Failed to create organization: ${orgError?.message}`);
      }

      organizationId = newOrg.id;
    }

    // 5. Mark lead as converted
    await supabase
      .from('bb_leads')
      .update({
        converted_to_client: true,
        converted_at: new Date().toISOString(),
        organization_id: organizationId,
      })
      .eq('id', leadId);

    return {
      success: true,
      organizationId,
      message: 'Lead successfully converted to client',
    };
  } catch (error) {
    console.error('Lead conversion error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to convert lead to client',
    };
  }
}

/**
 * Mark onboarding as complete for an organization
 */
export async function completeOnboarding(organizationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('bb_organizations')
      .update({
        onboarding_status: 'completed',
        onboarding_completed_at: new Date().toISOString(),
      })
      .eq('id', organizationId);

    return !error;
  } catch (error) {
    console.error('Failed to complete onboarding:', error);
    return false;
  }
}

/**
 * Determine project type from service types
 */
function determineProjectType(serviceTypes: string[], explicitType?: string): ProjectTemplateType {
  if (explicitType) {
    const normalized = explicitType.toLowerCase().replace(/[_\s]/g, '_');
    if (normalized.includes('mobile')) return 'mobile_app';
    if (normalized.includes('dashboard') || normalized.includes('analytics'))
      return 'dashboard';
    if (normalized.includes('ai') || normalized.includes('automation'))
      return 'ai_automation';
    if (normalized.includes('integration')) return 'integration';
    if (normalized.includes('retainer') || normalized.includes('support'))
      return 'retainer';
  }

  // Check service types
  for (const service of serviceTypes) {
    const normalized = service.toLowerCase();
    if (normalized.includes('mobile')) return 'mobile_app';
    if (normalized.includes('dashboard') || normalized.includes('analytics'))
      return 'dashboard';
    if (normalized.includes('ai') || normalized.includes('automation'))
      return 'ai_automation';
    if (normalized.includes('integration')) return 'integration';
    if (normalized.includes('retainer') || normalized.includes('support'))
      return 'retainer';
  }

  return 'custom_software';
}

/**
 * Map template type to database project type enum
 */
function mapTemplateTypeToProjectType(templateType: string): string {
  const mapping: Record<string, string> = {
    custom_software: 'web_app',
    dashboard: 'dashboard',
    mobile_app: 'mobile_app',
    ai_automation: 'integration',
    integration: 'integration',
    retainer: 'web_app',
  };

  return mapping[templateType] || 'web_app';
}
