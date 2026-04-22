"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

interface AuthFormProps {
  isSignup?: boolean;
}

export default function AuthForm({ isSignup = false }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        // For signup, use the signup endpoint to create the account
        const signupResponse = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!signupResponse.ok) {
          const data = await signupResponse.json();
          setError(data.error || "Sign up failed");
          setLoading(false);
          return;
        }

        // After signup, log in with Auth.js
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError(result.error || "Login failed after signup");
          return;
        }

        router.push("/dashboard");
      } else {
        // For login, use Auth.js credentials provider
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError(result.error || "Invalid email or password");
          return;
        }

        router.push("/dashboard");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          required
          minLength={6}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Loading..." : isSignup ? "Sign Up" : "Log In"}
      </button>

      <p className="text-center text-sm text-gray-600">
        {isSignup ? "Already have an account? " : "Don't have an account? "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="text-blue-600 hover:underline"
        >
          {isSignup ? "Log in" : "Sign up"}
        </Link>
      </p>
    </form>
  );
}
