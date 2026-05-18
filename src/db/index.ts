import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from './schema';

export function getDb(locals?: any) {
  // 1. Check if Cloudflare Hyperdrive is available (CF Workers / wrangler dev)
  const hyperdrive = locals?.env?.HYPERDRIVE;

  if (hyperdrive?.connectionString) {
    const client = new Client({
      connectionString: hyperdrive.connectionString,
    });
    // Cloudflare Workers require client.connect() for node-postgres
    client.connect();
    return {
      db: drizzle(client, { schema }),
      close: () => client.end(),
    };
  }

  // 2. Fallback to direct connection string (local astro dev / node env)
  // Vite injects env vars via import.meta.env or process.env
  const dbUrl = import.meta.env?.DATABASE_URL || process.env?.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL is not defined and HYPERDRIVE is not configured.');
  }

  const client = new Client({
    connectionString: dbUrl,
  });
  client.connect();

  return {
    db: drizzle(client, { schema }),
    close: () => client.end(),
  };
}
