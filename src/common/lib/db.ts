import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "@/drizzle/schema";


const db = drizzle(
  process.env.NEONDB_URL as string,
  { logger: true, schema }
);


export default db;
