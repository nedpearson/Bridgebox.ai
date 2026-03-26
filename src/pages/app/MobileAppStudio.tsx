import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, LayoutTemplate, Palette, Settings, Image as ImageIcon, Save, CheckCircle2, Navigation2, Menu } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Heading from '../../components/Heading';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { whiteLabelService, OrganizationBranding } from '../../lib/db/whiteLabel';

export default function MobileAppStudio() {
  const { currentOrganization } = useAuth();
  const [branding, setBranding] = useState<OrganizationBranding | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // App Studio specific configurations mapped to branding metadata
  const [appConfig, setAppConfig] = useState({
    appName: '',
    shortName: '',
    themeColor: '#3B82F6',
    backgroundColor: '#0f172a',
    navigationStyle: 'bottom' as 'bottom' | 'sidebar',
    showSplash: true,
  });

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
        setAppConfig({
          appName: data.company_name || 'Bridgebox',
          shortName: data.company_name?.substring(0, 10) || 'App',
          themeColor: data.primary_color || '#3B82F6',
          backgroundColor: data.metadata?.app_bg_color || '#0f172a',
          navigationStyle: data.metadata?.app_nav_style || 'bottom',
          showSplash: data.metadata?.app_show_splash ?? true,
        });
      }
    } catch (error) {
      console.error('Failed to load branding:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentOrganization) return;
    try {
      setSaving(true);
      
      const updatedMetadata = {
        ...(branding?.metadata || {}),
        app_bg_color: appConfig.backgroundColor,
        app_nav_style: appConfig.navigationStyle,
        app_show_splash: appConfig.showSplash,
      };

      await whiteLabelService.upsertBranding(currentOrganization.id, {
        company_name: appConfig.appName,
        primary_color: appConfig.themeColor,
        metadata: updatedMetadata
      });
      
      // Usually here you would trigger a webhook to rebuild the PWA manifest natively
      
    } catch (error) {
      console.error('Failed to save app config:', error);
      alert('Failed to save layout settings');
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
          title="Web App Builder Studio"
          subtitle="Customize the Progressive Web App layout, features, and native feel"
        />
        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Publishing...' : 'Publish App Layout'}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Side: Configuration Studio */}
        <div className="lg:col-span-7 space-y-6">
          
          <Card>
             <div className="flex items-center gap-2 mb-4">
               <LayoutTemplate className="w-5 h-5 text-indigo-400" />
               <h3 className="text-lg font-semibold text-white">App Identity</h3>
             </div>
             
             <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">App Name (For Homescreen iOS/Android)</label>
                  <input
                    type="text"
                    value={appConfig.appName}
                    onChange={(e) => setAppConfig({ ...appConfig, appName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Short Name (Required for limits via Web Manifest)</label>
                  <input
                    type="text"
                    value={appConfig.shortName}
                    maxLength={12}
                    onChange={(e) => setAppConfig({ ...appConfig, shortName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
               </div>
             </div>
          </Card>

          <Card>
             <div className="flex items-center gap-2 mb-4">
               <Palette className="w-5 h-5 text-rose-400" />
               <h3 className="text-lg font-semibold text-white">Theming & Assets</h3>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Theme Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={appConfig.themeColor}
                      onChange={(e) => setAppConfig({ ...appConfig, themeColor: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer bg-slate-800 border-none"
                    />
                    <span className="text-sm font-mono text-slate-400">{appConfig.themeColor}</span>
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={appConfig.backgroundColor}
                      onChange={(e) => setAppConfig({ ...appConfig, backgroundColor: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer bg-slate-800 border-none"
                    />
                    <span className="text-sm font-mono text-slate-400">{appConfig.backgroundColor}</span>
                  </div>
               </div>
             </div>
          </Card>

          <Card>
             <div className="flex items-center gap-2 mb-4">
               <Settings className="w-5 h-5 text-emerald-400" />
               <h3 className="text-lg font-semibold text-white">Layout Structure</h3>
             </div>
             
             <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => setAppConfig({ ...appConfig, navigationStyle: 'bottom' })}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${appConfig.navigationStyle === 'bottom' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'}`}
                  >
                    <div className="flex justify-center mb-3">
                      <div className="w-full h-12 border-2 border-slate-600 rounded flex flex-col justify-end p-1">
                        <div className="w-full h-3 bg-slate-600 rounded-sm flex justify-around items-center px-1">
                           <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                           <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                           <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                        </div>
                      </div>
                    </div>
                    <p className="text-center text-sm font-medium text-white">Bottom Navigation</p>
                    <p className="text-center text-xs text-slate-400 mt-1">Native iOS Feel</p>
                  </div>

                  <div 
                    onClick={() => setAppConfig({ ...appConfig, navigationStyle: 'sidebar' })}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${appConfig.navigationStyle === 'sidebar' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'}`}
                  >
                    <div className="flex justify-center mb-3">
                      <div className="w-full h-12 border-2 border-slate-600 rounded flex p-1 gap-1">
                        <div className="h-full w-2 bg-slate-600 rounded-sm"></div>
                        <div className="h-full flex-1 bg-slate-700/50 rounded-sm"></div>
                      </div>
                    </div>
                    <p className="text-center text-sm font-medium text-white">Slide-out Menus</p>
                    <p className="text-center text-xs text-slate-400 mt-1">Information Dense</p>
                  </div>
               </div>

               <div className="flex items-center gap-3 pt-4 border-t border-slate-700">
                  <input
                    type="checkbox"
                    checked={appConfig.showSplash}
                    onChange={(e) => setAppConfig({ ...appConfig, showSplash: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900"
                  />
                  <label className="text-sm text-slate-300">Generate PWA Native Splash Screens on load</label>
               </div>
             </div>
          </Card>

        </div>

        {/* Right Side: Live Device Preview */}
        <div className="lg:col-span-5 flex justify-center sticky top-6 self-start">
           
           <div className="relative">
             {/* iOS Device Frame Mock */}
             <div className="w-[320px] h-[650px] bg-black rounded-[40px] shadow-2xl border-[12px] border-black overflow-hidden relative" style={{ backgroundColor: appConfig.backgroundColor }}>
                
                {/* Dynamic Notch */}
                <div className="absolute top-0 inset-x-0 h-6 bg-black z-50 rounded-b-2xl mx-16"></div>
                
                {/* Header (Depends on Nav Style) */}
                <div className="absolute top-0 inset-x-0 h-24 pt-8 px-4 flex items-center justify-between z-40 transition-colors" style={{ backgroundColor: appConfig.themeColor }}>
                   {appConfig.navigationStyle === 'sidebar' && (
                     <Menu className="w-5 h-5 text-white/90" />
                   )}
                   <h1 className="text-white font-semibold flex-1 text-center text-sm truncate px-2">{appConfig.appName}</h1>
                   {appConfig.navigationStyle === 'sidebar' && <div className="w-5"></div> /* spacer */}
                </div>

                {/* Dashboard Fake Content */}
                <div className="absolute top-24 bottom-20 inset-x-0 overflow-y-auto p-4 space-y-4">
                  <div className="w-full h-24 rounded-2xl bg-white/5 border border-white/10 p-4">
                     <div className="w-20 h-4 bg-white/20 rounded mb-4"></div>
                     <div className="flex justify-between items-end">
                       <div className="w-16 h-8 bg-white/30 rounded"></div>
                       <div className="w-8 h-8 rounded-full" style={{ backgroundColor: appConfig.themeColor }}></div>
                     </div>
                  </div>
                  <div className="w-full h-32 rounded-2xl bg-white/5 border border-white/10 p-4">
                     <div className="w-24 h-4 bg-white/20 rounded mb-4"></div>
                     <div className="space-y-2">
                       <div className="w-full h-3 bg-white/10 rounded"></div>
                       <div className="w-5/6 h-3 bg-white/10 rounded"></div>
                       <div className="w-4/6 h-3 bg-white/10 rounded"></div>
                     </div>
                  </div>
                </div>

                {/* Bottom Navigation */}
                {appConfig.navigationStyle === 'bottom' && (
                  <div className="absolute bottom-0 inset-x-0 h-20 bg-slate-900 border-t border-white/10 flex justify-around items-center px-4 pb-4 z-40">
                     <div className="flex flex-col items-center gap-1 opacity-100">
                       <Navigation2 className="w-5 h-5" style={{ color: appConfig.themeColor }} />
                       <div className="w-1 h-1 rounded-full" style={{ backgroundColor: appConfig.themeColor }}></div>
                     </div>
                     <div className="flex flex-col items-center gap-1 opacity-50">
                       <LayoutTemplate className="w-5 h-5 text-white" />
                     </div>
                     <div className="flex flex-col items-center gap-1 opacity-50">
                       <Settings className="w-5 h-5 text-white" />
                     </div>
                  </div>
                )}
             </div>

             {/* Reflection highlight */}
             <div className="pointer-events-none absolute -inset-4 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 rounded-[48px] blur-sm mix-blend-overlay"></div>
           </div>

        </div>

      </div>
    </div>
  );
}
