import React, { Component, ErrorInfo, ReactNode } from 'react';
import { SupportDiagnosticAgent } from '../lib/ai/agents/SupportDiagnosticAgent';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error bound by GlobalErrorBoundary:', error, errorInfo);
    
    // Instantly teleport the crash data to the Bridgebox Diagnostic AI Agent
    SupportDiagnosticAgent.triageCrash(
      error.name, 
      error.message, 
      errorInfo.componentStack || error.stack || 'No stack trace available'
    ).catch(e => console.error("Telemetry failure", e));
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
             
             {/* Decorative Background */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />
             
             <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-rose-500/10 rounded-full border border-rose-500/20 flex items-center justify-center mb-6">
                   <ShieldAlert className="w-10 h-10 text-rose-500" />
                </div>
                
                <h1 className="text-2xl font-bold text-white mb-2">System Fault Intercepted</h1>
                <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                   A critical application error occurred. The Autonomous Diagnostic Agent 
                   has intercepted the telemetry and generated a root-cause bug ticket for our team.
                </p>

                <div className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 mb-8 text-left overflow-hidden">
                   <p className="font-mono text-sm text-rose-400 truncate">{this.state.error?.message || "Unknown Runtime Crash"}</p>
                </div>

                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
                >
                  <RefreshCw className="w-5 h-5" />
                  Restore Session
                </button>
             </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
