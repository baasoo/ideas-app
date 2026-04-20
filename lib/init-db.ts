import { getDb } from "./db";
import * as fs from "fs";
import * as path from "path";

export async function initializeDatabase() {
  try {
    const db = getDb();
    const schemaPath = path.join(process.cwd(), "lib", "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf-8");

    // Split by semicolon and execute each statement
    const statements = schema
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      await db.query(statement);
    }

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
}
