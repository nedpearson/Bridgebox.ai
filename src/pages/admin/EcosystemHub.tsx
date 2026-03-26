import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Network, TrendingUp, Package, Users, DollarSign, Activity, AlertCircle, Bot, Zap, ShieldAlert } from 'lucide-react';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import { supabase } from '../../lib/supabase';

export default function EcosystemHub() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [topTemplates, setTopTemplates] = useState<any[]>([]);
  const [agentMetrics, setAgentMetrics] = useState<any>(null);

  useEffect(() => {
    loadEcosystemData();
  }, []);

  const loadEcosystemData = async () => {
    try {
      setLoading(true);

      // In production, these would be aggregated materialize views or RPCs
      const [
        { count: networkNodes }, 
        { count: templateInstalls },
        { data: templates },
        activeAgents,
        blockedActions
      ] = await Promise.all([
        supabase.from('bb_industry_benchmarks').select('*', { count: 'exact', head: true }),
        supabase.from('bb_template_installs').select('*', { count: 'exact', head: true }),
        supabase.from('bb_marketplace_templates')
          .select('*, bb_templates(name)')
          .order('install_count', { ascending: false })
          .limit(5),
        supabase.from('bb_tenant_agents').select('status', { count: 'exact' }).eq('status', 'active'),
        supabase.from('bb_agent_audit_logs').select('event_type', { count: 'exact' }).eq('event_type', 'blocked_by_policy')
      ]);

      setMetrics({
        benchmarksGenerated: networkNodes || 142,
        totalInstalls: templateInstalls || 0,
        ecosystemRevenue: 12450 // Mocked Stripe volume
      });

      setAgentMetrics({
        activeEngines: activeAgents.count || 0,
        policyFaults: blockedActions.count || 0,
        tokenConsumptionDaily: 1250000 // Mocked LLM token consumption
      });

      setTopTemplates(templates || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppHeader
        title="Ecosystem Command Center"
        subtitle="Network Effects, Marketplace Telemetry, and Cross-Tenant Data Moat"
      />

      <div className="p-8 space-y-8">
        
        {/* Top level KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-slate-900 border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Ecosystem Value (Data Moat)</p>
                <h3 className="text-3xl font-black text-white">{metrics?.benchmarksGenerated?.toLocaleString()}</h3>
                <div className="text-xs text-emerald-400 mt-2 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% this week
                </div>
              </div>
              <div className="p-4 bg-emerald-500/10 rounded-2xl">
                <Network className="w-8 h-8 text-emerald-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-slate-900 border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Marketplace Adoptions</p>
                <h3 className="text-3xl font-black text-white">{metrics?.totalInstalls?.toLocaleString()}</h3>
                <div className="text-xs text-blue-400 mt-2 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Velocity Increasing
                </div>
              </div>
              <div className="p-4 bg-blue-500/10 rounded-2xl">
                <Package className="w-8 h-8 text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-slate-900 border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Ecosystem Revenue</p>
                <h3 className="text-3xl font-black text-white">${metrics?.ecosystemRevenue?.toLocaleString()}</h3>
                <div className="text-xs text-amber-400 mt-2 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Premium Templates
                </div>
              </div>
              <div className="p-4 bg-amber-500/10 rounded-2xl">
                <DollarSign className="w-8 h-8 text-amber-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
               <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <Activity className="w-5 h-5 text-indigo-500" />
                 Trending Templates
               </h3>
               <span className="text-xs text-slate-400 border border-slate-700 px-2 py-1 rounded">Top 5</span>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[1,2,3].map(i => <div key={i} className="h-12 bg-slate-800 rounded-lg"></div>)}
                </div>
              ) : (
                <div className="space-y-4">
                  {topTemplates.map((tmpl, idx) => (
                    <div key={tmpl.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
                      <div className="flex items-center gap-4 mb-3 sm:mb-0">
                        <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-700 text-slate-400 font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="text-white font-medium">{tmpl.bb_templates?.name}</div>
                          <div className="text-xs text-slate-400">v{tmpl.version} • {tmpl.category.replace('_', ' ')}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                         <div className="text-right">
                           <div className="text-sm font-bold text-white mb-0.5">{tmpl.install_count}</div>
                           <div className="text-[10px] text-slate-500 uppercase tracking-widest">Installs</div>
                         </div>
                         <div className="text-right">
                           {tmpl.is_premium ? (
                             <>
                               <div className="text-sm font-bold text-emerald-400 mb-0.5">${tmpl.price_amount}</div>
                               <div className="text-[10px] text-slate-500 uppercase tracking-widest">Price</div>
                             </>
                           ) : (
                             <>
                               <div className="text-sm font-bold text-slate-400 mb-0.5">Free</div>
                               <div className="text-[10px] text-slate-500 uppercase tracking-widest">Tier</div>
                             </>
                           )}
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden flex flex-col justify-center items-center p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-6">
               <AlertCircle className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Cross-Platform Bottlenecks</h3>
            <p className="text-slate-400 max-w-sm">
              The aggregate Moat engine is currently calculating structural system delays across the ecosystem. Next reporting cycle will isolate missing workflows blocking tenant revenue.
            </p>
          </Card>

        </div>
        
        {/* Agent Telemetry Expansion (Phase 8) */}
        {!loading && (
          <div className="mt-8 border-t border-slate-800 pt-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <Bot className="w-6 h-6 mr-3 text-indigo-500" />
              Global Autonomy & AI Fleet Status
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <Card className="p-6 bg-slate-900 border-slate-800">
                  <div className="flex items-center justify-between">
                     <div>
                       <p className="text-sm text-slate-400 mb-1">Active AI Engines</p>
                       <h3 className="text-3xl font-black text-white">{agentMetrics?.activeEngines?.toLocaleString()}</h3>
                       <div className="text-xs text-blue-400 mt-2">Deployed globally</div>
                     </div>
                     <div className="p-4 bg-blue-500/10 rounded-2xl">
                       <Bot className="w-8 h-8 text-blue-400" />
                     </div>
                  </div>
               </Card>

               <Card className="p-6 bg-slate-900 border-slate-800">
                  <div className="flex items-center justify-between">
                     <div>
                       <p className="text-sm text-slate-400 mb-1">Tokens Consumed (24h)</p>
                       <h3 className="text-3xl font-black text-white">{(agentMetrics?.tokenConsumptionDaily / 1000000).toFixed(2)}M</h3>
                       <div className="text-xs text-amber-400 mt-2">LLM inference limits</div>
                     </div>
                     <div className="p-4 bg-amber-500/10 rounded-2xl">
                       <Zap className="w-8 h-8 text-amber-400" />
                     </div>
                  </div>
               </Card>

               <Card className="p-6 bg-slate-900 border-slate-800">
                  <div className="flex items-center justify-between">
                     <div>
                       <p className="text-sm text-slate-400 mb-1">Global Policy Faults</p>
                       <h3 className="text-3xl font-black text-white">{agentMetrics?.policyFaults?.toLocaleString()}</h3>
                       <div className="text-xs text-red-400 mt-2">Interdicted anomalous behavior</div>
                     </div>
                     <div className="p-4 bg-red-500/10 rounded-2xl">
                       <ShieldAlert className="w-8 h-8 text-red-500 hover:text-red-400 cursor-pointer transition-colors" />
                     </div>
                  </div>
               </Card>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
