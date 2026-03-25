import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { devQaAiApi, InternalQaTestCase } from '../../../lib/devQaAi';
import { Loader2, TestTube2, Flame, RefreshCw, CheckCircle, ShieldCheck } from 'lucide-react';

export default function QaTestCasesWorkspace() {
  const navigate = useNavigate();
  const [tests, setTests] = useState<InternalQaTestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'draft_generated' | 'approved' | 'all'>('draft_generated');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await devQaAiApi.getAllQaTestCases();
      setTests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = tests.filter(t => {
    if (activeTab === 'draft_generated' && t.status !== 'draft_generated' && t.status !== 'under_review') return false;
    if (activeTab === 'approved' && t.status !== 'approved') return false;
    return true;
  });

  return (
    <div className="space-y-8">
      
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center space-x-3 mb-2">
            <TestTube2 className="w-8 h-8 text-indigo-500" />
            <span>AI QA Test Engine</span>
          </h1>
          <p className="text-slate-400">
            Generative CI/CD test verification packs extracted from internal bugs and telemetry anomalies.
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 border-b border-slate-800">
        {[
          { id: 'draft_generated', label: 'Triage Pending', icon: RefreshCw },
          { id: 'approved', label: 'Active Verification Specs', icon: ShieldCheck },
          { id: 'all', label: 'Global Knowledge Base', icon: Flame }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                activeTab === tab.id 
                  ? 'border-indigo-500 text-indigo-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-16 text-center">
          <TestTube2 className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Verification Matrix Detected</h3>
          <p className="text-slate-500">Generative pipelines have not queued active staging packs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((test) => (
            <div 
              key={test.id}
              onClick={() => navigate(`/app/internal/recording-center/qa-test-cases/${test.id}`)}
              className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-5 cursor-pointer transition-colors group flex flex-col relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <span className={`px-2.5 py-1 rounded text-xs tracking-wider border bg-indigo-500/10 text-indigo-400 border-indigo-500/20`}>
                  {test.product_area || 'Global'}
                </span>
                <span className="text-slate-500 text-xs flex items-center bg-slate-800 px-2 py-1 rounded">
                   <Flame className="w-3 h-3 text-orange-400 mr-1" />
                   {test.confidence_score || 'N/A'}% CF
                </span>
              </div>
              
              <h3 className="text-white font-medium mb-2 group-hover:text-indigo-400 transition-colors line-clamp-2">
                {test.title}
              </h3>
              
              <p className="text-slate-400 text-sm mb-4 line-clamp-3">
                {test.objective}
              </p>
              
              <div className="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                 <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 capitalize flex items-center">
                   {test.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1 text-green-400" />}
                   {test.status.replace(/_/g, ' ')}
                 </span>
                 <span className="font-mono text-slate-400">
                   {new Date(test.created_at).toLocaleDateString()}
                 </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
