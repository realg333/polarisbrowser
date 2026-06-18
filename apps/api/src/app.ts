import Fastify from 'fastify';
import cors from '@fastify/cors';
import { registerMeRoutes } from './modules/auth/routes';
import { registerBillingRoutes } from './modules/subscriptions/routes';
import { registerStripeWebhook } from './modules/subscriptions/stripe-webhook';
import { config } from './config';

export async function buildApp() {
  const app = Fastify({
    logger: config.nodeEnv !== 'production',
  });

  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  app.get('/health', async () => ({ status: 'ok', service: 'polaris-api' }));

  await registerMeRoutes(app);
  await registerBillingRoutes(app);
  await registerStripeWebhook(app);

  return app;
}
