import { supabase } from '../supabase';

export type EventCategory = 'crm' | 'billing' | 'project' | 'support' | 'user_action' | 'system';
export type MetricCategory = 'crm' | 'billing' | 'project' | 'support' | 'engagement' | 'system';
export type TimePeriod = 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
export type SignalType = 'trend' | 'anomaly' | 'pattern' | 'prediction';
export type SignalSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';
export type SignalStatus = 'new' | 'acknowledged' | 'resolved';

export interface SystemEvent {
  id: string;
  event_type: string;
  event_category: EventCategory;
  organization_id: string | null;
  user_id: string | null;
  entity_type: string | null;
  entity_id: string | null;
  event_data: Record<string, any>;
  metadata: Record<string, any>;
  timestamp: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  organization_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  page: string | null;
  metadata: Record<string, any>;
  timestamp: string;
  created_at: string;
}

export interface AggregatedMetric {
  id: string;
  metric_type: string;
  metric_category: MetricCategory;
  organization_id: string | null;
  user_id: string | null;
  time_period: TimePeriod;
  period_start: string;
  period_end: string;
  metric_value: number;
  metric_data: Record<string, any>;
  computed_at: string;
  created_at: string;
}

export interface DataSignal {
  id: string;
  signal_type: SignalType;
  signal_category: MetricCategory;
  organization_id: string | null;
  severity: SignalSeverity;
  title: string;
  description: string | null;
  signal_data: Record<string, any>;
  confidence_score: number | null;
  status: SignalStatus;
  detected_at: string;
  created_at: string;
}

class DataPipelineService {
  async logEvent(
    eventType: string,
    eventCategory: EventCategory,
    data: {
      organizationId?: string | null;
      userId?: string | null;
      entityType?: string;
      entityId?: string;
      eventData?: Record<string, any>;
      metadata?: Record<string, any>;
    }
  ): Promise<SystemEvent | null> {
    try {
      const { data: event, error } = await supabase
        .from('system_events')
        .insert({
          event_type: eventType,
          event_category: eventCategory,
          organization_id: data.organizationId || null,
          user_id: data.userId || null,
          entity_type: data.entityType || null,
          entity_id: data.entityId || null,
          event_data: data.eventData || {},
          metadata: data.metadata || {},
        })
        .select()
        .single();

      if (error) throw error;
      return event;
    } catch (error) {
      console.error('Failed to log event:', error);
      return null;
    }
  }

  async logActivity(
    userId: string,
    action: string,
    resourceType: string,
    data: {
      organizationId?: string | null;
      resourceId?: string | null;
      page?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<ActivityLog | null> {
    try {
      const { data: log, error } = await supabase
        .from('activity_logs')
        .insert({
          user_id: userId,
          organization_id: data.organizationId || null,
          action,
          resource_type: resourceType,
          resource_id: data.resourceId || null,
          page: data.page || null,
          metadata: data.metadata || {},
        })
        .select()
        .single();

      if (error) throw error;
      return log;
    } catch (error) {
      console.error('Failed to log activity:', error);
      return null;
    }
  }

  async getEvents(filters?: {
    eventType?: string;
    eventCategory?: EventCategory;
    organizationId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<SystemEvent[]> {
    try {
      let query = supabase
        .from('system_events')
        .select('*')
        .order('timestamp', { ascending: false });

      if (filters?.eventType) {
        query = query.eq('event_type', filters.eventType);
      }

      if (filters?.eventCategory) {
        query = query.eq('event_category', filters.eventCategory);
      }

      if (filters?.organizationId) {
        query = query.eq('organization_id', filters.organizationId);
      }

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters?.startDate) {
        query = query.gte('timestamp', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('timestamp', filters.endDate);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      } else {
        query = query.limit(100);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get events:', error);
      return [];
    }
  }

  async getActivityLogs(filters?: {
    userId?: string;
    organizationId?: string;
    action?: string;
    resourceType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<ActivityLog[]> {
    try {
      let query = supabase
        .from('activity_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters?.organizationId) {
        query = query.eq('organization_id', filters.organizationId);
      }

      if (filters?.action) {
        query = query.eq('action', filters.action);
      }

      if (filters?.resourceType) {
        query = query.eq('resource_type', filters.resourceType);
      }

      if (filters?.startDate) {
        query = query.gte('timestamp', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('timestamp', filters.endDate);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      } else {
        query = query.limit(100);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get activity logs:', error);
      return [];
    }
  }

  async storeMetric(
    metricType: string,
    metricCategory: MetricCategory,
    timePeriod: TimePeriod,
    periodStart: string,
    periodEnd: string,
    metricValue: number,
    data: {
      organizationId?: string | null;
      userId?: string | null;
      metricData?: Record<string, any>;
    }
  ): Promise<AggregatedMetric | null> {
    try {
      const { data: metric, error } = await supabase
        .from('aggregated_metrics')
        .upsert({
          metric_type: metricType,
          metric_category: metricCategory,
          organization_id: data.organizationId || null,
          user_id: data.userId || null,
          time_period: timePeriod,
          period_start: periodStart,
          period_end: periodEnd,
          metric_value: metricValue,
          metric_data: data.metricData || {},
          computed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return metric;
    } catch (error) {
      console.error('Failed to store metric:', error);
      return null;
    }
  }

  async getMetrics(filters: {
    metricType?: string;
    metricCategory?: MetricCategory;
    organizationId?: string;
    userId?: string;
    timePeriod?: TimePeriod;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<AggregatedMetric[]> {
    try {
      let query = supabase
        .from('aggregated_metrics')
        .select('*')
        .order('period_start', { ascending: false });

      if (filters.metricType) {
        query = query.eq('metric_type', filters.metricType);
      }

      if (filters.metricCategory) {
        query = query.eq('metric_category', filters.metricCategory);
      }

      if (filters.organizationId) {
        query = query.eq('organization_id', filters.organizationId);
      }

      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters.timePeriod) {
        query = query.eq('time_period', filters.timePeriod);
      }

      if (filters.startDate) {
        query = query.gte('period_start', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('period_start', filters.endDate);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      } else {
        query = query.limit(50);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get metrics:', error);
      return [];
    }
  }

  async createSignal(
    signalType: SignalType,
    signalCategory: MetricCategory,
    severity: SignalSeverity,
    title: string,
    data: {
      organizationId?: string | null;
      description?: string;
      signalData?: Record<string, any>;
      confidenceScore?: number;
    }
  ): Promise<DataSignal | null> {
    try {
      const { data: signal, error } = await supabase
        .from('data_signals')
        .insert({
          signal_type: signalType,
          signal_category: signalCategory,
          organization_id: data.organizationId || null,
          severity,
          title,
          description: data.description || null,
          signal_data: data.signalData || {},
          confidence_score: data.confidenceScore || null,
        })
        .select()
        .single();

      if (error) throw error;
      return signal;
    } catch (error) {
      console.error('Failed to create signal:', error);
      return null;
    }
  }

  async getSignals(filters?: {
    signalType?: SignalType;
    signalCategory?: MetricCategory;
    organizationId?: string;
    severity?: SignalSeverity;
    status?: SignalStatus;
    limit?: number;
  }): Promise<DataSignal[]> {
    try {
      let query = supabase
        .from('data_signals')
        .select('*')
        .order('detected_at', { ascending: false });

      if (filters?.signalType) {
        query = query.eq('signal_type', filters.signalType);
      }

      if (filters?.signalCategory) {
        query = query.eq('signal_category', filters.signalCategory);
      }

      if (filters?.organizationId) {
        query = query.eq('organization_id', filters.organizationId);
      }

      if (filters?.severity) {
        query = query.eq('severity', filters.severity);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      } else {
        query = query.limit(50);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get signals:', error);
      return [];
    }
  }

  async updateSignalStatus(signalId: string, status: SignalStatus): Promise<void> {
    try {
      const { error } = await supabase
        .from('data_signals')
        .update({ status })
        .eq('id', signalId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update signal status:', error);
    }
  }

  async aggregateMetrics(
    organizationId: string | null,
    timePeriod: TimePeriod,
    startDate: Date,
    endDate: Date
  ): Promise<void> {
    try {
      const events = await this.getEvents({
        organizationId: organizationId || undefined,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 10000,
      });

      const crmEvents = events.filter(e => e.event_category === 'crm');
      const billingEvents = events.filter(e => e.event_category === 'billing');
      const projectEvents = events.filter(e => e.event_category === 'project');
      const supportEvents = events.filter(e => e.event_category === 'support');

      await this.storeMetric(
        'event_count',
        'crm',
        timePeriod,
        startDate.toISOString(),
        endDate.toISOString(),
        crmEvents.length,
        {
          organizationId,
          metricData: {
            lead_created: crmEvents.filter(e => e.event_type === 'lead_created').length,
            proposal_created: crmEvents.filter(e => e.event_type === 'proposal_created').length,
            proposal_approved: crmEvents.filter(e => e.event_type === 'proposal_approved').length,
          },
        }
      );

      await this.storeMetric(
        'event_count',
        'billing',
        timePeriod,
        startDate.toISOString(),
        endDate.toISOString(),
        billingEvents.length,
        {
          organizationId,
          metricData: {
            invoice_paid: billingEvents.filter(e => e.event_type === 'invoice_paid').length,
            invoice_overdue: billingEvents.filter(e => e.event_type === 'invoice_overdue').length,
          },
        }
      );

      await this.storeMetric(
        'event_count',
        'project',
        timePeriod,
        startDate.toISOString(),
        endDate.toISOString(),
        projectEvents.length,
        {
          organizationId,
          metricData: {
            project_created: projectEvents.filter(e => e.event_type === 'project_created').length,
            milestone_completed: projectEvents.filter(e => e.event_type === 'milestone_completed').length,
          },
        }
      );

      await this.storeMetric(
        'event_count',
        'support',
        timePeriod,
        startDate.toISOString(),
        endDate.toISOString(),
        supportEvents.length,
        {
          organizationId,
          metricData: {
            ticket_created: supportEvents.filter(e => e.event_type === 'support_ticket_created').length,
            ticket_resolved: supportEvents.filter(e => e.event_type === 'support_ticket_resolved').length,
          },
        }
      );
    } catch (error) {
      console.error('Failed to aggregate metrics:', error);
    }
  }
}

export const dataPipelineService = new DataPipelineService();
