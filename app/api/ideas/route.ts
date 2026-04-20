import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken, parseAuthCookie } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = parseAuthCookie(request.headers.get("cookie"));

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const tag = searchParams.get("tag") || "";

    const db = getDb();

    let query = `
      SELECT DISTINCT i.id, i.user_id, i.title, i.description, i.category, i.is_public, i.created_at, i.updated_at, u.email as submitter_email,
        COALESCE(COUNT(DISTINCT il.id), 0) as like_count,
        CASE WHEN EXISTS (SELECT 1 FROM idea_likes WHERE idea_id = i.id AND user_id = $1) THEN true ELSE false END as is_liked
      FROM ideas i
      LEFT JOIN tags t ON i.id = t.idea_id
      LEFT JOIN idea_likes il ON i.id = il.idea_id
      JOIN users u ON i.user_id = u.id
      WHERE i.is_public = true OR i.user_id = $1
    `;
    const params: (string | null)[] = [payload.userId];

    if (search) {
      query += ` AND (i.title ILIKE $${params.length + 1} OR i.description ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    if (category) {
      query += ` AND i.category = $${params.length + 1}`;
      params.push(category);
    }

    if (tag) {
      query += ` AND t.tag_name ILIKE $${params.length + 1}`;
      params.push(`%${tag}%`);
    }

    query += ` GROUP BY i.id, u.id ORDER BY i.created_at DESC`;

    const ideasResult = await db.query(query, params);
    const ideas = ideasResult.rows;

    // Get tags for each idea
    const ideaIds = ideas.map((idea: any) => idea.id);
    const tagsResult = ideaIds.length
      ? await db.query(
          `SELECT idea_id, tag_name FROM tags WHERE idea_id = ANY($1)`,
          [ideaIds]
        )
      : { rows: [] };

    const tagsByIdeaId: Record<string, string[]> = {};
    tagsResult.rows.forEach((tag: any) => {
      if (!tagsByIdeaId[tag.idea_id]) {
        tagsByIdeaId[tag.idea_id] = [];
      }
      tagsByIdeaId[tag.idea_id].push(tag.tag_name);
    });

    const ideasWithTags = ideas.map((idea: any) => ({
      ...idea,
      tags: tagsByIdeaId[idea.id] || [],
      like_count: idea.like_count || 0,
      is_liked: idea.is_liked || false,
    }));

    return NextResponse.json({ ideas: ideasWithTags }, { status: 200 });
  } catch (error) {
    console.error("Get ideas error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = parseAuthCookie(request.headers.get("cookie"));

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, category, is_public, tags } =
      await request.json();

    if (!title || title.trim() === "") {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const db = getDb();

    const result = await db.query(
      `INSERT INTO ideas (user_id, title, description, category, is_public)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, title, description, category, is_public, created_at, updated_at`,
      [payload.userId, title, description || "", category || "", is_public || false]
    );

    const idea = result.rows[0];

    // Add tags if provided
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
      {
        idea: {
          ...idea,
          tags: tags || [],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create idea error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
