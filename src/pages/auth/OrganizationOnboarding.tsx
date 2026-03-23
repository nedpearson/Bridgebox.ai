import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, AlertCircle } from 'lucide-react';
import { organizationsService } from '../../lib/db/organizations';
import { useAuth } from '../../contexts/AuthContext';
import BackgroundAtmosphere from '../../components/BackgroundAtmosphere';

export default function OrganizationOnboarding() {
  const [organizationName, setOrganizationName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setCurrentOrganization } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const org = await organizationsService.createOrganization({ name: organizationName });
      setCurrentOrganization(org);
      navigate('/setup');
    } catch (err: any) {
      setError(err.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 relative">
      <BackgroundAtmosphere />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-2xl mb-4">
            <Building2 className="w-8 h-8 text-[#3B82F6]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Your Organization</h1>
          <p className="text-slate-400">
            Let's get started by setting up your organization
          </p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-slate-400 text-sm mb-2">Organization Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  required
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-11 pr-4 py-3 text-white focus:outline-none focus:border-[#3B82F6] transition-colors"
                  placeholder="Acme Corporation"
                />
              </div>
              <p className="text-slate-500 text-xs mt-2">
                You can change this later in settings
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
            >
              {loading ? 'Creating...' : 'Create Organization'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
