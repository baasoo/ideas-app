import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const db = getDb();
    const existingResult = await db.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const insertResult = await db.query(
      "INSERT INTO users (email, password_hash, provider) VALUES ($1, $2, 'credentials') RETURNING id, email",
      [email, passwordHash]
    );

    const user = insertResult.rows[0];

    return NextResponse.json(
      { user: { id: user.id, email: user.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
