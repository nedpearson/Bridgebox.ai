import React from 'react';
import { Zap, Link as LinkIcon, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function IntegrationMapBuilder() {
    return (
        <div className="max-w-5xl mx-auto animate-fade-in space-y-8">
             <div className="mb-6">
                 <h2 className="text-2xl font-bold text-white mb-2">Integration Network Mapping</h2>
                 <p className="text-slate-400">Manage required external APIs mapped against Bridgebox architectural entities.</p>
             </div>

             <div className="space-y-4">
                  {/* Integration Record 1 */}
                  <div className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                      <div className="flex justify-between items-start">
                          <div className="flex items-center">
                              <div className="w-12 h-12 bg-white rounded flex items-center justify-center mr-4">
                                  {/* DocuSign Logo Mock */}
                                  <span className="text-black font-bold text-xl">D</span>
                              </div>
                              <div>
                                  <h3 className="text-white font-semibold text-lg flex items-center">DocuSign <ShieldCheck className="w-4 h-4 ml-2 text-emerald-500" /></h3>
                                  <p className="text-sm text-slate-400">Automates Retainer Agreement dispatch on Case approval events.</p>
                              </div>
                          </div>
                          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/20">Keys Available</span>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-800 flex items-center space-x-6 text-sm">
                          <div className="flex items-center text-slate-300">
                              <LinkIcon className="w-4 h-4 mr-2" /> Connected to: <span className="font-medium text-emerald-400 ml-1">retainers</span>
                          </div>
                          <div className="flex items-center text-slate-300">
                              <Zap className="w-4 h-4 mr-2" /> Triggers: <span className="font-medium text-emerald-400 ml-1">1</span>
                          </div>
                      </div>
                  </div>

                  {/* Integration Record 2 */}
                  <div className="bg-slate-900 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                      <div className="flex justify-between items-start">
                          <div className="flex items-center">
                              <div className="w-12 h-12 bg-indigo-600 rounded flex items-center justify-center mr-4 text-white">
                                  S
                              </div>
                              <div>
                                  <h3 className="text-white font-semibold text-lg flex items-center">Stripe</h3>
                                  <p className="text-sm text-slate-400">Process billable invoices and manage automated retainer subscriptions.</p>
                              </div>
                          </div>
                          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors border border-indigo-500">
                              Request Oauth Connection
                          </button>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-sm">
                          <div className="flex items-center text-amber-500">
                              <AlertTriangle className="w-4 h-4 mr-2" /> Keys Not Provided — AI build will pause Stripe entity relationships natively.
                          </div>
                      </div>
                  </div>

             </div>
        </div>
    );
}
