import { useState } from 'react';
import { Search, Loader2, ShieldAlert } from 'lucide-react';

export default function WebAccess() {
  const [inputUrl, setInputUrl] = useState('https://bridgebox.ai');
  const [activeUrl, setActiveUrl] = useState('https://bridgebox.ai');
  const [loading, setLoading] = useState(false);

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    
    let target = inputUrl.trim();
    if (!target.startsWith('http')) {
      target = `https://${target}`;
    }
    setLoading(true);
    setActiveUrl(target);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
      <div className="border-b border-slate-800 bg-slate-950 p-4">
        <div className="flex items-center gap-4 mb-4">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          <div>
            <h2 className="text-lg font-semibold text-white tracking-tight">Isolated Web Access</h2>
            <p className="text-xs text-slate-400">Safely navigate while Screen Recording active telemetry.</p>
          </div>
        </div>

        <form onSubmit={handleNavigate} className="flex items-center relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Enter URL to navigate..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#3B82F6] transition-colors"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
          >
            Go
          </button>
        </form>
      </div>

      <div className="flex-1 relative bg-black">
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin mb-4" />
            <p className="text-slate-400 font-medium">Resolving secure tunnel...</p>
          </div>
        )}
        <iframe
          src={activeUrl}
          onLoad={() => setLoading(false)}
          className="w-full h-full border-0"
          sandbox="allow-same-origin allow-scripts allow-forms"
          title="Internal Sandbox Browser"
        />
      </div>
    </div>
  );
}
