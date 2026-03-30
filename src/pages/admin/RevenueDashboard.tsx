import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  TrendingUp,
  DollarSign,
  Activity,
  ArrowUpRight,
  Target,
  Users,
  Zap,
} from "lucide-react";
import AppHeader from "../../components/app/AppHeader";
import Card from "../../components/Card";
import LoadingSpinner from "../../components/LoadingSpinner";
import { supabase } from "../../lib/supabase";
import { calculatePricing } from "../../lib/pricingEngine";

export default function RevenueDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    mrr: 0,
    arr: 0,
    arpu: 0,
    overallMargin: 0,
    totalTenants: 0,
    tierBreakdown: { Starter: 0, Growth: 0, Professional: 0, Enterprise: 0 },
    industryBreakdown: [] as {
      name: string;
      revenue: number;
      margin: number;
    }[],
    totalCogs: 0,
  });

  useEffect(() => {
    fetchAggregatedRevenueData();
  }, []);

  const fetchAggregatedRevenueData = async () => {
    try {
      setLoading(true);
      // Fetch all active organizations to calculate mathematical MRR based on their structure
      // In a real billing system with historical data, this would query Stripe/Paddle webhooks
      // But for this Architecture, we calculate expected Yield via the isolated PricingEngine
      const { data: orgs, error } = await supabase
        .from("bb_organizations")
        .select("*");

      if (error) throw error;

      let totalMrr = 0;
      let totalCogs = 0;
      const tiers = { Starter: 0, Growth: 0, Professional: 0, Enterprise: 0 };
      const industries: Record<string, { revenue: number; cogs: number }> = {};

      // Normally we'd fetch actual users and integrations per org, but we'll approximate based on tier
      // for the sake of the high-level revenue simulation unless we deep-query all relations
      orgs?.forEach((org) => {
        // Reconstruct the pricing profile
        let mockUsers = 5;
        let mockTech = ["stripe"];
        let aiUsage = "standard" as "standard" | "high" | "unlimited";

        if (org.billing_plan === "Enterprise") {
          mockUsers = 100;
          mockTech = ["stripe", "quickbooks", "slack"];
          aiUsage = "unlimited";
          tiers.Enterprise++;
        } else if (org.billing_plan === "Professional") {
          mockUsers = 25;
          mockTech = ["stripe", "quickbooks"];
          aiUsage = "high";
          tiers.Professional++;
        } else if (org.billing_plan === "Growth") {
          mockUsers = 10;
          mockTech = ["stripe"];
          aiUsage = "standard";
          tiers.Growth++;
        } else {
          tiers.Starter++;
        }

        const pricing = calculatePricing({
          industry: org.industry || "Unknown",
          model: org.business_model || "B2B",
          integrations: mockTech,
          aiUsage: aiUsage,
          mobile:
            org.billing_plan === "Enterprise" ||
            org.billing_plan === "Professional",
          users: mockUsers,
          locations: 1,
        });

        totalMrr += pricing.monthlyMsrp;
        totalCogs += pricing.monthlyCogs;

        const ind = org.industry || "Other";
        if (!industries[ind]) industries[ind] = { revenue: 0, cogs: 0 };
        industries[ind].revenue += pricing.monthlyMsrp;
        industries[ind].cogs += pricing.monthlyCogs;
      });

      const industryArr = Object.keys(industries)
        .map((ind) => {
          const rev = industries[ind].revenue;
          const cog = industries[ind].cogs;
          return {
            name: ind,
            revenue: rev,
            margin: rev > 0 ? Math.round(((rev - cog) / rev) * 100) : 0,
          };
        })
        .sort((a, b) => b.revenue - a.revenue);

      const grossProfit = totalMrr - totalCogs;
      const marginPerc =
        totalMrr > 0 ? Math.round((grossProfit / totalMrr) * 100) : 0;

      setMetrics({
        mrr: totalMrr,
        arr: totalMrr * 12, // Usually discounted but ARR is standard run-rate
        totalCogs,
        overallMargin: marginPerc,
        totalTenants: orgs?.length || 0,
        arpu: orgs?.length ? Math.round(totalMrr / orgs.length) : 0,
        tierBreakdown: tiers,
        industryBreakdown: industryArr,
      });
    } catch (e) {
      console.error("Failed to aggregate revenue", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <AppHeader
          title="Revenue & Margin Analytics"
          subtitle="Financial Performance Overview"
        />
        <div className="flex justify-center p-12">
          <LoadingSpinner size="lg" />
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader
        title="Revenue & Margin Analytics"
        subtitle="Global Platform Financial Performance"
      />

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Top Core Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card glass className="p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[40px] pointer-events-none rounded-full" />
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
                <DollarSign className="w-6 h-6 text-indigo-400" />
              </div>
              <span className="flex items-center text-emerald-400 text-sm font-bold">
                <ArrowUpRight className="w-4 h-4 mr-1" /> 12%
              </span>
            </div>
            <h3 className="text-slate-400 font-medium text-sm">
              Monthly Recurring Revenue
            </h3>
            <div className="text-3xl font-black text-white mt-1">
              ${metrics.mrr.toLocaleString()}
            </div>
          </Card>

          <Card glass className="p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] pointer-events-none rounded-full" />
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                <Activity className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <h3 className="text-slate-400 font-medium text-sm">
              Annual Run Rate (ARR)
            </h3>
            <div className="text-3xl font-black text-white mt-1">
              ${metrics.arr.toLocaleString()}
            </div>
          </Card>

          <Card
            glass
            className="p-6 relative overflow-hidden border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.05)]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[40px] pointer-events-none rounded-full" />
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-lg bg-amber-500/20 border border-amber-500/30">
                <TrendingUp className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <h3 className="text-slate-400 font-medium text-sm">
              Target Gross Margin
            </h3>
            <div className="flex items-end space-x-2 mt-1">
              <div className="text-3xl font-black text-white">
                {metrics.overallMargin}%
              </div>
              <div className="text-sm font-medium text-slate-500 mb-1">
                COGS: ${metrics.totalCogs.toLocaleString()}
              </div>
            </div>
          </Card>

          <Card glass className="p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 blur-[40px] pointer-events-none rounded-full" />
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-lg bg-sky-500/20 border border-sky-500/30">
                <Target className="w-6 h-6 text-sky-400" />
              </div>
            </div>
            <h3 className="text-slate-400 font-medium text-sm">
              Average Revenue Per User
            </h3>
            <div className="text-3xl font-black text-white mt-1">
              ${metrics.arpu.toLocaleString()}
            </div>
          </Card>
        </div>

        {/* Secondary Details */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Tier Distribution */}
          <Card glass className="p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-indigo-400" /> License
              Distribution
            </h3>
            <div className="space-y-4">
              {Object.entries(metrics.tierBreakdown).map(([tier, count]) => {
                const percentage =
                  metrics.totalTenants > 0
                    ? (count / metrics.totalTenants) * 100
                    : 0;
                return (
                  <div key={tier}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-slate-300">
                        {tier}
                      </span>
                      <span className="text-slate-400">
                        {count} Tenants ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1 }}
                        className={`h-full ${tier === "Enterprise" ? "bg-amber-500" : tier === "Professional" ? "bg-purple-500" : tier === "Growth" ? "bg-sky-500" : "bg-slate-500"}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Industry Penetration Yields */}
          <Card glass className="p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-amber-400" /> Industry MRR Yield
            </h3>
            <div className="space-y-4">
              {metrics.industryBreakdown.slice(0, 5).map((ind, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:bg-slate-800 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="text-white font-bold">{ind.name}</span>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">
                      Margin: {ind.margin}%
                    </span>
                  </div>
                  <div className="text-xl font-black text-indigo-400">
                    ${ind.revenue.toLocaleString()}
                  </div>
                </div>
              ))}
              {metrics.industryBreakdown.length === 0 && (
                <div className="text-slate-500 text-sm text-center py-4">
                  No active industry data
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
