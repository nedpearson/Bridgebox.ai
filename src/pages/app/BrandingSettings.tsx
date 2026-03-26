// @ts-nocheck
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Palette, Upload, Save, Eye } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Heading from '../../components/Heading';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { whiteLabelService, OrganizationBranding } from '../../lib/db/whiteLabel';
import { hasPermission } from '../../lib/permissions';

export default function BrandingSettings() {
  const { user, currentOrganization, profile } = useAuth();
  const [branding, setBranding] = useState<OrganizationBranding | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const [formData, setFormData] = useState({
    company_name: '',
    tagline: '',
    primary_color: '#3b82f6',
    secondary_color: '#1e293b',
    accent_color: '#10b981',
    logo_url: '',
    support_email: '',
    support_phone: '',
  });

  const canEdit = hasPermission(profile?.role, 'settings', 'update');

  useEffect(() => {
    if (currentOrganization) {
      loadBranding();
    }
  }, [currentOrganization]);

  const loadBranding = async () => {
    if (!currentOrganization) return;

    try {
      setLoading(true);
      const data = await whiteLabelService.getBranding(currentOrganization.id);

      if (data) {
        setBranding(data);
        setFormData({
          company_name: data.company_name || '',
          tagline: data.tagline || '',
          primary_color: data.primary_color,
          secondary_color: data.secondary_color,
          accent_color: data.accent_color,
          logo_url: data.logo_url || '',
          support_email: data.support_email || '',
          support_phone: data.support_phone || '',
        });
      }
    } catch (error) {
      console.error('Failed to load branding:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentOrganization || !canEdit) return;

    try {
      setSaving(true);
      await whiteLabelService.upsertBranding(currentOrganization.id, formData);
      await loadBranding();
    } catch (error) {
      console.error('Failed to save branding:', error);
      alert('Failed to save branding settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Heading
          title="Branding Settings"
          subtitle="Customize your organization's appearance"
          icon={Palette}
        />
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          {canEdit && (
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </div>
      </div>

      {!canEdit && (
        <Card className="bg-amber-500/10 border-amber-500/20">
          <p className="text-sm text-amber-300">
            You do not have permission to modify branding settings. Contact your administrator.
          </p>
        </Card>
      )}

      {previewMode ? (
        <BrandingPreview branding={formData} />
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Company Information */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">
              Company Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) =>
                    setFormData({ ...formData, company_name: e.target.value })
                  }
                  disabled={!canEdit}
                  placeholder="Your Company Name"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) =>
                    setFormData({ ...formData, tagline: e.target.value })
                  }
                  disabled={!canEdit}
                  placeholder="Your tagline"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Logo URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.logo_url}
                    onChange={(e) =>
                      setFormData({ ...formData, logo_url: e.target.value })
                    }
                    disabled={!canEdit}
                    placeholder="https://example.com/logo.png"
                    className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  />
                  <Button variant="secondary" size="sm" disabled={!canEdit}>
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
                {formData.logo_url && (
                  <div className="mt-2 p-4 bg-slate-800 rounded-lg">
                    <img
                      src={formData.logo_url}
                      alt="Logo preview"
                      className="h-12 object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Brand Colors */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">
              Brand Colors
            </h3>
            <div className="space-y-4">
              <ColorPicker
                label="Primary Color"
                value={formData.primary_color}
                onChange={(color) =>
                  setFormData({ ...formData, primary_color: color })
                }
                disabled={!canEdit}
              />

              <ColorPicker
                label="Secondary Color"
                value={formData.secondary_color}
                onChange={(color) =>
                  setFormData({ ...formData, secondary_color: color })
                }
                disabled={!canEdit}
              />

              <ColorPicker
                label="Accent Color"
                value={formData.accent_color}
                onChange={(color) =>
                  setFormData({ ...formData, accent_color: color })
                }
                disabled={!canEdit}
              />
            </div>
          </Card>

          {/* Contact Information */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">
              Contact Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Support Email
                </label>
                <input
                  type="email"
                  value={formData.support_email}
                  onChange={(e) =>
                    setFormData({ ...formData, support_email: e.target.value })
                  }
                  disabled={!canEdit}
                  placeholder="support@example.com"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Support Phone
                </label>
                <input
                  type="tel"
                  value={formData.support_phone}
                  onChange={(e) =>
                    setFormData({ ...formData, support_phone: e.target.value })
                  }
                  disabled={!canEdit}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

function ColorPicker({ label, value, onChange, disabled }: ColorPickerProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {label}
      </label>
      <div className="flex gap-3 items-center">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-16 h-10 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50 font-mono text-sm"
        />
        <div
          className="w-10 h-10 rounded-lg border-2 border-slate-600"
          style={{ backgroundColor: value }}
        />
      </div>
    </div>
  );
}

interface BrandingPreviewProps {
  branding: Partial<OrganizationBranding>;
}

function BrandingPreview({ branding }: BrandingPreviewProps) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-white mb-6">Preview</h3>

      <div className="space-y-6">
        {/* Header Preview */}
        <div
          className="p-6 rounded-lg"
          style={{ backgroundColor: branding.secondary_color }}
        >
          <div className="flex items-center gap-4">
            {branding.logo_url ? (
              <img
                src={branding.logo_url}
                alt="Logo"
                className="h-10 object-contain"
              />
            ) : (
              <div className="text-2xl font-bold" style={{ color: branding.primary_color }}>
                {branding.company_name || 'Your Company'}
              </div>
            )}
          </div>
          {branding.tagline && (
            <p className="mt-2 text-sm text-slate-400">{branding.tagline}</p>
          )}
        </div>

        {/* Button Preview */}
        <div>
          <p className="text-sm text-slate-400 mb-3">Button Styles</p>
          <div className="flex gap-3">
            <button
              className="px-6 py-2 rounded-lg font-medium text-white transition-colors"
              style={{ backgroundColor: branding.primary_color }}
            >
              Primary Button
            </button>
            <button
              className="px-6 py-2 rounded-lg font-medium text-white transition-colors"
              style={{ backgroundColor: branding.accent_color }}
            >
              Accent Button
            </button>
          </div>
        </div>

        {/* Contact Info Preview */}
        {(branding.support_email || branding.support_phone) && (
          <div>
            <p className="text-sm text-slate-400 mb-3">Contact Information</p>
            <div className="space-y-2 text-sm">
              {branding.support_email && (
                <p className="text-slate-300">Email: {branding.support_email}</p>
              )}
              {branding.support_phone && (
                <p className="text-slate-300">Phone: {branding.support_phone}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
