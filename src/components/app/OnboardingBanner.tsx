import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../Button';

interface OnboardingBannerProps {
  onDismiss?: () => void;
}

export default function OnboardingBanner({ onDismiss }: OnboardingBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative bg-gradient-to-r from-indigo-500/10 to-[#10B981]/10 border border-indigo-500/30 rounded-xl p-6 mb-6"
    >
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start space-x-4 pr-8">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-[#10B981] rounded-xl flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-2">Complete Your Setup</h3>
          <p className="text-slate-300 mb-4 leading-relaxed">
            Help us tailor your experience by completing a quick 5-minute setup. We'll gather key information about your business, goals, and technical requirements to ensure we deliver the perfect solution.
          </p>
          <Link to="/setup">
            <Button variant="primary" size="sm">
              Complete Setup <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
