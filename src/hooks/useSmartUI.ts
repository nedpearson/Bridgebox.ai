import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useSmartUI() {
  const { currentOrganization, user } = useAuth();
  // Default to false. The system assumes a naive user unless proven otherwise via telemetry
  const [showAdvancedUi, setShowAdvancedUi] = useState(false); 

  useEffect(() => {
    if (!currentOrganization || !user) return;

    const determineUiComplexity = async () => {
      try {
        // Query the intelligence layer for user engagement markers
        const [{ count: completedWorkflows }, { count: dropoffs }, { data: profile }] = await Promise.all([
          supabase.from('bb_intelligence_events')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', currentOrganization.id)
            .eq('user_id', user.id)
            .eq('event_type', 'workflow_completed'),
            
          supabase.from('bb_intelligence_events')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', currentOrganization.id)
            .eq('user_id', user.id)
            .eq('event_type', 'feature_dropoff'),
            
          supabase.from('bb_users')
            .select('role')
            .eq('user_id', user.id)
            .eq('organization_id', currentOrganization.id)
            .single()
        ]);

        // Logic: Show advanced UI if they have proven they use the platform
        const hasEngagement = (completedWorkflows || 0) > 3;
        const lowDropoff = (dropoffs || 0) < 5;

        // Admins always get the power-user view
        if (profile?.role === 'super_admin' || profile?.role === 'tenant_admin') {
          setShowAdvancedUi(true);
        } else {
          setShowAdvancedUi(hasEngagement && lowDropoff);
        }

      } catch (err) {
        console.warn('Smart UI detection failed, falling back to basic view.', err);
        setShowAdvancedUi(false);
      }
    };

    determineUiComplexity();
  }, [currentOrganization, user]);

  return { showAdvancedUi };
}
