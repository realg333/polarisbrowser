import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT ?? 3001),
  host: process.env.HOST ?? '0.0.0.0',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  supabaseUrl: required('SUPABASE_URL'),
  supabaseServiceKey: required('SUPABASE_SERVICE_ROLE_KEY'),
  supabaseJwtSecret: process.env.SUPABASE_JWT_SECRET ?? '',
  databaseUrl: required('DATABASE_URL'),
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
  licenseSigningSecret: required('LICENSE_SIGNING_SECRET'),
  appUrl: process.env.APP_URL ?? 'http://localhost:5173',
  apiUrl: process.env.API_URL ?? 'http://localhost:3001',
  stripePrices: {
    starterMonthly: process.env.STRIPE_PRICE_STARTER_MONTHLY ?? '',
    starterYearly: process.env.STRIPE_PRICE_STARTER_YEARLY ?? '',
    unlimitedMonthly: process.env.STRIPE_PRICE_UNLIMITED_MONTHLY ?? '',
    unlimitedYearly: process.env.STRIPE_PRICE_UNLIMITED_YEARLY ?? '',
  },
} as const;

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function isStripeEnabled(): boolean {
  return Boolean(config.stripeSecretKey);
}
