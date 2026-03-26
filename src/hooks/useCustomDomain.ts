import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface DomainConfig {
  isCustomDomain: boolean;
  tenantId: string | null;
  loading: boolean;
  brandColors?: { primary: string; secondary: string };
}

export function useCustomDomain(): DomainConfig {
  const [config, setConfig] = useState<DomainConfig>({
    isCustomDomain: false,
    tenantId: null,
    loading: true
  });

  useEffect(() => {
    let mounted = true;

    async function resolveDomain() {
      const hostname = window.location.hostname;
      
      // Bypass standard application entries
      if (
        hostname === 'localhost' || 
        hostname === '127.0.0.1' || 
        hostname.includes('bridgebox.ai') || 
        hostname.includes('vercel.app') ||
        hostname.includes('netlify.app')
      ) {
        if (mounted) setConfig(prev => ({ ...prev, isCustomDomain: false, loading: false }));
        return;
      }

      try {
        // Query the organization masking this domain
        // Since we store custom domains in organization_settings or dynamically,
        // we simulate a DB fetch scanning the tenant mapping.
        // In production, this would be an Edge Function or exact column match:
        // .eq('custom_domain', hostname)
        
        // Mocking the successful discovery of a White-Label tenant domain for demonstration
        if (mounted) {
          setConfig({
            isCustomDomain: true,
            tenantId: 'resolved-tenant-uuid-placeholder',
            brandColors: { primary: '#3B82F6', secondary: '#10B981' },
            loading: false
          });

          // Inject CSS variables for absolute Whitelabeling
          document.documentElement.style.setProperty('--primary-color', '#3B82F6');
        }
      } catch (err) {
        if (mounted) setConfig(prev => ({ ...prev, loading: false }));
      }
    }

    resolveDomain();

    return () => {
      mounted = false;
    };
  }, []);

  return config;
}
