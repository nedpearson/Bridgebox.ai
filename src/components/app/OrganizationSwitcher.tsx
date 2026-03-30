import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Check, ChevronDown, Plus } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { permissions } from "../../lib/permissions";
import { organizationsService } from "../../lib/db/organizations";

export default function OrganizationSwitcher() {
  const {
    organizations,
    currentOrganization,
    setCurrentOrganization,
    can,
    profile,
  } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");

  const isSuperAdmin =
    profile?.role === "super_admin" &&
    profile?.email?.toLowerCase() === "nedpearson@gmail.com";

  if (!currentOrganization || (organizations.length <= 1 && !isSuperAdmin)) {
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
        <span className="text-sm text-white font-medium">
          {currentOrganization.name}
        </span>
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
                      // Force a hard navigation to the app root to clear any cached data
                      // and prevent 404s from trying to load a resource from the previous org
                      window.location.href = "/app";
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                      org.id === currentOrganization.id
                        ? "bg-indigo-500/10 text-indigo-500"
                        : "text-slate-300 hover:bg-slate-700/50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Building2 className="w-4 h-4" />
                      <div className="text-left">
                        <p className="text-sm font-medium">{org.name}</p>
                        <p className="text-xs text-slate-500 capitalize">
                          {org.type}
                        </p>
                      </div>
                    </div>
                    {org.id === currentOrganization.id && (
                      <Check className="w-4 h-4" />
                    )}
                  </button>
                ))}

                {isSuperAdmin && (
                  <div className="mt-2 border-t border-slate-700/50 pt-2">
                    {!isCreating ? (
                      <button
                        onClick={() => setIsCreating(true)}
                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                      >
                        <Plus className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-medium">
                          Create Workspace
                        </span>
                      </button>
                    ) : (
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (!newOrgName.trim()) return;
                          try {
                            await organizationsService.createOrganization({
                              name: newOrgName,
                              type: "internal",
                            });
                            window.location.reload(); // Hard reload isolates the execution context safely
                          } catch (err) {
                            alert("Failed to create workspace. Try again.");
                          }
                        }}
                        className="px-2 py-2"
                      >
                        <input
                          type="text"
                          value={newOrgName}
                          onChange={(e) => setNewOrgName(e.target.value)}
                          placeholder="Workspace Name"
                          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 mb-2"
                          autoFocus
                        />
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsCreating(false);
                              setNewOrgName("");
                            }}
                            className="flex-1 px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={!newOrgName.trim()}
                            className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs text-white disabled:opacity-50 transition-colors"
                          >
                            Create
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
