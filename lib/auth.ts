import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWTPayload } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";
const JWT_EXPIRY = "7d";

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

export function generateToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return payload;
  } catch {
    return null;
  }
}

export function parseAuthCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "auth_token") {
      return decodeURIComponent(value);
    }
  }
  return null;
}
