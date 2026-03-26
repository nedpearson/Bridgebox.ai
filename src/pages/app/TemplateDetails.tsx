import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RefreshCw, ArrowLeft, CheckCircle2, ShieldAlert, Sparkles, Building2, Workflow, Bot, FileText, LayoutTemplate, Copy } from 'lucide-react';
import { templateService, BridgeboxTemplate } from '../../lib/db/templates';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import TemplateInstallWizard from '../../components/app/TemplateInstallWizard';

export default function TemplateDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<BridgeboxTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadTemplate(id);
    }
  }, [id]);

  const loadTemplate = async (templateId: string) => {
    try {
      setLoading(true);
      const data = await templateService.getTemplateById(templateId);
      setTemplate(data);
    } catch (error) {
      console.error('Failed to load template details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        <div className="text-center py-24 bg-slate-800/50 rounded-xl border border-white/5">
          <ShieldAlert className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Template Not Found</h2>
          <p className="text-slate-400 mb-6">This template may have been unpublished or removed.</p>
          <Button onClick={() => navigate('/app/templates')} variant="secondary">Back to Store</Button>
        </div>
      </div>
    );
  }

  const payload = template.configuration_payload || {};
  const entitiesCount = payload.entities?.length || 0;
  const workflowsCount = payload.workflows?.length || 0;
  const formsCount = payload.forms?.length || 0;
  const aiAgentsCount = payload.ai_agents?.length || 0;

  // Calculate dynamic metered billing threshold preview
  const estimatedCost = (aiAgentsCount * 10) + (formsCount * 5) + (workflowsCount * 2);

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8">
      <div className="flex items-center space-x-4 mb-6">
        <button 
           onClick={() => navigate('/app/templates')}
           className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors border border-white/5"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <span>{template.name}</span>
            <Badge variant="success">v{template.version}</Badge>
          </h1>
          <p className="text-slate-400 capitalize">{template.category.replace('_', ' ')} Pack</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content: Overview & Breakdown */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-slate-800/40 border-slate-700/50">
             <h3 className="text-lg font-semibold text-white mb-4">Architecture Overview</h3>
             <p className="text-slate-300 leading-relaxed mb-6">
               {template.description || 'This structural container will map the requisite database schemas, logical workflows, and AI agents into your Bridgebox tenant.'}
             </p>
             
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {[
                 { label: 'Entities', val: entitiesCount, icon: Building2, color: 'text-blue-400' },
                 { label: 'Workflows', val: workflowsCount, icon: Workflow, color: 'text-purple-400' },
                 { label: 'Forms & Views', val: formsCount, icon: LayoutTemplate, color: 'text-emerald-400' },
                 { label: 'AI Agents', val: aiAgentsCount, icon: Bot, color: 'text-rose-400' },
               ].map((stat, i) => (
                 <div key={i} className="bg-slate-900/50 p-4 border border-white/5 rounded-xl text-center">
                    <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                    <div className="text-2xl font-bold text-white">{stat.val}</div>
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</div>
                 </div>
               ))}
             </div>
          </Card>
          
          <Card className="bg-slate-800/40 border-slate-700/50">
             <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-indigo-400" />
                Raw Data Manifest Preview
             </h3>
             <div className="bg-slate-950 p-4 rounded-lg font-mono text-xs text-slate-300 overflow-x-auto border border-white/5 relative group">
                <button className="absolute top-2 right-2 p-1.5 bg-slate-800 rounded text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Copy className="w-4 h-4" />
                </button>
                <pre>{JSON.stringify(payload, null, 2)}</pre>
             </div>
          </Card>
        </div>

        {/* Sidebar: Install Panel */}
        <div className="space-y-6">
           <Card className="bg-gradient-to-br from-indigo-900/50 to-slate-900 border-indigo-500/30">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <RefreshCw className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                   <h3 className="text-lg font-semibold text-white">Ready to Deploy</h3>
                   <p className="text-sm text-indigo-200">1-Click Tenant Provisioning</p>
                </div>
              </div>
              
              <ul className="space-y-3 mb-8">
                 <li className="flex items-start space-x-3 text-sm text-slate-300">
                   <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                   <span>Creates isolated data schemas</span>
                 </li>
                 <li className="flex items-start space-x-3 text-sm text-slate-300">
                   <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                   <span>Generates default internal UI views</span>
                 </li>
                 <li className="flex items-start space-x-3 text-sm text-slate-300">
                   <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                   <span>Injects AI prompt routing</span>
                 </li>
                 <li className="flex items-start space-x-3 text-sm text-slate-300">
                   <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                   <span>Inherits multi-tenant RLS</span>
                 </li>
              </ul>
              
              <div className="bg-slate-900 border border-indigo-500/30 rounded-lg p-4 mb-6">
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-400">Estimated MRR Impact</span>
                    <span className="text-lg font-bold text-white">${estimatedCost}.00<span className="text-sm text-slate-500 font-normal">/mo</span></span>
                 </div>
                 <p className="text-xs text-slate-500">Billed incrementally per consumption thresholds upon execution.</p>
              </div>
              
              <Button 
                onClick={() => setIsInstallModalOpen(true)} 
                className="w-full justify-center bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 border-none shadow-lg shadow-indigo-500/25"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Install Template OS
              </Button>
           </Card>
        </div>
        
      </div>

      <TemplateInstallWizard 
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        template={template}
        onSuccess={() => {
           // Optionally refetch or show a toast
        }}
      />
    </div>
  );
}
