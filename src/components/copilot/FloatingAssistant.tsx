import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Minimize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../Button';

export default function FloatingAssistant() {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative group"
        >
          <button
            onClick={() => navigate('/app/copilot')}
            className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-lg shadow-purple-500/50 flex items-center justify-center hover:shadow-xl hover:shadow-purple-500/60 transition-all"
          >
            <Sparkles className="w-6 h-6 text-white" />
          </button>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileHover={{ opacity: 1, x: 0 }}
            className="absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap"
          >
            <div className="px-4 py-2 bg-slate-900 border border-white/10 rounded-lg shadow-xl">
              <p className="text-sm font-medium text-white">Need help?</p>
              <p className="text-xs text-slate-400">Ask AI Copilot</p>
            </div>
          </motion.div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-slate-800 border border-white/10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3 text-slate-400" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
