import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { whiteLabelService, OrganizationBranding } from '../lib/db/whiteLabel';

interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl?: string;
  companyName?: string;
  isLoading: boolean;
}

export function useBranding(): BrandingConfig {
  const { currentOrganization } = useAuth();
  const [branding, setBranding] = useState<OrganizationBranding | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentOrganization) {
      loadBranding();
    }
  }, [currentOrganization]);

  useEffect(() => {
    if (branding) {
      applyBrandingToDOM();
    }
  }, [branding]);

  const loadBranding = async () => {
    if (!currentOrganization) return;

    try {
      const data = await whiteLabelService.getBranding(currentOrganization.id);
      setBranding(data);
    } catch (error) {
      console.error('Failed to load branding:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyBrandingToDOM = () => {
    if (!branding) return;

    const root = document.documentElement;
    root.style.setProperty('--color-primary', branding.primary_color);
    root.style.setProperty('--color-secondary', branding.secondary_color);
    root.style.setProperty('--color-accent', branding.accent_color);

    if (branding.custom_css) {
      let styleElement = document.getElementById('custom-branding');
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'custom-branding';
        document.head.appendChild(styleElement);
      }
      styleElement.textContent = branding.custom_css;
    }

    if (branding.company_name) {
      document.title = branding.company_name;
    }

    if (branding.favicon_url) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = branding.favicon_url;
    }
  };

  return {
    primaryColor: branding?.primary_color || '#3b82f6',
    secondaryColor: branding?.secondary_color || '#1e293b',
    accentColor: branding?.accent_color || '#10b981',
    logoUrl: branding?.logo_url,
    companyName: branding?.company_name,
    isLoading: loading,
  };
}
