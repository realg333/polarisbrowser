import { eq } from 'drizzle-orm';
import { organizations, users, workspaceMembers, workspaces } from '@polaris/database/cloud';
import { db } from '../../database/client';

export async function ensureUserRecord(input: {
  id: string;
  email: string;
  name: string | null;
}): Promise<void> {
  const [existing] = await db.select().from(users).where(eq(users.id, input.id)).limit(1);

  if (!existing) {
    await db.insert(users).values({
      id: input.id,
      email: input.email,
      name: input.name,
    });

    const slug = `org-${input.id.slice(0, 8)}`;
    const [org] = await db
      .insert(organizations)
      .values({ name: input.name ?? 'Meu Workspace', slug })
      .returning();

    const [workspace] = await db
      .insert(workspaces)
      .values({ orgId: org.id, name: 'Padrão' })
      .returning();

    await db.insert(workspaceMembers).values({
      workspaceId: workspace.id,
      userId: input.id,
      role: 'owner',
    });
  }
}

export async function getUserWorkspaceId(userId: string): Promise<string | null> {
  const [member] = await db
    .select()
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, userId))
    .limit(1);
  return member?.workspaceId ?? null;
}

export async function updateStripeCustomerId(userId: string, customerId: string): Promise<void> {
  await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, userId));
}

export async function getStripeCustomerId(userId: string): Promise<string | null> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return user?.stripeCustomerId ?? null;
}
