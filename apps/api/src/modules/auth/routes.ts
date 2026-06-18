import type { FastifyInstance } from 'fastify';
import { authenticate } from '../../plugins/auth.plugin';
import { ensureUserRecord } from '../users/user.service';
import { getSubscriptionForUser } from '../subscriptions/subscription.service';
import { buildLicensePayload } from '../license/license.service';

export async function registerMeRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/v1/me', { preHandler: authenticate }, async (request, reply) => {
    const user = request.user!;
    await ensureUserRecord(user);

    const subscription = await getSubscriptionForUser(user.id);

    return reply.send({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      subscription,
    });
  });

  app.get('/api/v1/license', { preHandler: authenticate }, async (request, reply) => {
    const user = request.user!;
    await ensureUserRecord(user);

    const subscription = await getSubscriptionForUser(user.id);
    const activeStatuses = new Set(['active', 'trialing']);
    const plan = activeStatuses.has(subscription.status) ? subscription.plan : 'starter';
    const status = subscription.status;

    const license = buildLicensePayload(user.id, plan, status);
    return reply.send(license);
  });
}
