import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { useOnboarding } from '../../contexts/OnboardingContext';

export default function Welcome() {
  const { setCurrentStep } = useOnboarding();

  const benefits = [
    'Personalized setup tailored to your business',
    'Clear understanding of your goals and requirements',
    'Strategic recommendations for optimal outcomes',
    'Seamless transition to your dedicated team',
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <Card glass className="p-12 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="w-20 h-20 bg-gradient-to-br from-[#3B82F6] to-[#10B981] rounded-2xl flex items-center justify-center mx-auto mb-8"
        >
          <Sparkles className="w-10 h-10 text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold text-white mb-4"
        >
          Welcome to Bridgebox
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-slate-300 mb-12 leading-relaxed"
        >
          Let's get to know your business and set you up for success. This guided setup takes just 5
          minutes and helps us deliver the perfect solution for your needs.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 mb-12"
        >
          <h3 className="text-lg font-semibold text-white mb-6">What We'll Cover</h3>
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-start space-x-3 text-left"
              >
                <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Button
            size="lg"
            variant="primary"
            onClick={() => setCurrentStep(1)}
            className="px-12"
          >
            Begin Setup <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="text-sm text-slate-500 mt-6"
        >
          Your progress is automatically saved as you go
        </motion.p>
      </Card>
    </div>
  );
}
