// @ts-nocheck
import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Video as LucideIcon } from 'lucide-react';

interface AccordionItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
  details: string[];
  color: string;
  delay?: number;
}

export default function AccordionItem({
  icon: Icon,
  title,
  description,
  details,
  color,
  delay = 0,
}: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="relative"
    >
      <motion.div
        className={`bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden transition-all duration-300 ${
          isOpen ? 'border-white/20' : ''
        }`}
        whileHover={{ scale: 1.01 }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-6 flex items-start gap-4 text-left group"
        >
          <motion.div
            className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: `${color}20`,
              borderColor: `${color}40`,
              borderWidth: '1px',
            }}
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Icon className="w-6 h-6" style={{ color }} />
          </motion.div>

          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#3B82F6] transition-colors duration-300">
              {title}
            </h3>
            <p className="text-slate-400">{description}</p>
          </div>

          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0"
          >
            <ChevronDown className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors duration-300" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 pt-2 border-t border-white/5">
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  {details.map((detail, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors duration-300"
                    >
                      <motion.div
                        className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2"
                        style={{ backgroundColor: color }}
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.7, 1, 0.7],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.2,
                        }}
                      />
                      <p className="text-sm text-slate-300 leading-relaxed">{detail}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10"
          style={{
            background: `linear-gradient(135deg, ${color}05, transparent)`,
          }}
        />
      </motion.div>
    </motion.div>
  );
}
