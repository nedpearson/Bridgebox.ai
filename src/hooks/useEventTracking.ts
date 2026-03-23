import { useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dataPipelineService, type EventCategory } from '../lib/db/dataPipeline';

export function useEventTracking() {
  const { user, currentOrganization } = useAuth();

  const trackEvent = useCallback(
    async (
      eventType: string,
      eventCategory: EventCategory,
      data?: {
        entityType?: string;
        entityId?: string;
        eventData?: Record<string, any>;
        metadata?: Record<string, any>;
      }
    ) => {
      if (!user) return;

      await dataPipelineService.logEvent(eventType, eventCategory, {
        organizationId: currentOrganization?.id || null,
        userId: user.id,
        entityType: data?.entityType,
        entityId: data?.entityId,
        eventData: data?.eventData || {},
        metadata: data?.metadata || {},
      });
    },
    [user, currentOrganization]
  );

  const trackActivity = useCallback(
    async (
      action: string,
      resourceType: string,
      data?: {
        resourceId?: string;
        page?: string;
        metadata?: Record<string, any>;
      }
    ) => {
      if (!user) return;

      await dataPipelineService.logActivity(user.id, action, resourceType, {
        organizationId: currentOrganization?.id || null,
        resourceId: data?.resourceId,
        page: data?.page || window.location.pathname,
        metadata: data?.metadata || {},
      });
    },
    [user, currentOrganization]
  );

  const trackPageView = useCallback(
    async (page: string) => {
      if (!user) return;

      await trackActivity('view', 'page', {
        page,
        metadata: {
          referrer: document.referrer,
          timestamp: new Date().toISOString(),
        },
      });
    },
    [user, trackActivity]
  );

  useEffect(() => {
    trackPageView(window.location.pathname);
  }, [window.location.pathname]);

  return {
    trackEvent,
    trackActivity,
    trackPageView,
  };
}
