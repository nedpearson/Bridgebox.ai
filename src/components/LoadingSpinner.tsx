interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  text?: string;
}

export default function LoadingSpinner({
  size = "md",
  fullScreen = false,
  text = "Loading...",
}: LoadingSpinnerProps) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  const borderSizes = {
    sm: "border-2",
    md: "border-4",
    lg: "border-[6px]",
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`relative ${sizes[size]} mb-3`}>
        <div
          className={`absolute inset-0 ${borderSizes[size]} border-slate-800 rounded-full shadow-inner`}
        ></div>
        <div
          className={`absolute inset-0 ${borderSizes[size]} border-transparent border-t-indigo-500 rounded-full animate-spin drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]`}
        ></div>
      </div>
      {text && (
        <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 flex flex-col space-y-8 overflow-hidden pointer-events-none">
        <div className="h-10 bg-slate-900/60 w-1/3 rounded-lg animate-pulse shadow-sm" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-slate-900/50 rounded-xl animate-pulse ring-1 ring-slate-800/50 shadow-sm"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-[400px] bg-slate-900/40 rounded-xl animate-pulse ring-1 ring-slate-800/50 shadow-sm" />
          <div className="h-[400px] bg-slate-900/30 rounded-xl animate-pulse ring-1 ring-slate-800/50 shadow-sm" />
        </div>
      </div>
    );
  }

  return spinner;
}
