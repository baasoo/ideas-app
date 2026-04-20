import AuthForm from "@/components/AuthForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Ideas App</h1>
          <p className="mt-2 text-gray-600">Record and store your ideas</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-6 text-center text-xl font-semibold text-gray-900">
            Log In
          </h2>
          <AuthForm isSignup={false} />
        </div>

        <p className="text-center text-sm text-gray-600">
          View public ideas:{" "}
          <Link href="/" className="text-blue-600 hover:underline">
            Home
          </Link>
        </p>
      </div>
    </div>
  );
}
