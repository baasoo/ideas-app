import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { verifyToken, parseAuthCookie } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import IdeaDetail from "@/components/IdeaDetail";

export default async function IdeaPage({
  params,
}: {
  params: { id: string };
}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const token = parseAuthCookie(cookieHeader);
  const payload = token ? verifyToken(token) : null;

  const db = getDb();
  const ideaResult = await db.query("SELECT * FROM ideas WHERE id = $1", [
    params.id,
  ]);

  if (ideaResult.rows.length === 0) {
    redirect("/dashboard");
  }

  const idea = ideaResult.rows[0];
  const isOwner = payload?.userId === idea.user_id;

  if (!idea.is_public && !isOwner) {
    redirect("/dashboard");
  }

  // Get tags
  const tagsResult = await db.query(
    "SELECT tag_name FROM tags WHERE idea_id = $1",
    [idea.id]
  );
  const tags = tagsResult.rows.map((t: any) => t.tag_name);

  const ideaWithTags = { ...idea, tags };

  // Get user email if owner
  let userEmail = "";
  if (isOwner) {
    const userResult = await db.query("SELECT email FROM users WHERE id = $1", [
      idea.user_id,
    ]);
    userEmail = userResult.rows[0]?.email || "";
  }

  return (
    <>
      {isOwner && <Navbar user={{ email: userEmail }} />}
      <IdeaDetail idea={ideaWithTags} isOwner={isOwner} />
    </>
  );
}
