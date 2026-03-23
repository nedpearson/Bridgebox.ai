export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  stripe: {
    publicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
  },
  app: {
    name: 'Bridgebox',
    url: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
    environment: import.meta.env.MODE,
  },
} as const;

export function validateConfig() {
  const required = {
    'VITE_SUPABASE_URL': config.supabase.url,
    'VITE_SUPABASE_ANON_KEY': config.supabase.anonKey,
  };

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
