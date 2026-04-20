import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const db = getDb();

    const ideasResult = await db.query(
      `SELECT id, title, description, category, created_at, updated_at
       FROM ideas
       WHERE user_id = $1 AND is_public = true
       ORDER BY created_at DESC`,
      [params.userId]
    );
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
    }));

    return NextResponse.json({ ideas: ideasWithTags }, { status: 200 });
  } catch (error) {
    console.error("Get public ideas error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
