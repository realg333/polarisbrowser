import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '@polaris/database/cloud';
import { config } from '../config';

const client = postgres(config.databaseUrl, { prepare: false, ssl: 'require' });

export const db = drizzle(client, { schema });
export { schema };
