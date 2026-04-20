import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken, parseAuthCookie } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const result = await db.query(`SELECT * FROM ideas WHERE id = $1`, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    const idea = result.rows[0];

    // Check if private and user is not owner
    if (!idea.is_public) {
      const token = parseAuthCookie(request.headers.get("cookie"));
      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const payload = verifyToken(token);
      if (!payload || payload.userId !== idea.user_id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const tagsResult = await db.query(
      `SELECT tag_name FROM tags WHERE idea_id = $1`,
      [id]
    );
    const tags = tagsResult.rows.map((t: any) => t.tag_name);

    return NextResponse.json(
      { idea: { ...idea, tags } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get idea error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("[PATCH /api/ideas/[id]] id:", id);

    const token = parseAuthCookie(request.headers.get("cookie"));

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[PATCH /api/ideas/[id]] payload:", { userId: payload.userId, email: payload.email });

    const db = getDb();
    console.log("[PATCH /api/ideas/[id]] Querying idea with id:", params.id);

    const ideaResult = await db.query(`SELECT user_id FROM ideas WHERE id = $1`, [
      id,
    ]);

    console.log("[PATCH /api/ideas/[id]] Query result rows:", ideaResult.rows.length);

    if (ideaResult.rows.length === 0) {
      console.log("[PATCH /api/ideas/[id]] Idea not found for id:", id);
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    if (ideaResult.rows[0].user_id !== payload.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { title, description, category, is_public, tags } =
      await request.json();

    const updateResult = await db.query(
      `UPDATE ideas SET title = $1, description = $2, category = $3, is_public = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING id, user_id, title, description, category, is_public, created_at, updated_at`,
      [
        title,
        description || "",
        category || "",
        is_public || false,
        id,
      ]
    );

    const idea = updateResult.rows[0];

    // Update tags
    await db.query(`DELETE FROM tags WHERE idea_id = $1`, [idea.id]);

    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (const tagName of tags) {
        if (tagName && tagName.trim() !== "") {
          await db.query(`INSERT INTO tags (idea_id, tag_name) VALUES ($1, $2)`, [
            idea.id,
            tagName.trim(),
          ]);
        }
      }
    }

    return NextResponse.json(
      { idea: { ...idea, tags: tags || [] } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update idea error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = parseAuthCookie(request.headers.get("cookie"));

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const ideaResult = await db.query(`SELECT user_id FROM ideas WHERE id = $1`, [
      id,
    ]);

    if (ideaResult.rows.length === 0) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    if (ideaResult.rows[0].user_id !== payload.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.query(`DELETE FROM ideas WHERE id = $1`, [id]);

    return NextResponse.json(
      { message: "Idea deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete idea error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
