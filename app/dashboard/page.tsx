import { cookies } from "next/headers";
import { verifyToken, parseAuthCookie } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const token = parseAuthCookie(cookieHeader);

  if (!token) {
    redirect("/login");
  }

  const payload = verifyToken(token);

  if (!payload) {
    redirect("/login");
  }

  const db = getDb();
  const userResult = await db.query(
    "SELECT id, email FROM users WHERE id = $1",
    [payload.userId]
  );

  if (userResult.rows.length === 0) {
    redirect("/login");
  }

  const user = userResult.rows[0];

  return (
    <>
      <Navbar user={{ email: user.email }} />
      <DashboardClient />
    </>
  );
}
