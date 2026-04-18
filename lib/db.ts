import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || 
  process.env.SUPABASE_DB_URL || 
  `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '').replace('.supabase.co', '.db.supabase.co:5432')}/postgres`;

const client = postgres(connectionString);
export const db = drizzle(client, { schema });
