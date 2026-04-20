import { NextRequest, NextResponse } from "next/server";
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

    return NextResponse.json(
      { user: { id: payload.userId, email: payload.email } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
