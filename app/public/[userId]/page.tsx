import { getDb } from "@/lib/db";
import IdeaCard from "@/components/IdeaCard";
import Link from "next/link";

export default async function PublicUserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const db = getDb();
  const { userId } = await params;

  const userResult = await db.query("SELECT email FROM users WHERE id = $1", [
    userId,
  ]);

  if (userResult.rows.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">User not found</h1>
          <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const user = userResult.rows[0];

  const ideasQueryResult = await db.query(
    `SELECT id, title, description, category, created_at, updated_at
     FROM ideas
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  const ideasResult = ideasQueryResult.rows;

  const ideaIds = ideasResult.map((idea: any) => idea.id);
  const tagsQueryResult = ideaIds.length
    ? await db.query(
        `SELECT idea_id, tag_name FROM tags WHERE idea_id = ANY($1)`,
        [ideaIds]
      )
    : { rows: [] };
  const tagsResult = tagsQueryResult.rows;

  const tagsByIdeaId: Record<string, string[]> = {};
  tagsResult.forEach((tag: any) => {
    if (!tagsByIdeaId[tag.idea_id]) {
      tagsByIdeaId[tag.idea_id] = [];
    }
    tagsByIdeaId[tag.idea_id].push(tag.tag_name);
  });

  const ideasWithTags = ideasResult.map((idea: any) => ({
    ...idea,
    tags: tagsByIdeaId[idea.id] || [],
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4">
        <Link href="/" className="mb-6 inline-block text-blue-600 hover:underline">
          ← Back to home
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{user.email}'s Ideas</h1>
          <p className="mt-2 text-gray-600">
            {ideasWithTags.length === 0
              ? "This user hasn't shared any ideas yet."
              : `${ideasWithTags.length} idea${ideasWithTags.length !== 1 ? "s" : ""} shared`}
          </p>
        </div>

        {ideasWithTags.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ideasWithTags.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
