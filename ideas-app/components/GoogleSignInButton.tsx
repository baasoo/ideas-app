"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function GoogleSignInButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError("");
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (err) {
      setError("Failed to sign in with Google");
      console.error("Google sign in error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        {isLoading ? "Signing in..." : "Continue with Google"}
      </button>
    </div>
  );
}
