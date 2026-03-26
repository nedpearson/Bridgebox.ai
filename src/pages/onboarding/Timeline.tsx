import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Clock } from 'lucide-react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { TIMELINE_OPTIONS } from '../../types/onboarding';

export default function Timeline() {
  const { onboardingData, updateOnboardingData, saveOnboarding, setCurrentStep } = useOnboarding();
  const [formData, setFormData] = useState({
    timeline: onboardingData.timeline || '',
    additional_notes: onboardingData.additional_notes || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData({
      timeline: onboardingData.timeline || '',
      additional_notes: onboardingData.additional_notes || '',
    });
  }, [onboardingData]);

  const handleNext = async () => {
    setIsSaving(true);
    try {
      updateOnboardingData(formData);
      await saveOnboarding();
      setCurrentStep(6);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const isValid = formData.timeline;

  return (
    <div className="max-w-3xl mx-auto">
      <Card glass className="p-10">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-[#10B981] rounded-xl flex items-center justify-center">
            <Clock className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Timeline & Priority</h2>
            <p className="text-slate-400 mt-1">When would you like to get started?</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-4">
              Desired Timeline <span className="text-red-400">*</span>
            </label>
            <div className="space-y-3">
              {TIMELINE_OPTIONS.map((option, index) => (
                <motion.label
                  key={option.value}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.timeline === option.value
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="timeline"
                    value={option.value}
                    checked={formData.timeline === option.value}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    className="w-5 h-5 text-indigo-500 border-slate-600 focus:ring-indigo-500 focus:ring-offset-0"
                  />
                  <span className="ml-3 text-white font-medium">{option.label}</span>
                </motion.label>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-700 pt-6">
            <label htmlFor="additional_notes" className="block text-sm font-medium text-slate-300 mb-2">
              Additional Notes (Optional)
            </label>
            <p className="text-sm text-slate-500 mb-3">
              Share any additional context, requirements, or questions
            </p>
            <textarea
              id="additional_notes"
              rows={5}
              value={formData.additional_notes}
              onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
              placeholder="Tell us anything else we should know about your project..."
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-700">
          <Button variant="outline" onClick={() => setCurrentStep(4)}>
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
