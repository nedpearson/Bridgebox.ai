import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, ShieldAlert, CheckCircle, XCircle, AlertTriangle, Activity, Database } from 'lucide-react';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import { validationHarness, type TestResult } from '../../../lib/ai/testing/validationHarness';
import { bridgeboxTestBank } from '../../../lib/ai/testing/questionBank';

export default function AiValidationSuite() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const stats = {
    total: bridgeboxTestBank.length,
    completed: results.length,
    passed: results.filter(r => r.score === 'Pass').length,
    warnings: results.filter(r => r.score === 'Warning').length,
    failed: results.filter(r => r.score === 'Fail').length,
    critical: results.filter(r => r.score === 'Critical Fail').length,
    avgLatency: results.length > 0 ? Math.round(results.reduce((acc, r) => acc + r.latencyMs, 0) / results.length) : 0
  };

  const handleRunSuite = async () => {
    setResults([]);
    setIsRunning(true);
    setProgress(0);
    
    await validationHarness.runFullSuite((result, current, total) => {
      setResults(prev => [...prev, result]);
      setProgress(Math.round((current / total) * 100));
    });
    
    setIsRunning(false);
  };

  const handleStop = () => {
    validationHarness.stopSuite();
    setIsRunning(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-500" />
            Super AI Validation & Simulation Harness
          </h1>
          <p className="text-slate-400 mt-1">Autonomous adversarial testing of the LLM Intelligence Graph boundaries.</p>
        </div>
        
        <div className="flex gap-3">
          {isRunning ? (
            <Button variant="secondary" onClick={handleStop} className="text-red-400 border-red-500/20 hover:bg-red-500/10 hover:text-red-300">
              <Square className="w-4 h-4 mr-2" /> Stop Simulation
            </Button>
          ) : (
            <Button variant="primary" onClick={handleRunSuite}>
              <Play className="w-4 h-4 mr-2" /> Run Full Matrix
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-900 border-slate-800">
          <div className="text-slate-400 text-sm mb-1">Pass Rate</div>
          <div className="text-2xl font-bold text-emerald-400">
            {stats.completed > 0 ? Math.round((stats.passed / stats.completed) * 100) : 0}%
          </div>
        </Card>
        <Card className="p-4 bg-slate-900 border-slate-800">
          <div className="text-slate-400 text-sm mb-1">Critical Fails (Security)</div>
          <div className="text-2xl font-bold text-red-400">{stats.critical}</div>
        </Card>
        <Card className="p-4 bg-slate-900 border-slate-800">
          <div className="text-slate-400 text-sm mb-1">Tests Executed</div>
          <div className="text-2xl font-bold text-white">{stats.completed} / {stats.total}</div>
        </Card>
        <Card className="p-4 bg-slate-900 border-slate-800">
          <div className="text-slate-400 text-sm mb-1">Avg RAG Latency</div>
          <div className="text-2xl font-bold text-blue-400">{stats.avgLatency}ms</div>
        </Card>
      </div>

      {isRunning && (
        <div className="w-full bg-slate-800 rounded-full h-2">
          <div 
            className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-slate-400" />
          Live Execution Stream
        </h2>
        
        {results.length === 0 && !isRunning && (
          <div className="text-center py-12 text-slate-500 bg-slate-900/50 rounded-lg border border-slate-800">
            Click "Run Full Matrix" to autonomously inject synthetic contexts across the Bridgebox model.
          </div>
        )}

        <div className="space-y-3">
          <AnimatePresence>
            {results.slice().reverse().map((r, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border ${
                  r.score === 'Pass' ? 'bg-emerald-500/5 border-emerald-500/20' :
                  r.score === 'Warning' ? 'bg-amber-500/5 border-amber-500/20' :
                  r.score === 'Fail' ? 'bg-orange-500/5 border-orange-500/20' :
                  'bg-red-500/10 border-red-500/30'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                   <div className="flex gap-2 items-center">
                     {r.score === 'Pass' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                     {r.score === 'Warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                     {r.score === 'Fail' && <XCircle className="w-4 h-4 text-orange-400" />}
                     {r.score === 'Critical Fail' && <ShieldAlert className="w-4 h-4 text-red-500" />}
                     
                     <span className="text-sm font-medium text-white">[{r.category}] {r.question}</span>
                   </div>
                   <span className="text-xs text-slate-400 font-mono">{r.latencyMs}ms</span>
                </div>
                
                {r.failures.length > 0 && (
                  <div className="mt-2 text-xs text-red-400 space-y-1 pl-6">
                    {r.failures.map((f, i) => <div key={i}>{f}</div>)}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
