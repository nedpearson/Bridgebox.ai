interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  text?: string;
}

export default function LoadingSpinner({
  size = 'md',
  fullScreen = false,
  text = 'Loading...'
}: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const borderSizes = {
    sm: 'border-2',
    md: 'border-4',
    lg: 'border-[6px]',
  };

  const spinner = (
    <div className="flex flex-col items-center space-y-4">
      <div className={`relative ${sizes[size]}`}>
        <div className={`absolute inset-0 ${borderSizes[size]} border-slate-700 rounded-full`}></div>
        <div className={`absolute inset-0 ${borderSizes[size]} border-transparent border-t-[#3B82F6] rounded-full animate-spin`}></div>
      </div>
      {text && <p className="text-slate-400 text-sm font-medium">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}
