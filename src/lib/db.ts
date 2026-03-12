import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Lazy initialization to avoid build-time errors
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let _initAttempted = false;

export function getDb() {
  if (!_initAttempted) {
    _initAttempted = true;
    if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL environment variable is not set. Database features will be disabled.');
      return null;
    }
    try {
      // prepare: false is required for Supabase connection pooler (Supavisor)
      // See: https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler
      const client = postgres(process.env.DATABASE_URL, { prepare: false });
      _db = drizzle(client, { schema });
    } catch (error) {
      console.error('Failed to initialize database:', error);
      return null;
    }
  }
  return _db;
}
