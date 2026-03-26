import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, CreditCard as Edit2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { SERVICE_OPTIONS, TIMELINE_OPTIONS, COMPANY_SIZE_OPTIONS } from '../../types/onboarding';

export default function Review() {
  const { onboardingData, completeOnboarding, setCurrentStep } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await completeOnboarding();
      navigate('/app/overview');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getServiceLabel = (value: string) => {
    return SERVICE_OPTIONS.find((s) => s.value === value)?.label || value;
  };

  const getTimelineLabel = (value: string) => {
    return TIMELINE_OPTIONS.find((t) => t.value === value)?.label || value;
  };

  const getCompanySizeLabel = (value: string) => {
    return COMPANY_SIZE_OPTIONS.find((c) => c.value === value)?.label || value;
  };

  const sections = [
    {
      title: 'Company Details',
      step: 1,
      items: [
        { label: 'Company Name', value: onboardingData.company_name },
        { label: 'Industry', value: onboardingData.industry },
        { label: 'Company Size', value: getCompanySizeLabel(onboardingData.company_size) },
        { label: 'Website', value: onboardingData.website || 'Not provided' },
        { label: 'Primary Contact', value: onboardingData.primary_contact_name },
        { label: 'Email', value: onboardingData.primary_contact_email },
      ],
    },
    {
      title: 'Services Needed',
      step: 2,
      items: [
        {
          label: 'Selected Services',
          value:
            onboardingData.services_needed.length > 0
              ? onboardingData.services_needed.map(getServiceLabel).join(', ')
              : 'None selected',
        },
      ],
    },
    {
      title: 'Current Systems',
      step: 3,
      items: [
        { label: 'CRM', value: onboardingData.current_systems.crm || 'None' },
        { label: 'ERP', value: onboardingData.current_systems.erp || 'None' },
        { label: 'Accounting', value: onboardingData.current_systems.accounting || 'None' },
        { label: 'Document Management', value: onboardingData.current_systems.document_management || 'None' },
        {
          label: 'Spreadsheets',
          value: onboardingData.current_systems.spreadsheets ? 'Heavy use' : 'Not significant',
        },
        {
          label: 'Internal Dashboards',
          value: onboardingData.current_systems.internal_dashboards ? 'Yes' : 'No',
        },
      ],
    },
    {
      title: 'Business Goals',
      step: 4,
      items: [
        {
          label: 'Goals',
          value:
            onboardingData.business_goals.length > 0
              ? onboardingData.business_goals.join(', ')
              : 'None selected',
        },
      ],
    },
    {
      title: 'Timeline & Notes',
      step: 5,
      items: [
        { label: 'Timeline', value: getTimelineLabel(onboardingData.timeline) },
        { label: 'Additional Notes', value: onboardingData.additional_notes || 'None' },
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <Card glass className="p-10">
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-[#10B981] rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-3">Review Your Information</h2>
          <p className="text-slate-400">Please review your details before submitting</p>
        </div>

        <div className="space-y-8">
          {sections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
              className="border border-slate-700 rounded-xl p-6 bg-slate-800/30"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{section.title}</h3>
                <button
                  onClick={() => setCurrentStep(section.step)}
                  className="flex items-center space-x-2 text-indigo-500 hover:text-indigo-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Edit</span>
                </button>
              </div>

              <div className="space-y-3">
                {section.items.map((item) => (
                  <div key={item.label} className="grid grid-cols-3 gap-4">
                    <div className="text-sm font-medium text-slate-400">{item.label}</div>
                    <div className="col-span-2 text-sm text-white">{item.value}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-6"
        >
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-6 h-6 text-[#10B981] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-white font-semibold mb-2">What Happens Next?</h4>
              <ul className="text-sm text-slate-300 space-y-2">
                <li>• Our team will review your information within 24 hours</li>
                <li>• You'll receive a personalized consultation call invitation</li>
                <li>• We'll prepare initial recommendations based on your needs</li>
                <li>• You'll get access to your dedicated project dashboard</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-700">
          <Button variant="outline" onClick={() => setCurrentStep(5)}>
            <ArrowLeft className="mr-2 w-5 h-5" /> Back
          </Button>

          <Button
            variant="primary"
            onClick={handleComplete}
            disabled={isSubmitting}
            size="lg"
          >
            {isSubmitting ? 'Submitting...' : 'Complete Setup'}{' '}
            <CheckCircle2 className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
