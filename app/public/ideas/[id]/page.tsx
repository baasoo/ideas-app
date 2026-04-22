import { getDb } from "@/lib/db";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import PublicIdeaDetail from "@/components/PublicIdeaDetail";
import type { Session } from "next-auth";

export default async function PublicIdeaPage({
  params,
}: {
  params: { id: string };
}) {
  const db = getDb();
  const session = (await getServerSession(authOptions)) as Session | null;

  const ideaResult = await db.query(
    "SELECT * FROM ideas WHERE id = $1",
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

  // Fetch like count for the idea
  const likeCountResult = await db.query(
    "SELECT COALESCE(COUNT(*), 0) as like_count FROM idea_likes WHERE idea_id = $1",
    [idea.id]
  );
  const likeCount = parseInt(likeCountResult.rows[0].like_count, 10);

  // Check if current user liked it (if authenticated)
  let isLiked = false;
  if (session?.user?.id) {
    const isLikedResult = await db.query(
      "SELECT EXISTS(SELECT 1 FROM idea_likes WHERE idea_id = $1 AND user_id = $2) as is_liked",
      [idea.id, session.user.id]
    );
    isLiked = isLikedResult.rows[0].is_liked;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <div className="border-b border-gray-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Ideas
          </Link>
          {session?.user?.id ? (
            <Link href="/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              View Dashboard
            </Link>
          ) : (
            <Link href="/login" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Log In
            </Link>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">
        <div className="mx-auto max-w-2xl px-4">
          <div className="mb-6 space-y-2">
            <Link
              href={`/public/${idea.user_id}`}
              className="inline-block text-blue-600 hover:underline"
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

            <div className="border-t border-gray-200 pt-6">
              <div className="mb-4 space-y-1 text-sm text-gray-600">
                <p>Created: {new Date(idea.created_at).toLocaleString()}</p>
                <p>
                  Shared by: <span className="font-semibold">{user.email}</span>
                </p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <PublicIdeaDetail
                  ideaId={idea.id}
                  initialLikeCount={likeCount}
                  initialIsLiked={isLiked}
                  isAuthenticated={!!session?.user?.id}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
