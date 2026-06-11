import { Pool } from "@neondatabase/serverless";

let pool;

function getDb() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL environment variable is missing. Please define it in your environment."
      );
    }
    pool = new Pool({
      connectionString,
    });
  }
  return pool;
}

export default getDb;
