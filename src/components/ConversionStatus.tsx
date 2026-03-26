import { Link } from 'react-router-dom';
import { ChevronRight, FileText, Building2, FolderKanban, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ConversionStatusProps {
  leadId?: string;
  leadName?: string;
  proposalId?: string;
  proposalTitle?: string;
  projectId?: string;
  projectName?: string;
  onboardingStatus?: string;
  converted?: boolean;
}

export default function ConversionStatus({
  leadId,
  leadName,
  proposalId,
  proposalTitle,
  projectId,
  projectName,
  onboardingStatus,
  converted = false,
}: ConversionStatusProps) {
  if (!leadId && !proposalId && !projectId) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4"
    >
      <div className="flex items-center space-x-2 text-sm">
        <span className="text-slate-400 font-medium">Lifecycle:</span>

        <div className="flex items-center space-x-2 flex-wrap">
          {leadId && (
            <>
              <Link
                to={`/app/leads/${leadId}`}
                className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-md text-slate-300 hover:text-white transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="font-medium">{leadName || 'Lead'}</span>
              </Link>
              {(proposalId || projectId) && (
                <ChevronRight className="w-4 h-4 text-slate-600" />
              )}
            </>
          )}

          {proposalId && (
            <>
              <Link
                to={`/app/proposals/${proposalId}`}
                className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-md text-slate-300 hover:text-white transition-colors"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span className="font-medium">{proposalTitle || 'Proposal'}</span>
              </Link>
              {projectId && (
                <ChevronRight className="w-4 h-4 text-slate-600" />
              )}
            </>
          )}

          {projectId && (
            <Link
              to={`/app/projects/${projectId}`}
              className="flex items-center space-x-1.5 px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-md text-indigo-500 hover:text-indigo-500 transition-colors"
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span className="font-medium">{projectName || 'Active Project'}</span>
            </Link>
          )}

          {converted && (
            <span className="flex items-center space-x-1 px-2.5 py-1 bg-green-500/10 text-green-400 border border-green-500/30 rounded-md text-xs font-medium">
              <CheckCircle className="w-3 h-3" />
              <span>Converted</span>
            </span>
          )}
        </div>

        {onboardingStatus && onboardingStatus !== 'completed' && (
          <div className="ml-auto">
            <span className="text-xs px-2 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded-md">
              Onboarding: {onboardingStatus.replace('_', ' ')}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
