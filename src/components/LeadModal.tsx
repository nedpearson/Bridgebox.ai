import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import LeadForm from "./LeadForm";

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  formType?: "demo" | "custom_build";
}

export default function LeadModal({
  isOpen,
  onClose,
  formType = "custom_build",
}: LeadModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0F1419] border border-white/10 rounded-2xl shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-[#0F1419]/95 backdrop-blur-xl border-b border-white/10">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {formType === "demo"
                    ? "Book a Demo"
                    : "Let's Build Your System"}
                </h2>
                <p className="text-slate-400">
                  {formType === "demo"
                    ? "Schedule a personalized demo with our team"
                    : "Tell us about your project and we'll create a custom proposal"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6 text-slate-400 hover:text-white transition-colors" />
              </button>
            </div>

            <div className="p-6">
              <LeadForm formType={formType} onSuccess={onClose} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
