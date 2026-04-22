import { getDb } from "@/lib/db";
import Link from "next/link";

export default async function PublicIdeaPage({
  params,
}: {
  params: { id: string };
}) {
  const db = getDb();

  const ideaResult = await db.query(
    "SELECT * FROM ideas WHERE id = $1 AND is_public = true",
    [params.id]
  );

  if (ideaResult.rows.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Idea not found</h1>
          <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const idea = ideaResult.rows[0];

  const tagsQueryResult = await db.query(
    "SELECT tag_name FROM tags WHERE idea_id = $1",
    [idea.id]
  );
  const tags = tagsQueryResult.rows.map((t: any) => t.tag_name);

  const userResult = await db.query("SELECT email FROM users WHERE id = $1", [
    idea.user_id,
  ]);
  const user = userResult.rows[0];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-6 space-y-2">
          <Link href="/" className="inline-block text-blue-600 hover:underline">
            ← Home
          </Link>
          <Link
            href={`/public/${idea.user_id}`}
            className="ml-4 inline-block text-blue-600 hover:underline"
          >
            View more from {user.email}
          </Link>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-8">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">
            {idea.title}
          </h1>

          {idea.description && (
            <p className="mb-6 whitespace-pre-wrap text-gray-700">
              {idea.description}
            </p>
          )}

          <div className="mb-6 flex flex-wrap gap-2">
            {idea.category && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                {idea.category}
              </span>
            )}
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-6 text-sm text-gray-600">
            <p>Created: {new Date(idea.created_at).toLocaleString()}</p>
            <p className="mt-2">
              Shared by: <span className="font-semibold">{user.email}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
