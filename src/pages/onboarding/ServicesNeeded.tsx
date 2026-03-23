import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Briefcase, Check } from 'lucide-react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { SERVICE_OPTIONS } from '../../types/onboarding';

export default function ServicesNeeded() {
  const { onboardingData, updateOnboardingData, saveOnboarding, setCurrentStep } = useOnboarding();
  const [selectedServices, setSelectedServices] = useState<string[]>(
    onboardingData.services_needed || []
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSelectedServices(onboardingData.services_needed || []);
  }, [onboardingData.services_needed]);

  const toggleService = (value: string) => {
    setSelectedServices((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  const handleNext = async () => {
    setIsSaving(true);
    try {
      updateOnboardingData({ services_needed: selectedServices });
      await saveOnboarding();
      setCurrentStep(3);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const isValid = selectedServices.length > 0;

  return (
    <div className="max-w-3xl mx-auto">
      <Card glass className="p-10">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-[#3B82F6] to-[#10B981] rounded-xl flex items-center justify-center">
            <Briefcase className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Services Needed</h2>
            <p className="text-slate-400 mt-1">Select all services you're interested in</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {SERVICE_OPTIONS.map((service, index) => {
            const isSelected = selectedServices.includes(service.value);

            return (
              <motion.button
                key={service.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => toggleService(service.value)}
                className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-[#3B82F6] bg-[#3B82F6]/10'
                    : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{service.label}</h3>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      isSelected
                        ? 'border-[#3B82F6] bg-[#3B82F6]'
                        : 'border-slate-600 bg-slate-800'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {selectedServices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-lg p-4 mb-6"
          >
            <p className="text-sm text-[#3B82F6] font-medium">
              {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} selected
            </p>
          </motion.div>
        )}

        <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-700">
          <Button variant="outline" onClick={() => setCurrentStep(1)}>
            <ArrowLeft className="mr-2 w-5 h-5" /> Back
          </Button>

          <Button variant="primary" onClick={handleNext} disabled={!isValid || isSaving}>
            {isSaving ? 'Saving...' : 'Continue'} <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
