/**
 * Bridgebox Universal Pricing & Margin Engine
 * 
 * Centralizes all mathematical models for Retail (MSRP) and Internal Cost (COGS).
 * Ensures absolute margin protection and consistent quoting across public onboarding 
 * and internal sales simulators.
 */

export interface PricingConfig {
  industry: string;
  model: string;
  integrations: string[];
  aiUsage: 'standard' | 'high' | 'unlimited';
  mobile: boolean;
  users: number;
  locations: number;
}

export interface PricingOutput {
  tier: 'Starter' | 'Growth' | 'Professional' | 'Enterprise';
  monthlyMsrp: number;
  annualMsrp: number;
  setupFee: number;
  // Margin Analysis
  monthlyCogs: number;
  grossMarginPercentage: number;
  marginStatus: 'Healthy' | 'Warning' | 'Critical';
}

/**
 * Evaluates the required feature set to determine the minimum valid Tier.
 */
export function determineTier(config: PricingConfig): PricingOutput['tier'] {
  if (config.users > 50 || config.aiUsage === 'unlimited' || config.locations > 5) {
     return 'Enterprise';
  }
  if (config.users > 20 || config.mobile || config.integrations.length > 3) {
     return 'Professional';
  }
  if (config.users > 5 || config.integrations.length > 1 || config.aiUsage === 'high') {
     return 'Growth';
  }
  return 'Starter';
}

/**
 * Primary calculation engine
 */
export function calculatePricing(config: PricingConfig): PricingOutput {
  const tier = determineTier(config);
  
  // ---------------------------------------------------------
  // 1. RETAIL MATH (MSRP)
  // ---------------------------------------------------------
  const baseMsrp = 99; // Foundation OS Fee
  const perUserMsrp = 29 * Math.max(0, config.users - 1);
  const techMsrp = config.integrations.length * 20;
  
  let aiMsrp = 29;
  if (config.aiUsage === 'high') aiMsrp = 99;
  if (config.aiUsage === 'unlimited') aiMsrp = 299; // Bumped relative to previous hardcode for margin safety
  
  const mobileMsrp = config.mobile ? 149 : 0;
  const locationMsrp = config.locations > 1 ? (config.locations - 1) * 49 : 0;

  const totalMonthlyMsrp = baseMsrp + perUserMsrp + techMsrp + aiMsrp + mobileMsrp + locationMsrp;
  
  // ---------------------------------------------------------
  // 2. INTERNAL COST MATH (COGS)
  // ---------------------------------------------------------
  // Fixed infrastructure overhead per tenant (DB, Edge Functions, Auth)
  const baseInfraCogs = 15; 
  // API passthrough costs per integration
  const integrationCogs = config.integrations.length * 2.50; 
  
  // AI Token computation costs (OpenAI / Anthropic averages)
  let aiCogs = 5;
  if (config.aiUsage === 'high') aiCogs = 25;
  if (config.aiUsage === 'unlimited') aiCogs = 85; 

  const totalMonthlyCogs = baseInfraCogs + integrationCogs + aiCogs;

  // ---------------------------------------------------------
  // 3. MARGIN ANALYSIS
  // ---------------------------------------------------------
  const grossProfit = totalMonthlyMsrp - totalMonthlyCogs;
  const grossMarginPercentage = Math.round((grossProfit / totalMonthlyMsrp) * 100);
  
  let marginStatus: PricingOutput['marginStatus'] = 'Healthy';
  if (grossMarginPercentage < 70) marginStatus = 'Warning';
  if (grossMarginPercentage < 40) marginStatus = 'Critical';

  return {
    tier,
    monthlyMsrp: totalMonthlyMsrp,
    annualMsrp: Math.round(totalMonthlyMsrp * 12 * 0.8), // 20% Annual Discount
    setupFee: tier === 'Enterprise' ? 2500 : 0,
    monthlyCogs: totalMonthlyCogs,
    grossMarginPercentage,
    marginStatus
  };
}
