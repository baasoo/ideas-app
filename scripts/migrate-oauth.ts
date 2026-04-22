import { Pool } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function runMigration() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log("Running migration: Add OAuth fields to users table...");

    // Add columns
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR DEFAULT 'credentials';
    `);
    console.log("✓ Added 'provider' column");

    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_id VARCHAR;
    `);
    console.log("✓ Added 'provider_id' column");

    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR;
    `);
    console.log("✓ Added 'name' column");

    // Create unique index
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_provider_id
      ON users(provider_id) WHERE provider_id IS NOT NULL;
    `);
    console.log("✓ Created unique index on provider_id");

    // Update existing users
    const result = await pool.query(`
      UPDATE users SET provider = 'credentials' WHERE provider IS NULL;
    `);
    console.log(`✓ Updated ${result.rowCount} users to provider='credentials'`);

    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
