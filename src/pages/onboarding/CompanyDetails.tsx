import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Building2 } from 'lucide-react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { COMPANY_SIZE_OPTIONS } from '../../types/onboarding';

export default function CompanyDetails() {
  const { onboardingData, updateOnboardingData, saveOnboarding, setCurrentStep } = useOnboarding();
  const [formData, setFormData] = useState({
    company_name: onboardingData.company_name || '',
    company_size: onboardingData.company_size || '',
    industry: onboardingData.industry || '',
    website: onboardingData.website || '',
    primary_contact_name: onboardingData.primary_contact_name || '',
    primary_contact_email: onboardingData.primary_contact_email || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData({
      company_name: onboardingData.company_name || '',
      company_size: onboardingData.company_size || '',
      industry: onboardingData.industry || '',
      website: onboardingData.website || '',
      primary_contact_name: onboardingData.primary_contact_name || '',
      primary_contact_email: onboardingData.primary_contact_email || '',
    });
  }, [onboardingData]);

  const handleNext = async () => {
    setIsSaving(true);
    try {
      updateOnboardingData(formData);
      await saveOnboarding();
      setCurrentStep(2);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const isValid =
    formData.company_name.trim() &&
    formData.company_size &&
    formData.industry.trim() &&
    formData.primary_contact_name.trim() &&
    formData.primary_contact_email.trim();

  return (
    <div className="max-w-3xl mx-auto">
      <Card glass className="p-10">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-[#10B981] rounded-xl flex items-center justify-center">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Company Details</h2>
            <p className="text-slate-400 mt-1">Tell us about your organization</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="company_name" className="block text-sm font-medium text-slate-300 mb-2">
              Company Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="company_name"
              required
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Acme Inc."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="company_size" className="block text-sm font-medium text-slate-300 mb-2">
                Company Size <span className="text-red-400">*</span>
              </label>
              <select
                id="company_size"
                required
                value={formData.company_size}
                onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="">Select size</option>
                {COMPANY_SIZE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-slate-300 mb-2">
                Industry <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="industry"
                required
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="e.g., Healthcare, Finance"
              />
            </div>
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-slate-300 mb-2">
              Company Website (Optional)
            </label>
            <input
              type="url"
              id="website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="https://example.com"
            />
          </div>

          <div className="border-t border-slate-700 pt-6 mt-8">
            <h3 className="text-lg font-semibold text-white mb-4">Primary Contact</h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="primary_contact_name" className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="primary_contact_name"
                  required
                  value={formData.primary_contact_name}
                  onChange={(e) => setFormData({ ...formData, primary_contact_name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label htmlFor="primary_contact_email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  id="primary_contact_email"
                  required
                  value={formData.primary_contact_email}
                  onChange={(e) => setFormData({ ...formData, primary_contact_email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="john@company.com"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-700">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(0)}
          >
            <ArrowLeft className="mr-2 w-5 h-5" /> Back
          </Button>

          <Button
            variant="primary"
            onClick={handleNext}
            disabled={!isValid || isSaving}
          >
            {isSaving ? 'Saving...' : 'Continue'} <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
