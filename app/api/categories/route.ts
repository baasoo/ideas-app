import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { getDb } from "@/lib/db";
import type { Session } from "next-auth";

export async function GET(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();

    // Fetch distinct categories from ideas that user has access to
    // (either public ideas or their own ideas)
    const result = await db.query(
      `SELECT DISTINCT i.category
       FROM ideas i
       WHERE (i.is_public = true OR i.user_id = $1)
         AND i.category IS NOT NULL
         AND i.category != ''
       ORDER BY i.category ASC`,
      [session.user.id]
    );

    const categories = result.rows.map((row: any) => row.category);

    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
