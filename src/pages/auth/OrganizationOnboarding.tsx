import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Briefcase, Puzzle, Network, Sparkles, Smartphone, Users, CreditCard, ChevronRight, CheckCircle2, ChevronLeft, Rocket
} from 'lucide-react';
import { organizationsService } from '../../lib/db/organizations';
import { useAuth } from '../../contexts/AuthContext';
import BackgroundAtmosphere from '../../components/BackgroundAtmosphere';
import Button from '../../components/Button';

// Step definitions for the 9-stage Generative Flow
const STEPS = [
  { id: 1, title: 'Industry', icon: Briefcase },
  { id: 2, title: 'Model', icon: Puzzle },
  { id: 3, title: 'Modules', icon: Building2 },
  { id: 4, title: 'Integrations', icon: Network },
  { id: 5, title: 'AI Features', icon: Sparkles },
  { id: 6, title: 'Mobile Fleet', icon: Smartphone },
  { id: 7, title: 'Team Scale', icon: Users },
  { id: 8, title: 'Pricing Review', icon: CreditCard },
  { id: 9, title: 'Generation', icon: Rocket },
];

export default function OrganizationOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [orgData, setOrgData] = useState({
    name: '',
    industry: '',
    model: '',
    modules: [] as string[],
    integrations: [] as string[],
    ai_features: [] as string[],
    mobile_fleet: false,
    team_size: '1-5',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { setCurrentOrganization } = useAuth();

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 9));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleFinalize = async () => {
    setError('');
    setLoading(true);
    try {
      // In a real flow, we pass orgData to the backend generator here.
      const orgName = orgData.name || `${orgData.industry} Workspace`;
      const org = await organizationsService.createOrganization({ name: orgName });
      setCurrentOrganization(org);
      
      // Simulate heavy AI generative generation
      setTimeout(() => {
        navigate('/setup');
      }, 1500);
      
    } catch (err: any) {
      setError(err.message || 'Failed to generate workspace');
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    let base = 99;
    if (orgData.modules.length > 3) base += 50;
    if (orgData.ai_features.length > 0) base += 100;
    if (orgData.mobile_fleet) base += 150;
    return base;
  };

  // ---------------------------------------------------------------------------
  // RENDER HELPERS
  // ---------------------------------------------------------------------------
  const renderStepIndicator = () => (
    <div className="w-full max-w-3xl mx-auto mb-12 hidden md:block">
      <div className="flex justify-between relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -z-10 -translate-y-1/2 rounded-full"></div>
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-indigo-500 -z-10 -translate-y-1/2 rounded-full transition-all duration-500"
          style={{ width: `${((currentStep - 1) / 8) * 100}%` }}
        ></div>
        
        {STEPS.map((step) => {
          const isPast = step.id < currentStep;
          const isActive = step.id === currentStep;
          
          return (
            <div key={step.id} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                isActive ? 'bg-indigo-500 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' :
                isPast ? 'bg-slate-800 border-indigo-500 text-indigo-400' :
                'bg-slate-900 border-slate-700 text-slate-500'
              }`}>
                {isPast ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-4 h-4" />}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-indigo-300' : isPast ? 'text-slate-400' : 'text-slate-600'}`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white text-center mb-8">What industry are you operating in?</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {['Legal & Law', 'Construction', 'Healthcare', 'Logistics', 'Retail', 'Consulting', 'Real Estate', 'Manufacturing'].map(ind => (
                <button 
                  key={ind}
                  onClick={() => setOrgData({ ...orgData, industry: ind })}
                  className={`p-6 rounded-2xl border text-center transition-all ${
                    orgData.industry === ind ? 'bg-indigo-500/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'bg-slate-900/40 border-slate-700/50 hover:bg-slate-800/80'
                  }`}
                >
                  <span className={`font-medium ${orgData.industry === ind ? 'text-indigo-300' : 'text-slate-300'}`}>{ind}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white text-center mb-8">What is your primary revenue model?</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { id: 'b2b_saas', label: 'B2B Services', desc: 'Retainers, milestones, and ongoing client operations' },
                { id: 'b2c_retail', label: 'B2C Retail/E-comm', desc: 'High-volume transactions, inventory, and POS' },
                { id: 'marketplace', label: 'Marketplace', desc: 'Matching buyers with sellers, commission tracking' }
              ].map(model => (
                <button 
                  key={model.id}
                  onClick={() => setOrgData({ ...orgData, model: model.id })}
                  className={`p-6 rounded-2xl border text-left transition-all ${
                    orgData.model === model.id ? 'bg-indigo-500/20 border-indigo-500' : 'bg-slate-900/40 border-slate-700/50 hover:bg-slate-800/80'
                  }`}
                >
                  <div className={`font-bold text-lg mb-2 ${orgData.model === model.id ? 'text-indigo-300' : 'text-white'}`}>{model.label}</div>
                  <div className="text-sm text-slate-400">{model.desc}</div>
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
      case 4:
      case 5:
        // Condensed mock logic for Modules/Integrations/AI to keep file size reasonable
        const options = currentStep === 3 
          ? ['CRM', 'Invoicing', 'Project Management', 'Inventory', 'Payroll']
          : currentStep === 4 
          ? ['QuickBooks', 'Stripe', 'Twilio', 'Slack', 'Zendesk']
          : ['Document Extraction', 'Voice Drafting', 'Predictive Scoring', 'Automated Emails'];
          
        const key = currentStep === 3 ? 'modules' : currentStep === 4 ? 'integrations' : 'ai_features';
        
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              {currentStep === 3 ? 'Select Core Operational Modules' : currentStep === 4 ? 'Which tools do you already use?' : 'Enable Copilot Intelligence Features'}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {options.map(opt => {
                const isSelected = (orgData as any)[key].includes(opt);
                return (
                  <button 
                    key={opt}
                    onClick={() => {
                      const list = (orgData as any)[key];
                      setOrgData({ ...orgData, [key]: isSelected ? list.filter((i: string) => i !== opt) : [...list, opt] });
                    }}
                    className={`p-5 rounded-2xl border flex items-center justify-between transition-all ${
                      isSelected ? 'bg-indigo-500/20 border-indigo-500' : 'bg-slate-900/40 border-slate-700/50 hover:bg-slate-800/80'
                    }`}
                  >
                    <span className={`font-bold ${isSelected ? 'text-indigo-300' : 'text-slate-200'}`}>{opt}</span>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-400" />}
                  </button>
                )
              })}
            </div>
          </div>
        );
      case 6:
        return (
           <div className="space-y-6 max-w-2xl mx-auto text-center">
             <div className="w-24 h-24 bg-sky-500/10 rounded-full border border-sky-500/30 flex items-center justify-center mx-auto mb-6">
                <Smartphone className="w-12 h-12 text-sky-400" />
             </div>
             <h2 className="text-3xl font-bold text-white mb-4">Deploy Field Operations?</h2>
             <p className="text-slate-400 mb-8">Do you have staff that need a native mobile workspace for camera uploads, GPS check-ins, or offline syncs?</p>
             <div className="flex justify-center gap-4">
                <button onClick={() => setOrgData({...orgData, mobile_fleet: true})} className={`px-8 py-4 rounded-xl border font-bold text-lg transition-all ${orgData.mobile_fleet ? 'bg-sky-500 border-sky-400 text-white shadow-[0_0_20px_rgba(14,165,233,0.4)]' : 'bg-slate-900/40 border-slate-700/50 text-slate-300'}`}>Yes, Enable Mobile</button>
                <button onClick={() => setOrgData({...orgData, mobile_fleet: false})} className={`px-8 py-4 rounded-xl border font-bold text-lg transition-all ${!orgData.mobile_fleet ? 'bg-slate-700 border-slate-500 text-white' : 'bg-slate-900/40 border-slate-700/50 text-slate-300'}`}>Not right now</button>
             </div>
           </div>
        )
      case 7:
        return (
           <div className="space-y-6 max-w-md mx-auto">
             <h2 className="text-3xl font-bold text-white text-center mb-8">Final Details</h2>
             <div>
               <label className="block text-slate-400 font-medium mb-2">Your Workspace Name</label>
               <input 
                 value={orgData.name} 
                 onChange={e => setOrgData({...orgData, name: e.target.value})} 
                 placeholder={`${orgData.industry} HQ`}
                 className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-white text-lg focus:border-indigo-500 outline-none" 
               />
             </div>
             <div>
               <label className="block text-slate-400 font-medium mt-6 mb-2">Team Size</label>
               <select 
                 value={orgData.team_size} 
                 onChange={e => setOrgData({...orgData, team_size: e.target.value})}
                 className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"
               >
                 <option>1-5</option>
                 <option>6-20</option>
                 <option>21-50</option>
                 <option>50+</option>
               </select>
             </div>
           </div>
        )
      case 8:
        return (
           <div className="space-y-6 max-w-3xl mx-auto">
             <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full -mr-20 -mt-20"></div>
               <h2 className="text-3xl font-bold text-white mb-2">Your Tailored OS</h2>
               <p className="text-slate-400 mb-8 border-b border-white/5 pb-6">We have structured a completely bespoke system based on your unique requirements.</p>
               
               <div className="grid md:grid-cols-2 gap-8 relative z-10">
                 <div className="space-y-4">
                   <div className="text-sm font-bold text-slate-500 uppercase">Architecture Included</div>
                   <ul className="space-y-3">
                     <li className="flex gap-2 items-center text-slate-300"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> {orgData.industry} ({orgData.model}) Base Template</li>
                     {orgData.modules.map(m => <li key={m} className="flex gap-2 items-center text-slate-300"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> {m} Module</li>)}
                     {orgData.ai_features.length > 0 && <li className="flex gap-2 items-center text-indigo-300 font-medium"><Sparkles className="w-4 h-4" /> Cognitive AI Enabled</li>}
                     {orgData.mobile_fleet && <li className="flex gap-2 items-center text-sky-300 font-medium"><Smartphone className="w-4 h-4" /> Native Mobile Dispatch Configured</li>}
                   </ul>
                 </div>
                 
                 <div className="bg-slate-950/50 rounded-2xl p-6 border border-white/5">
                   <div className="text-sm font-bold text-slate-500 uppercase mb-4">Estimated Platform Cost</div>
                   <div className="text-5xl font-black text-white mb-2">${calculatePrice()} <span className="text-lg text-slate-500 font-normal">/mo</span></div>
                   <p className="text-xs text-slate-400 mb-6">Billed annually. Adjustments can be made later.</p>
                   <Button onClick={handleNext} className="w-full bg-white text-indigo-900 hover:bg-slate-200">Acknowledge & Generate</Button>
                 </div>
               </div>
             </div>
           </div>
        )
      case 9:
        return (
           <div className="flex flex-col items-center justify-center py-20 text-center">
             <div className="relative mb-12">
               <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full animate-ping"></div>
               <div className="w-32 h-32 bg-indigo-500/20 rounded-full border border-indigo-400 flex items-center justify-center relative z-10 shadow-[0_0_50px_rgba(99,102,241,0.5)]">
                 <Rocket className="w-12 h-12 text-indigo-300 animate-pulse" />
               </div>
             </div>
             
             <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Compiling Your Workspace</h2>
             <p className="text-xl text-slate-400 max-w-xl mb-12">
               Bridgebox is currently writing database permissions, binding {orgData.integrations.length} webhook listeners, and generating mobile UI routes dynamically.
             </p>
             
             {!loading ? (
                <Button onClick={handleFinalize} size="lg" className="px-12 py-4 text-lg animate-bounce">Launch My System</Button>
             ) : (
                <div className="flex items-center gap-3 text-indigo-400 font-medium bg-indigo-500/10 px-6 py-3 rounded-full border border-indigo-500/30">
                  <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                  Finalizing database transactions...
                </div>
             )}
           </div>
        )
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col pt-12 md:pt-24 px-4 overflow-x-hidden relative">
      <BackgroundAtmosphere />

      <div className="w-full max-w-5xl mx-auto relative z-10 flex-1 flex flex-col">
        
        {/* Step Timeline Indicator */}
        {renderStepIndicator()}
        
        {/* Dynamic Content Window */}
        <div className="flex-1 w-full max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Global Bottom Navigation controls (Hidden on specific steps) */}
        {currentStep < 8 && (
          <div className="w-full max-w-3xl mx-auto py-8 flex justify-between items-center border-t border-slate-800/50 mt-12">
            <button 
               onClick={handleBack} 
               disabled={currentStep === 1}
               className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all ${currentStep === 1 ? 'opacity-0 cursor-default' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <ChevronLeft className="w-5 h-5 mr-2" /> Back
            </button>
            <Button onClick={handleNext} variant="primary" size="lg" className="px-8 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              Continue <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
