"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

interface NavbarProps {
  user?: { email: string };
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/dashboard" className="text-2xl font-bold text-gray-900">
          💡 Ideas
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "..." : "Log Out"}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
