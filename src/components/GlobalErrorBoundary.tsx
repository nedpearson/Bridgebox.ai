import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCcw, Home } from 'lucide-react';
import { Logger } from '../lib/logger';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Logger.error('Unhandled React Rendering Exception Caught', { error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
         <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-[#3B82F6]/30">
            <div className="w-full max-w-lg bg-slate-900/80 backdrop-blur-xl border border-rose-500/20 rounded-3xl p-8 relative overflow-hidden isolate">
               
               <div className="absolute -top-32 -right-32 w-64 h-64 bg-rose-500/10 blur-[100px] rounded-full pointer-events-none" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
               
               <div className="w-16 h-16 bg-rose-500/20 border border-rose-500/30 rounded-2xl flex items-center justify-center mb-6">
                  <ShieldAlert className="w-8 h-8 text-rose-500" />
               </div>

               <h1 className="text-3xl font-black text-white tracking-tight leading-tight mb-3">
                 System Exception
               </h1>
               
               <p className="text-slate-400 mb-8 leading-relaxed">
                 The Bridgebox OS encountered a critical unhandled rendering exception. Our engineers have been securely notified via the telemetry layer.
               </p>

               <div className="bg-slate-950 border border-rose-500/10 rounded-xl p-4 mb-8 overflow-x-auto">
                 <p className="text-xs font-mono text-rose-400 font-bold mb-2">Exception Trace:</p>
                 <code className="text-[10px] text-slate-500 block w-full whitespace-pre-wrap">
                    {this.state.error?.message || 'Unknown fatal error in React Tree'}
                 </code>
               </div>

               <div className="grid grid-cols-2 gap-3">
                 <button 
                    onClick={() => window.location.href = '/'} 
                    className="w-full flex items-center justify-center px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all"
                 >
                    <Home className="w-4 h-4 mr-2" /> Session Reset
                 </button>
                 <button 
                    onClick={() => window.location.reload()} 
                    className="w-full flex items-center justify-center px-4 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all"
                 >
                    <RefreshCcw className="w-4 h-4 mr-2" /> Force Reload
                 </button>
               </div>
            </div>
         </div>
      );
    }

    return this.props.children;
  }
}
