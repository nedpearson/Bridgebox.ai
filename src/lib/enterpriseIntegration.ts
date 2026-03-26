// @ts-nocheck
import { supabase } from './supabase';
import { whiteLabelService } from './db/whiteLabel';
import { connectorsService } from './db/connectors';
import { dataPipelineService } from './db/dataPipeline';
import { workflowService } from './db/workflows';
import { documentService } from './db/documents';

export interface EnterpriseContext {
  organizationId: string;
  userId: string;
  userRole: string;
  planId: string;
}

export interface SystemEvent {
  type: 'connector_sync' | 'workflow_complete' | 'document_processed' | 'lead_converted' | 'project_updated';
  source: string;
  data: any;
  organizationId: string;
  userId?: string;
  timestamp: string;
}

export const enterpriseIntegration = {
  async handleConnectorSync(
    context: EnterpriseContext,
    connectorId: string,
    data: any[]
  ): Promise<void> {
    const connector = await connectorsService.getConnector(connectorId);
    if (!connector) return;

    const pipelineRun = await dataPipelineService.createRun(
      context.organizationId,
      connectorId,
      {
        source: connector.provider_id,
        recordCount: data.length,
      }
    );

    for (const record of data) {
      await dataPipelineService.processRecord(
        pipelineRun.id,
        record,
        connector.field_mappings || {}
      );
    }

    await this.triggerWorkflows(context, {
      type: 'connector_sync',
      source: connector.provider_id,
      data: { connectorId, recordCount: data.length },
      organizationId: context.organizationId,
      userId: context.userId,
      timestamp: new Date().toISOString(),
    });
  },

  async handleDocumentProcessed(
    context: EnterpriseContext,
    documentId: string,
    extractedData: any
  ): Promise<void> {
    const document = await documentService.getDocument(documentId);
    if (!document) return;

    if (document.project_id) {
      await this.linkDocumentToProject(documentId, document.project_id);
    }

    if (extractedData.entities) {
      await this.createEntitiesFromDocument(context, extractedData.entities);
    }

    await this.triggerWorkflows(context, {
      type: 'document_processed',
      source: 'document_intelligence',
      data: { documentId, extractedData },
      organizationId: context.organizationId,
      userId: context.userId,
      timestamp: new Date().toISOString(),
    });
  },

  async handleLeadConverted(
    context: EnterpriseContext,
    leadId: string,
    projectId: string
  ): Promise<void> {
    await this.triggerWorkflows(context, {
      type: 'lead_converted',
      source: 'crm',
      data: { leadId, projectId },
      organizationId: context.organizationId,
      userId: context.userId,
      timestamp: new Date().toISOString(),
    });

    await this.notifyTeam(context, {
      title: 'Lead Converted',
      message: 'A lead has been successfully converted to a project',
      type: 'success',
      link: `/app/projects/${projectId}`,
    });
  },

  async handleProjectUpdated(
    context: EnterpriseContext,
    projectId: string,
    changes: any
  ): Promise<void> {
    await this.triggerWorkflows(context, {
      type: 'project_updated',
      source: 'project_management',
      data: { projectId, changes },
      organizationId: context.organizationId,
      userId: context.userId,
      timestamp: new Date().toISOString(),
    });
  },

  async triggerWorkflows(context: EnterpriseContext, event: SystemEvent): Promise<void> {
    const hasAutomation = await whiteLabelService.checkFeatureAccess(
      context.organizationId,
      context.planId,
      'automation'
    );

    if (!hasAutomation) return;

    const workflows = await workflowService.getWorkflowsByOrganization(context.organizationId);

    for (const workflow of workflows) {
      if (!workflow.is_active) continue;

      const trigger = workflow.definition?.trigger;
      if (trigger?.type === event.type || trigger?.type === 'any') {
        await workflowService.executeWorkflow(workflow.id, event.data, context.userId);
      }
    }
  },

  async linkDocumentToProject(documentId: string, projectId: string): Promise<void> {
    const { error } = await supabase
      .from('bb_project_documents')
      .upsert({
        project_id: projectId,
        document_id: documentId,
      });

    if (error) throw error;
  },

  async createEntitiesFromDocument(
    context: EnterpriseContext,
    entities: any[]
  ): Promise<void> {
    for (const entity of entities) {
      if (entity.type === 'contact' || entity.type === 'company') {
        await this.createLeadFromEntity(context, entity);
      }
    }
  },

  async createLeadFromEntity(context: EnterpriseContext, entity: any): Promise<void> {
    const { error } = await supabase
      .from('bb_leads')
      .insert({
        organization_id: context.organizationId,
        name: entity.name,
        email: entity.email,
        company: entity.company,
        source: 'document_extraction',
        status: 'new',
        metadata: entity,
      });

    if (error && error.code !== '23505') {
      throw error;
    }
  },

  async notifyTeam(
    context: EnterpriseContext,
    notification: {
      title: string;
      message: string;
      type: 'info' | 'success' | 'warning' | 'error';
      link?: string;
    }
  ): Promise<void> {
    const { data: members } = await supabase
      .from('bb_organization_memberships')
      .select('user_id')
      .eq('organization_id', context.organizationId)
      .in('role', ['super_admin', 'internal_staff']);

    if (!members) return;

    const notifications = members.map((member) => ({
      user_id: member.user_id,
      organization_id: context.organizationId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      link: notification.link,
      is_read: false,
    }));

    await supabase.from('bb_notifications').insert(notifications);
  },

  async getBrandingForOrganization(organizationId: string) {
    const branding = await whiteLabelService.getBranding(organizationId);

    return {
      primaryColor: branding?.primary_color || '#3b82f6',
      secondaryColor: branding?.secondary_color || '#1e293b',
      accentColor: branding?.accent_color || '#10b981',
      logoUrl: branding?.logo_url,
      companyName: branding?.company_name,
      customCss: branding?.custom_css,
    };
  },

  async getEnabledFeaturesForOrganization(
    organizationId: string,
    planId: string
  ): Promise<string[]> {
    const flags = await whiteLabelService.getFeatureFlags(organizationId);
    const planFeatures = await whiteLabelService.getPlanFeatures(planId);

    const enabledFlags = new Set(
      flags.filter(f => f.enabled).map(f => f.feature_key)
    );

    return planFeatures
      .filter(f => f.included && (!enabledFlags.size || enabledFlags.has(f.feature_key)))
      .map(f => f.feature_key);
  },

  async trackCrossSystemMetric(
    organizationId: string,
    metric: {
      name: string;
      value: number;
      category: string;
      source: string;
      metadata?: any;
    }
  ): Promise<void> {
    const { error } = await supabase
      .from('bb_metrics_events')
      .insert({
        organization_id: organizationId,
        metric_name: metric.name,
        metric_value: metric.value,
        category: metric.category,
        source: metric.source,
        metadata: metric.metadata || {},
      });

    if (error) throw error;
  },

  async syncMobileChanges(
    context: EnterpriseContext,
    changes: {
      type: 'task' | 'project' | 'document';
      id: string;
      updates: any;
    }
  ): Promise<void> {
    const table = changes.type === 'task' ? 'tasks' :
                  changes.type === 'project' ? 'projects' :
                  'documents';

    const { error } = await supabase
      .from(table)
      .update({
        ...changes.updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', changes.id);

    if (error) throw error;

    await this.trackCrossSystemMetric(context.organizationId, {
      name: 'mobile_sync',
      value: 1,
      category: 'mobile',
      source: 'mobile_app',
      metadata: { type: changes.type, id: changes.id },
    });
  },

  async getOrganizationDashboard(organizationId: string, planId: string) {
    const [
      connectors,
      workflows,
      documents,
      features,
      branding,
    ] = await Promise.all([
      connectorsService.getConnectorsByOrganization(organizationId),
      workflowService.getWorkflowsByOrganization(organizationId),
      documentService.getDocuments(organizationId),
      this.getEnabledFeaturesForOrganization(organizationId, planId),
      this.getBrandingForOrganization(organizationId),
    ]);

    const activeConnectors = connectors.filter(c => c.status === 'active').length;
    const activeWorkflows = workflows.filter(w => w.is_active).length;
    const recentDocuments = documents.length;

    return {
      stats: {
        activeConnectors,
        totalConnectors: connectors.length,
        activeWorkflows,
        totalWorkflows: workflows.length,
        documentsProcessed: recentDocuments,
        enabledFeatures: features.length,
      },
      features,
      branding,
      health: {
        connectors: activeConnectors > 0 ? 'healthy' : 'warning',
        workflows: activeWorkflows > 0 ? 'healthy' : 'info',
        overall: activeConnectors > 0 && activeWorkflows > 0 ? 'healthy' : 'warning',
      },
    };
  },

  async executeEnterpriseWorkflow(
    context: EnterpriseContext,
    workflowType: 'onboarding' | 'lead_nurture' | 'project_kickoff' | 'delivery',
    data: any
  ): Promise<void> {
    const workflows = await workflowService.getWorkflowsByOrganization(context.organizationId);
    const targetWorkflow = workflows.find(w =>
      w.is_active && w.definition?.workflowType === workflowType
    );

    if (targetWorkflow) {
      await workflowService.executeWorkflow(targetWorkflow.id, data, context.userId);
    }

    await this.trackCrossSystemMetric(context.organizationId, {
      name: 'workflow_executed',
      value: 1,
      category: 'automation',
      source: 'enterprise_integration',
      metadata: { workflowType, hasWorkflow: !!targetWorkflow },
    });
  },
};

export interface NotificationPayload {
  user_id: string;
  organization_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  link?: string;
  is_read: boolean;
}
