import AuthForm from "@/components/AuthForm";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Ideas App</h1>
          <p className="mt-2 text-gray-600">Record and store your ideas</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-6 text-center text-xl font-semibold text-gray-900">
            Create Account
          </h2>

          <div className="space-y-4">
            <GoogleSignInButton />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>

            <AuthForm isSignup={true} />
          </div>
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
