import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="max-w-2xl space-y-8 text-center">
        <div>
          <h1 className="text-5xl font-bold text-gray-900">💡 Ideas</h1>
          <p className="mt-4 text-xl text-gray-600">
            Record and store your ideas, share them with others
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/login"
            className="inline-block rounded-lg bg-blue-600 px-8 py-3 text-white hover:bg-blue-700"
          >
            Log In
          </Link>
          <p className="text-gray-600">or</p>
          <Link
            href="/signup"
            className="inline-block rounded-lg bg-green-600 px-8 py-3 text-white hover:bg-green-700"
          >
            Create Account
          </Link>
        </div>

        <div className="rounded-lg bg-gray-100 p-6 text-left">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Features:</h2>
          <ul className="space-y-2 text-gray-700">
            <li>✓ Create and organize your ideas</li>
            <li>✓ Add categories and tags for easy filtering</li>
            <li>✓ Search through your ideas</li>
            <li>✓ Share ideas publicly with shareable links</li>
            <li>✓ Simple email/password authentication</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
