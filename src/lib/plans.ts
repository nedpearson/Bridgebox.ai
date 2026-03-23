import { Plan } from '../types/billing';

export const PLANS: Plan[] = [
  {
    id: 'starter',
    tier: 'starter',
    name: 'Starter',
    description: 'For teams getting started with automation',
    pricing: {
      monthly: 2500,
      yearly: 25000,
    },
    features: [
      { name: 'Basic integrations (up to 5)', included: true },
      { name: 'Core automation workflows', included: true },
      { name: 'Up to 10 team members', included: true, limit: 10 },
      { name: 'Email support', included: true },
      { name: 'Standard security', included: true },
      { name: 'Monthly reporting', included: true },
      { name: 'API access', included: true },
      { name: 'Advanced workflows', included: false },
      { name: 'Priority support', included: false },
    ],
    ctaLabel: 'Get Started',
    highlighted: false,
  },
  {
    id: 'growth',
    tier: 'growth',
    name: 'Growth',
    description: 'Advanced workflows for scaling businesses',
    pricing: {
      monthly: 7500,
      yearly: 75000,
    },
    features: [
      { name: 'Advanced workflows', included: true },
      { name: 'Multi-system integration', included: true },
      { name: 'Unlimited team members', included: true },
      { name: 'Priority support', included: true },
      { name: 'Advanced security & compliance', included: true },
      { name: 'Real-time analytics', included: true },
      { name: 'Full API access', included: true },
      { name: 'Dedicated account manager', included: true },
      { name: 'Custom workflow builder', included: true },
      { name: 'AI workflow optimization', included: false },
    ],
    ctaLabel: 'Get Started',
    highlighted: true,
  },
  {
    id: 'enterprise',
    tier: 'enterprise',
    name: 'Enterprise',
    description: 'Full infrastructure with AI optimization',
    pricing: {},
    features: [
      { name: 'Full infrastructure access', included: true },
      { name: 'AI workflow optimization', included: true },
      { name: 'Unlimited integrations', included: true },
      { name: 'Dedicated support team', included: true },
      { name: '24/7 premium support', included: true },
      { name: 'Enterprise SLAs', included: true },
      { name: 'Custom AI models', included: true },
      { name: 'Advanced analytics suite', included: true },
      { name: 'On-premise deployment', included: true },
      { name: 'White-label options', included: true },
    ],
    ctaLabel: 'Contact Sales',
    highlighted: false,
  },
];

export const getPlanById = (id: string): Plan | undefined => {
  return PLANS.find((plan) => plan.id === id);
};

export const getPlanByTier = (tier: string): Plan | undefined => {
  return PLANS.find((plan) => plan.tier === tier);
};

export const formatPlanPrice = (plan: Plan, interval: 'monthly' | 'yearly' = 'monthly'): string => {
  const price = plan.pricing[interval];
  if (!price) return 'Custom';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};
