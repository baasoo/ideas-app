import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST() {
  try {
    const db = getDb();

    // Create tables
    const createTablesSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS ideas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        is_public BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS tags (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
        tag_name VARCHAR(100) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS idea_likes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(idea_id, user_id)
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
      CREATE INDEX IF NOT EXISTS idx_ideas_user_created ON ideas(user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_ideas_public ON ideas(is_public);
      CREATE INDEX IF NOT EXISTS idx_tags_idea_id ON tags(idea_id);
      CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(tag_name);
      CREATE INDEX IF NOT EXISTS idx_idea_likes_idea_id ON idea_likes(idea_id);
      CREATE INDEX IF NOT EXISTS idx_idea_likes_user_id ON idea_likes(user_id);
    `;

    const statements = createTablesSQL
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      await db.query(statement);
    }

    return NextResponse.json(
      { message: "Database initialized successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database initialization error:", error);
    return NextResponse.json(
      {
        error: "Database initialization failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
