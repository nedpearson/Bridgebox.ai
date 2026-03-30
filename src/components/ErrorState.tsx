import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message: string;
  action?: () => void;
  actionLabel?: string;
}

export default function ErrorState({
  title = "Something went wrong",
  message,
  action,
  actionLabel = "Try again",
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 w-full border-2 border-dashed border-red-500/20 bg-red-500/5 rounded-2xl">
      <div className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-orange-500/10 rounded-full flex items-center justify-center mb-6 shadow-inner ring-1 ring-red-500/20">
        <AlertCircle className="w-8 h-8 text-red-400 opacity-90" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-center max-w-md mb-8 text-sm leading-relaxed">
        {message}
      </p>
      <div className="flex items-center gap-4">
        {action && (
          <button
            onClick={action}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-all duration-200 border border-slate-700 hover:border-slate-600 shadow-sm active:scale-[0.98]"
          >
            {actionLabel}
          </button>
        )}
        <a
          href="mailto:support@bridgebox.ai"
          className="px-6 py-2.5 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white font-medium rounded-lg transition-colors text-sm"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}
