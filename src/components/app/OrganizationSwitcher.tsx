import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Check, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { permissions } from '../../lib/permissions';

export default function OrganizationSwitcher() {
  const { organizations, currentOrganization, setCurrentOrganization, can } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentOrganization || organizations.length <= 1) {
    return null;
  }

  if (!can(permissions.canSwitchOrganization)) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700 transition-colors"
      >
        <Building2 className="w-4 h-4 text-slate-400" />
        <span className="text-sm text-white font-medium">{currentOrganization.name}</span>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-2 right-0 w-64 bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl z-40 overflow-hidden"
            >
              <div className="p-2">
                <p className="text-xs text-slate-500 uppercase font-semibold px-3 py-2">
                  Switch Organization
                </p>
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => {
                      setCurrentOrganization(org);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                      org.id === currentOrganization.id
                        ? 'bg-[#3B82F6]/10 text-[#3B82F6]'
                        : 'text-slate-300 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Building2 className="w-4 h-4" />
                      <div className="text-left">
                        <p className="text-sm font-medium">{org.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{org.type}</p>
                      </div>
                    </div>
                    {org.id === currentOrganization.id && (
                      <Check className="w-4 h-4" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
