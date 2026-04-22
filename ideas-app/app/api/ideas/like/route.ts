import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { getDb } from "@/lib/db";
import type { Session } from "next-auth";

export async function POST(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ideaId } = await request.json();

    if (!ideaId) {
      return NextResponse.json({ error: "ideaId is required" }, { status: 400 });
    }

    const db = getDb();

    // Check if idea exists
    const ideaResult = await db.query("SELECT id FROM ideas WHERE id = $1", [
      ideaId,
    ]);

    if (ideaResult.rows.length === 0) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    // Add like (INSERT will fail silently if already liked due to UNIQUE constraint)
    try {
      await db.query(
        "INSERT INTO idea_likes (idea_id, user_id) VALUES ($1, $2)",
        [ideaId, session.user.id]
      );
    } catch (err) {
      // Ignore if already liked
    }

    // Get updated like count
    const countResult = await db.query(
      "SELECT COUNT(*) as count FROM idea_likes WHERE idea_id = $1",
      [ideaId]
    );

    return NextResponse.json(
      {
        like_count: parseInt(countResult.rows[0].count),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Like idea error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ideaId } = await request.json();

    if (!ideaId) {
      return NextResponse.json({ error: "ideaId is required" }, { status: 400 });
    }

    const db = getDb();

    // Check if idea exists
    const ideaResult = await db.query("SELECT id FROM ideas WHERE id = $1", [
      ideaId,
    ]);

    if (ideaResult.rows.length === 0) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    // Remove like
    await db.query(
      "DELETE FROM idea_likes WHERE idea_id = $1 AND user_id = $2",
      [ideaId, session.user.id]
    );

    // Get updated like count
    const countResult = await db.query(
      "SELECT COUNT(*) as count FROM idea_likes WHERE idea_id = $1",
      [ideaId]
    );

    return NextResponse.json(
      {
        like_count: parseInt(countResult.rows[0].count),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unlike idea error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
