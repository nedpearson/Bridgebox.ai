import { supabase } from '../supabase';

/**
 * Data Moat / Network Effects Engine
 * 
 * Computes strictly anonymized industry benchmarks.
 * Never exposes origin organization IDs or PII.
 */
export const benchmarkingService = {
  /**
   * Calculates median (p50) and top percentiles (p90) for project completion times
   * grouped by industry, rendering collective intelligence.
   * 
   * In production, this would be invoked by Edge Functions or pg_cron to ensure RLS 
   * isolation bypass is contained entirely server-side using a service_role key.
   */
  async computeCrossTenantVelocity() {
    try {
      // 1. We run this via a secure RPC that has SECURITY DEFINER 
      //    so it can see all tenants but only return anonymized buckets.
      const { data: industryVelocities, error } = await supabase.rpc('compute_anonymized_industry_velocity');
      
      if (error) {
        // Fallback: If the RPC isn't deployed yet, we just return empty array
        // (Since client queries can't cross-read organizations due to strict RLS)
        console.warn('Benchmarking RPC not available or blocked by RLS.');
        return;
      }

      if (industryVelocities && industryVelocities.length > 0) {
        // 2. Persist the updated anonymous medians into the benchmark cache table
        const payload = industryVelocities.map((iv: any) => ({
          industry: iv.industry,
          metric_name: 'avg_project_duration_days',
          p50_value: iv.p50_duration,
          p90_value: iv.p90_duration, // To display "Top 10% of agencies finish in X days"
          sample_size: iv.sample_size
        }));

        await supabase.from('bb_industry_benchmarks').upsert(payload, { 
          onConflict: 'industry, metric_name, calculation_date' 
        });
      }
    } catch (err) {
      console.error('Benchmarking computation failure:', err);
    }
  },

  /**
   * Retrieves the latest pre-computed baseline for the specified industry.
   * RLS protects this so tenants can only read their own industry or global.
   */
  async getBenchmark(industry: string, metricName: string) {
    const { data } = await supabase
      .from('bb_industry_benchmarks')
      .select('p50_value, p90_value, sample_size')
      .eq('industry', industry)
      .eq('metric_name', metricName)
      .order('calculation_date', { ascending: false })
      .limit(1)
      .single();

    return data;
  }
};
