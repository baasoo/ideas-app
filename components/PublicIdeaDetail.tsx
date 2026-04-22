"use client";

import { useState } from "react";
import Link from "next/link";

interface PublicIdeaDetailProps {
  ideaId: string;
  initialLikeCount: number;
  initialIsLiked: boolean;
  isAuthenticated: boolean;
}

export default function PublicIdeaDetail({
  ideaId,
  initialLikeCount,
  initialIsLiked,
  isAuthenticated,
}: PublicIdeaDetailProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLikeClick = async () => {
    if (isSubmitting || !isAuthenticated) return;

    setIsSubmitting(true);
    try {
      const method = isLiked ? "DELETE" : "POST";
      const response = await fetch("/api/ideas/like", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaId }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to update like");
      }

      const data = await response.json();
      setLikeCount(data.like_count);
      setIsLiked(!isLiked);
    } catch (err) {
      console.error("Like error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="space-y-3 text-gray-600">
        <div className="text-sm">
          <span>Likes: {likeCount}</span>
        </div>
        <p className="text-sm">
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
            Log in
          </Link>
          {" "}to like this idea
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-sm text-gray-600">
        <span>Likes: {likeCount}</span>
      </div>
      <button
        onClick={handleLikeClick}
        disabled={isSubmitting}
        className={`rounded px-4 py-2 font-medium transition-colors ${
          isSubmitting
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : isLiked
            ? "bg-green-500 text-white hover:bg-green-600"
            : "bg-gray-400 text-white hover:bg-gray-500"
        }`}
      >
        {isLiked ? "👍 Liked" : "👍 Like"}
      </button>
    </div>
  );
}
