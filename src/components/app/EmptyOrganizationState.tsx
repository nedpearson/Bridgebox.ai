import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EmptyOrganizationState() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800/50 border border-slate-700 rounded-2xl mb-6">
          <Building2 className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">
          No Organization Found
        </h2>
        <p className="text-slate-400 mb-8">
          You need to create or join an organization to access the platform.
        </p>
        <button
          onClick={() => navigate("/onboarding")}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
        >
          Create Organization
        </button>
      </motion.div>
    </div>
  );
}
