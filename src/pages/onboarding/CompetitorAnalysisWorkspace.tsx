import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Globe, Search, Plus, Target, CheckCircle2, ShieldAlert } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function CompetitorAnalysisWorkspace() {
    const { session } = useOutletContext<any>();
    const [clientUrl, setClientUrl] = useState('');
    const [competitorUrls, setCompetitorUrls] = useState<string[]>(['']);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [scanComplete, setScanComplete] = useState(false);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        // Simulate synthetic background scraping targeting AI endpoints natively
        await new Promise(r => setTimeout(r, 2000));
        setIsAnalyzing(false);
        setScanComplete(true);
    };

    return (
        <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-slate-950">
            {/* Column 1: Inputs & Controls (Left) */}
            <div className="w-full lg:w-[350px] p-6 border-r border-white/5 overflow-y-auto bg-slate-900/40 shrink-0">
                <h2 className="text-white font-semibold text-lg mb-6 flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-indigo-400" />
                    Telemetric Web Scan
                </h2>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Target Client Domain</label>
                        <input 
                            type="url"
                            value={clientUrl}
                            onChange={(e) => setClientUrl(e.target.value)}
                            placeholder="https://client-domain.com"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Competitor Matrix</label>
                        <div className="space-y-3">
                            {competitorUrls.map((url, i) => (
                                <input 
                                    key={i}
                                    type="url"
                                    value={url}
                                    onChange={(e) => {
                                        const newUrls = [...competitorUrls];
                                        newUrls[i] = e.target.value;
                                        setCompetitorUrls(newUrls);
                                    }}
                                    placeholder={`Competitor URL ${i + 1}`}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                                />
                            ))}
                        </div>
                        <button 
                            onClick={() => setCompetitorUrls([...competitorUrls, ''])}
                            className="mt-3 flex items-center text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-1" /> Add Competitor
                        </button>
                    </div>

                    <div className="pt-4 border-t border-slate-800">
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !clientUrl}
                            className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            {isAnalyzing ? <div className="mr-2"><LoadingSpinner size="sm" /></div> : <Search className="w-4 h-4 mr-2" />}
                            {isAnalyzing ? 'Scanning Domains...' : 'Initialize Analysis pass'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Column 2: AI Business Understanding (Center) */}
            <div className="w-full lg:w-[400px] p-6 border-r border-white/5 overflow-y-auto bg-slate-900/20 shrink-0">
                <h3 className="text-white font-medium mb-6">Inferred Operational Model</h3>
                
                {isAnalyzing ? (
                   <div className="h-48 flex items-center justify-center flex-col text-slate-500">
                       <div className="mb-4"><LoadingSpinner size="md" /></div>
                       <p className="text-sm">Synthesizing DOM structures...</p>
                   </div>
                ) : !scanComplete ? (
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800 border-dashed text-slate-500 text-sm text-center">
                        Awaiting scan execution. Run analysis to extract workflow payloads.
                    </div>
                ) : (
                    <div className="space-y-4 animate-fade-in">
                        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                            <h4 className="text-sm font-medium text-indigo-400 mb-2">Core Entities Detected</h4>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded-md">Invoices</span>
                                <span className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded-md">Cases</span>
                                <span className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded-md">Depositions</span>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                            <h4 className="text-sm font-medium text-emerald-400 mb-2">Extracted Process Funnel</h4>
                            <ol className="space-y-3 relative before:absolute before:inset-y-0 before:left-2 before:w-px before:bg-slate-800 ml-2">
                                <li className="relative pl-6 text-sm text-slate-300">
                                    <span className="absolute left-0.5 top-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Initial Client Consultation
                                </li>
                                <li className="relative pl-6 text-sm text-slate-300">
                                    <span className="absolute left-0.5 top-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Retainer Contract Executed
                                </li>
                                <li className="relative pl-6 text-sm text-slate-300">
                                    <span className="absolute left-0.5 top-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Discovery Deposition Booking
                                </li>
                            </ol>
                        </div>
                    </div>
                )}
            </div>

            {/* Column 3: Competitor Matrix & Outcomes (Right) */}
            <div className="flex-1 p-6 overflow-y-auto">
                <h3 className="text-white font-medium mb-6">Competitor Disruption Matrix</h3>

                {isAnalyzing ? (
                   <div className="h-48 flex items-center justify-center text-slate-500">
                       <LoadingSpinner size="md" />
                   </div>
                ) : !scanComplete ? (
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800 border-dashed text-slate-500 text-sm text-center max-w-md mt-12 mx-auto">
                        Competitor data will populate dynamically against your firm's baseline.
                    </div>
                ) : (
                    <div className="space-y-6 animate-fade-in max-w-4xl">
                        {/* Matrix Table */}
                        <div className="overflow-x-auto rounded-xl border border-slate-800">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-slate-900">
                                    <tr>
                                        <th className="px-4 py-3 text-slate-400 font-medium">Capability</th>
                                        <th className="px-4 py-3 text-indigo-400 font-medium">Your Firm</th>
                                        <th className="px-4 py-3 text-slate-400 font-medium tracking-wide">Competitor 1</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800 bg-slate-950">
                                    <tr>
                                        <td className="px-4 py-3 text-slate-300">Automated Client Portals</td>
                                        <td className="px-4 py-3"><ShieldAlert className="w-4 h-4 text-amber-500" /></td>
                                        <td className="px-4 py-3"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 text-slate-300">Secure File Vaults</td>
                                        <td className="px-4 py-3"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></td>
                                        <td className="px-4 py-3"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Bridgebox Recommendations */}
                        <div className="p-5 bg-indigo-600/10 border border-indigo-500/20 rounded-xl">
                            <h4 className="flex items-center text-sm font-semibold text-indigo-400 mb-3 uppercase tracking-wide">
                                <Target className="w-4 h-4 mr-2" /> Architectural Recommendation
                            </h4>
                            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                                Competitor analysis reveals a distinct gap in "Automated Client Portals". Bridgebox will prioritize a secure portal environment in the Blueprint phase, instantly differentiating your brand in the market.
                            </p>
                            <button className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-md transition-colors">
                                Add to Implementation Masterplan
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
