import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { useEffect } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true
}: ConfirmationModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="bg-slate-900 border border-slate-700/80 shadow-2xl rounded-2xl w-full max-w-md overflow-hidden"
          >
             <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDestructive ? 'bg-red-500/10 text-red-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                     <AlertTriangle className="w-6 h-6" />
                  </div>
                  <button onClick={onClose} className="p-1 rounded-md text-slate-500 hover:bg-slate-800 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">{message}</p>
                
                <div className="flex gap-3 justify-end">
                   <button 
                     onClick={onClose}
                     className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-transparent hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
                   >
                     {cancelText}
                   </button>
                   <button 
                     onClick={() => { onConfirm(); onClose(); }}
                     className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-all active:scale-[0.98] ${
                       isDestructive ? 'bg-red-500 hover:bg-red-600 shadow-red-500/10 hover:shadow-red-500/20' : 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/10 hover:shadow-indigo-500/20'
                     }`}
                   >
                     {confirmText}
                   </button>
                </div>
             </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
