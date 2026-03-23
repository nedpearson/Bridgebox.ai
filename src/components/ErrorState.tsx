import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  action?: () => void;
  actionLabel?: string;
}

export default function ErrorState({
  title = 'Something went wrong',
  message,
  action,
  actionLabel = 'Try again',
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/30">
        <AlertCircle className="w-10 h-10 text-red-500" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 text-center max-w-lg mb-8 leading-relaxed">{message}</p>
      {action && (
        <button
          onClick={action}
          className="px-6 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#3B82F6]/30"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
