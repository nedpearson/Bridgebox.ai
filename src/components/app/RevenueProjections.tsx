import React, { useState, useMemo } from 'react';
import Card from '../Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Settings2, DollarSign } from 'lucide-react';

interface RevenueProjectionsProps {
  baseMrr?: number;
  growthRate?: number;
}

export default function RevenueProjections({ baseMrr = 150000, growthRate = 0.05 }: RevenueProjectionsProps) {
  const [churnRate, setChurnRate] = useState<number>(0.02);
  const [monthsToProject, setMonthsToProject] = useState<number>(12);

  // Generate predictive data array mapping 12-24 months out
  const projectionData = useMemo(() => {
    const data = [];
    let currentMrr = baseMrr;
    
    const today = new Date();
    for (let i = 0; i <= monthsToProject; i++) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthLabel = monthDate.toLocaleString('default', { month: 'short', year: '2-digit' });
      
      // Net MRR Formula: Previous MRR + (Previous MRR * Growth) - (Previous MRR * Churn)
      if (i > 0) {
        const newLogoMrr = currentMrr * growthRate;
        const churnedMrr = currentMrr * churnRate;
        currentMrr = currentMrr + newLogoMrr - churnedMrr;
      }

      data.push({
        name: monthLabel,
        MRR: Math.round(currentMrr),
        ARR: Math.round(currentMrr * 12),
      });
    }
    return data;
  }, [baseMrr, growthRate, churnRate, monthsToProject]);

  const finalMrr = projectionData[projectionData.length - 1]?.MRR || 0;
  const finalArr = projectionData[projectionData.length - 1]?.ARR || 0;
  const mrrGrowth = ((finalMrr - baseMrr) / baseMrr) * 100;

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
      <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            Predictive Revenue Projections
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Forward-looking cash flow intelligence interpolating current Stripe & QuickBooks run rates.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
          <div className="flex items-center gap-2 px-2">
            <Settings2 className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Simulated Churn:</span>
            <select
              value={churnRate}
              onChange={(e) => setChurnRate(parseFloat(e.target.value))}
              className="bg-slate-800 border-slate-700 text-white text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 py-1 pl-2 pr-8"
            >
              <option value={0.01}>1% (Optimistic)</option>
              <option value={0.02}>2% (Expected)</option>
              <option value={0.05}>5% (Elevated)</option>
              <option value={0.10}>10% (Pessimistic)</option>
            </select>
          </div>
          
          <div className="h-6 w-px bg-slate-700 mx-1"></div>
          
          <div className="flex items-center gap-2 px-2">
             <span className="text-sm font-medium text-slate-300">Horizon:</span>
             <select
              value={monthsToProject}
              onChange={(e) => setMonthsToProject(parseInt(e.target.value))}
              className="bg-slate-800 border-slate-700 text-white text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 py-1 pl-2 pr-8"
            >
              <option value={6}>6 Months</option>
              <option value={12}>12 Months</option>
              <option value={24}>24 Months</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 rounded-xl p-5">
            <p className="text-indigo-300 text-sm font-medium mb-1 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Projected ARR
            </p>
            <p className="text-3xl font-bold text-white mb-2">
              ${(finalArr / 1000000).toFixed(2)}M
            </p>
            <div className={`text-sm font-medium flex items-center gap-1 ${mrrGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              <TrendingUp className={`w-4 h-4 ${mrrGrowth < 0 && 'rotate-180'}`} />
              {mrrGrowth >= 0 ? '+' : ''}{mrrGrowth.toFixed(1)}% vs. Today
            </div>
          </div>
          
          <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-5">
            <p className="text-slate-400 text-sm font-medium mb-1 overflow-hidden truncate">Ending MRR Run Rate</p>
            <p className="text-xl font-bold text-white mb-2">
              ${(finalMrr / 1000).toFixed(1)}k /mo
            </p>
            <p className="text-slate-500 text-xs text-balance">
              Calculated dynamically applying a {growthRate * 100}% growth vs. {churnRate * 100}% churn ratio.
            </p>
          </div>
        </div>

        <div className="lg:col-span-3 h-[300px] w-full mt-4 lg:mt-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMRR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818CF8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#818CF8" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorARR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34D399" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#34D399" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#64748B" 
                tick={{fill: '#64748B', fontSize: 12}}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="#64748B" 
                tickFormatter={(value) => `$${value >= 1000000 ? (value/1000000).toFixed(1) + 'M' : (value/1000).toFixed(0) + 'k'}`}
                tick={{fill: '#64748B', fontSize: 12}}
                tickLine={false}
                axisLine={false}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '0.5rem', color: '#F8FAFC' }}
                itemStyle={{ color: '#F8FAFC' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
              />
              <Area 
                type="monotone" 
                dataKey="ARR" 
                stroke="#34D399" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorARR)" 
                name="Annual Run Rate (ARR)" 
              />
              <Area 
                type="monotone" 
                dataKey="MRR" 
                stroke="#818CF8" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorMRR)" 
                name="Monthly Recurring Rev (MRR)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
