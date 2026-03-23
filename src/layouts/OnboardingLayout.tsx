import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useOnboarding } from '../contexts/OnboardingContext';

interface OnboardingLayoutProps {
  children: ReactNode;
}

const STEPS = [
  { id: 0, name: 'Welcome' },
  { id: 1, name: 'Company' },
  { id: 2, name: 'Services' },
  { id: 3, name: 'Systems' },
  { id: 4, name: 'Goals' },
  { id: 5, name: 'Timeline' },
  { id: 6, name: 'Review' },
];

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  const { currentStep, totalSteps } = useOnboarding();

  const progress = (currentStep / (totalSteps - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-slate-400">
              Step {currentStep + 1} of {totalSteps}
            </h2>
            <div className="text-sm font-medium text-[#3B82F6]">{Math.round(progress)}% Complete</div>
          </div>

          <div className="relative">
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#3B82F6] to-[#10B981]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>

            <div className="flex justify-between mt-6">
              {STEPS.map((step) => {
                const isCompleted = step.id < currentStep;
                const isCurrent = step.id === currentStep;

                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: step.id * 0.05 }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCompleted
                          ? 'bg-[#10B981] border-[#10B981]'
                          : isCurrent
                          ? 'bg-[#3B82F6] border-[#3B82F6]'
                          : 'bg-slate-800 border-slate-700'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <span
                          className={`text-sm font-semibold ${
                            isCurrent ? 'text-white' : 'text-slate-500'
                          }`}
                        >
                          {step.id + 1}
                        </span>
                      )}
                    </motion.div>
                    <span
                      className={`text-xs mt-2 font-medium ${
                        isCompleted || isCurrent ? 'text-white' : 'text-slate-500'
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
