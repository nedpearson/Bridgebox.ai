import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, RefreshCw, Layers, Database, Shield } from 'lucide-react';
import { BridgeboxTemplate, templateService } from '../../lib/db/templates';
import { templateInstallEngine } from '../../lib/db/templateInstallEngine';
import { useAuth } from '../../contexts/AuthContext';
import { Smartphone, DownloadCloud, BellRing } from 'lucide-react';
import Button from '../Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  template: BridgeboxTemplate;
  onSuccess?: () => void;
}

export default function TemplateInstallWizard({ isOpen, onClose, template, onSuccess }: Props) {
  const { currentOrganization, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [isInstalling, setIsInstalling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Mobile Options Tracking
  const mobileConfig = template.configuration_payload?.mobile_config;
  const [enableStaffApp, setEnableStaffApp] = useState(mobileConfig?.staff_app?.enabled ?? false);
  const [enableCustomerApp, setEnableCustomerApp] = useState(mobileConfig?.customer_app?.enabled ?? false);
  const [enableOfflineSync, setEnableOfflineSync] = useState(mobileConfig?.offline_sync_enabled ?? false);

  const handleInstall = async () => {
    if (!currentOrganization || !profile) return;
    
    setIsInstalling(true);
    setError(null);
    setStep(2); // Move to loading step
    
    try {
      // Step 1: Record the installation in the registry
      await templateService.recordInstallation(
        currentOrganization.id,
        template.id,
        template.version,
        profile.id,
        {
           mobile_deployments: {
              staff_app_enabled: enableStaffApp,
              customer_app_enabled: enableCustomerApp,
              offline_sync_active: enableOfflineSync
           }
        } // Will hold the generated schema refs
      );
      
      // Step 2: Kickoff the Template Engine unpacker
      await templateInstallEngine.unpack(template, currentOrganization.id);
      
      // Artificial UX delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStep(3); // Move to success
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Install failed:', err);
      setError(err.message || 'Failed to install template. Please contact support.');
      setStep(1); // Revert to initial step on error
    } finally {
      setIsInstalling(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
           onClick={!isInstalling ? onClose : undefined}
        />
        
        <motion.div
           initial={{ opacity: 0, scale: 0.95, y: 10 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.95, y: 10 }}
           className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          {step === 1 && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Install Template</h2>
                <button 
                  onClick={onClose}
                  className="p-2 -mr-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="bg-slate-800/50 border border-indigo-500/20 rounded-xl p-4 mb-6">
                <h3 className="text-indigo-400 font-medium mb-1">Target Workspace:</h3>
                <p className="text-white font-semibold text-lg">{currentOrganization?.name}</p>
                <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                   <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Blueprint:</span>
                      <span className="text-white font-medium">{template.name}</span>
                   </div>
                   <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Version:</span>
                      <span className="text-slate-300">v{template.version}</span>
                   </div>
                </div>
              </div>
              
              {/* Native Mobile Application Configuration */ }
              {mobileConfig && (
                 <div className="mb-6 space-y-3">
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">Native Mobile Features</h3>
                    
                    <label className="flex items-start space-x-3 p-3 rounded-lg border border-slate-700/50 bg-slate-800/30 cursor-pointer hover:bg-slate-800 transition-colors">
                       <input 
                         type="checkbox" 
                         checked={enableStaffApp} 
                         onChange={(e) => setEnableStaffApp(e.target.checked)}
                         className="mt-1 w-4 h-4 rounded border-slate-600 text-indigo-500 focus:ring-indigo-500 bg-slate-900" 
                       />
                       <div>
                          <div className="flex items-center text-white font-medium text-sm">
                             <Smartphone className="w-4 h-4 mr-2" />
                             Deploy Internal Staff App
                          </div>
                          <p className="text-xs text-slate-400 mt-1">Provisions views: {mobileConfig.staff_app?.views?.join(', ')}</p>
                       </div>
                    </label>

                    {mobileConfig.customer_app && mobileConfig.customer_app.views?.length > 0 && (
                       <label className="flex items-start space-x-3 p-3 rounded-lg border border-slate-700/50 bg-slate-800/30 cursor-pointer hover:bg-slate-800 transition-colors">
                          <input 
                            type="checkbox" 
                            checked={enableCustomerApp} 
                            onChange={(e) => setEnableCustomerApp(e.target.checked)}
                            className="mt-1 w-4 h-4 rounded border-slate-600 text-indigo-500 focus:ring-indigo-500 bg-slate-900" 
                          />
                          <div>
                             <div className="flex items-center text-white font-medium text-sm">
                                <BellRing className="w-4 h-4 mr-2" />
                                Deploy Customer Portal App
                             </div>
                             <p className="text-xs text-slate-400 mt-1">Client-facing PWA with auth wall</p>
                          </div>
                       </label>
                    )}

                    <label className="flex items-start space-x-3 p-3 rounded-lg border border-slate-700/50 bg-slate-800/30 cursor-pointer hover:bg-slate-800 transition-colors">
                       <input 
                         type="checkbox" 
                         checked={enableOfflineSync} 
                         onChange={(e) => setEnableOfflineSync(e.target.checked)}
                         className="mt-1 w-4 h-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-slate-900" 
                       />
                       <div>
                          <div className="flex items-center text-white font-medium text-sm">
                             <DownloadCloud className="w-4 h-4 mr-2" />
                             Enable Offline Sync Queue
                          </div>
                          <p className="text-xs text-slate-400 mt-1">Caches mutations locally when reception drops</p>
                       </div>
                    </label>
                 </div>
              )}
              
              {error && (
                 <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-start space-x-3 text-rose-400">
                   <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                   <p className="text-sm">{error}</p>
                 </div>
              )}
              
              <div className="flex items-center justify-end space-x-3">
                 <Button onClick={onClose} variant="secondary">Cancel</Button>
                 <Button onClick={handleInstall} variant="primary" className="bg-indigo-500 hover:bg-indigo-600 text-white border-none">
                    Confirm Installation
                 </Button>
              </div>
            </div>
          )}
          
          {step === 2 && (
             <div className="p-12 text-center">
                <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-6" />
                <h2 className="text-xl font-bold text-white mb-2">Unpacking Blueprint...</h2>
                <p className="text-indigo-200">Bridgebox is provisioning your entities and schemas.</p>
             </div>
          )}
          
          {step === 3 && (
             <div className="p-12 text-center">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                   <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Installation Complete</h2>
                <p className="text-slate-300 mb-8">
                  The {template.name} blueprint has been successfully mapped to your workspace.
                </p>
                <Button onClick={onClose} variant="primary" className="w-full justify-center bg-slate-800 hover:bg-slate-700 text-white">
                   Return to Dashboard
                </Button>
             </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
