import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Map, PlayCircle, Zap, Building2, CreditCard, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Logger } from '../../lib/logger';

interface TourStep {
   title: string;
   description: string;
   icon: React.ElementType;
   targetSelector?: string; // If we want to spotlight a DOM element later
}

const TOUR_STEPS: TourStep[] = [
   {
      title: "Welcome to Bridgebox",
      description: "This is your intelligent operating system. Everything from client intake to invoicing is managed from this central command center.",
      icon: Map
   },
   {
      title: "Workflow Automation",
      description: "Trigger multi-step automations. Send contracts, alert staff, and sync third-party tools instantly without writing code.",
      icon: Zap
   },
   {
      title: "Client & CRM Hub",
      description: "Track every lead, view project communication history, and manage secure document exchanges in one unified record.",
      icon: Building2
   },
   {
      title: "Intelligent Billing",
      description: "Automate invoicing, set up subscriptions, and sync natively with QuickBooks or Xero.",
      icon: CreditCard
   },
   {
      title: "Mobile Field Apps",
      description: "Deploy white-labeled mobile apps for your staff and clients instantly. Offline-ready and heavily tokenized.",
      icon: Smartphone
   }
];

export default function GuidedTour({ onClose, isDemo }: { onClose: () => void, isDemo: boolean }) {
   const [currentStep, setCurrentStep] = useState(0);
   const [isVisible, setIsVisible] = useState(true);
   const navigate = useNavigate();

   // Only show if the workspace is explicitly a demo payload
   if (!isDemo || !isVisible) return null;

   const step = TOUR_STEPS[currentStep];
   const isLast = currentStep === TOUR_STEPS.length - 1;

   const handleNext = () => {
      if (isLast) {
         setIsVisible(false);
         Logger.info('[Analytics] Demo Guided Tour Completed', { source: 'guided_tour' });
         // Conversion Trigger
         navigate('/sales-onboarding');
      } else {
         setCurrentStep(c => c + 1);
      }
   };

   return (
      <AnimatePresence>
         {isVisible && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none p-4 pb-24 sm:p-0">
               {/* Translucent overlay to focus the user */}
               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px] pointer-events-auto"
               />

               <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="w-full max-w-md bg-slate-900 border border-[#3B82F6]/30 rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.15)] pointer-events-auto relative overflow-hidden"
               >
                  {/* Decorative glow */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#3B82F6] to-cyan-400" />
                  
                  <div className="p-6">
                     <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-xl flex items-center justify-center">
                           <step.icon className="w-6 h-6 text-[#3B82F6]" />
                        </div>
                        <button onClick={() => setIsVisible(false)} className="text-slate-500 hover:text-white transition-colors">
                           <X className="w-5 h-5" />
                        </button>
                     </div>

                     <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                     <p className="text-slate-400 text-sm leading-relaxed mb-8">
                        {step.description}
                     </p>

                     <div className="flex items-center justify-between">
                        {/* Pagination Dots */}
                        <div className="flex space-x-1.5">
                           {TOUR_STEPS.map((_, i) => (
                              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-6 bg-[#3B82F6]' : 'w-1.5 bg-slate-800'}`} />
                           ))}
                        </div>

                        {/* Controls */}
                        <div className="flex space-x-2 items-center">
                           <button 
                              onClick={() => {
                                 setIsVisible(false);
                                 Logger.info('[Analytics] Demo Tour Skipped', { source: 'guided_tour' });
                              }}
                              className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mr-2"
                           >
                              Skip Tour
                           </button>
                           {currentStep > 0 && (
                              <button 
                                 onClick={() => setCurrentStep(c => c - 1)}
                                 className="p-2 border border-slate-700 bg-slate-800 rounded-lg text-white hover:bg-slate-700 transition"
                              >
                                 <ChevronLeft className="w-4 h-4" />
                              </button>
                           )}
                           <button 
                              onClick={handleNext}
                              className="px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium rounded-lg flex items-center shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all"
                           >
                              {isLast ? (
                                 <>Start Customizing <PlayCircle className="w-4 h-4 ml-2" /></>
                              ) : (
                                 <>Next <ChevronRight className="w-4 h-4 ml-1" /></>
                              )}
                           </button>
                        </div>
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
   );
}
