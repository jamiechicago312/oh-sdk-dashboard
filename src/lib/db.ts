import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Lazy initialization to avoid build-time errors
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL environment variable is not set. Database features will be disabled.');
      return null;
    }
    // prepare: false is required for Supabase connection pooler (Supavisor)
    // See: https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler
    const client = postgres(process.env.DATABASE_URL, { prepare: false });
    _db = drizzle(client, { schema });
  }
  return _db;
}

// For backwards compatibility - returns null if DB not available
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>> | null, {
  get(_, prop) {
    const database = getDb();
    if (!database) return null;
    return database[prop as keyof ReturnType<typeof drizzle<typeof schema>>];
  },
});
