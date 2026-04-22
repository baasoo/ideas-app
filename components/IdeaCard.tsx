"use client";

import { useState } from "react";
import Link from "next/link";
import { IdeaWithTags } from "@/types";

interface IdeaCardProps {
  idea: IdeaWithTags;
  isOwner?: boolean;
  onIdeaUpdate?: (updatedIdea: IdeaWithTags) => void;
}

export default function IdeaCard({ idea, isOwner = false, onIdeaUpdate }: IdeaCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [displayIdea, setDisplayIdea] = useState(idea);
  const [isLiked, setIsLiked] = useState(idea.is_liked || false);
  const [likeCount, setLikeCount] = useState(idea.like_count || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(idea.title);
  const [editDescription, setEditDescription] = useState(idea.description || "");
  const [editCategory, setEditCategory] = useState(idea.category || "");
  const [editTags, setEditTags] = useState(idea.tags.join(", "));
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  const handleCardClick = () => {
    setShowModal(true);
  };

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const method = isLiked ? "DELETE" : "POST";
      const response = await fetch("/api/ideas/like", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaId: idea.id }),
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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const tagsArray = editTags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const response = await fetch(`/api/ideas/${idea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          category: editCategory,
          tags: tagsArray,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to update idea: ${response.status} - ${errorData.error || "Unknown error"}`);
      }

      const data = await response.json();
      const updatedIdea: IdeaWithTags = {
        ...idea,
        ...data.idea,
        tags: data.idea.tags || tagsArray,
      };

      setDisplayIdea(updatedIdea);
      if (onIdeaUpdate) {
        onIdeaUpdate(updatedIdea);
      }

      setIsEditing(false);
    } catch (err) {
      console.error("Edit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyShareLink = async () => {
    try {
      const shareUrl = `${window.location.origin}/public/ideas/${idea.id}`;
      await navigator.clipboard.writeText(shareUrl);
      setShareMessage("Link copied to clipboard!");
      setTimeout(() => setShareMessage(null), 3000);
    } catch (err) {
      console.error("Copy error:", err);
      setShareMessage("Failed to copy link");
      setTimeout(() => setShareMessage(null), 3000);
    }
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
      >
        {displayIdea.category && (
          <div className="mb-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
              {displayIdea.category}
            </span>
          </div>
        )}

        <h3
          onClick={handleCardClick}
          className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer"
        >
          {displayIdea.title}
        </h3>

        {displayIdea.description && (
          <p className="mt-2 line-clamp-2 text-sm text-gray-600 cursor-pointer hover:text-gray-900">
            {displayIdea.description}
          </p>
        )}

        {displayIdea.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {displayIdea.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 border-t border-gray-200 pt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Likes: {likeCount}</span>
            {displayIdea.submitter_email && (
              <span className="rounded bg-gray-100 px-2 py-1 text-gray-700">
                Owner: {displayIdea.submitter_email}
              </span>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
          onClick={() => {
            setShowModal(false);
            setIsEditing(false);
          }}
        >
          <div
            className="w-full max-w-2xl rounded-lg bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-200 px-6 py-4">
              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-2xl font-bold text-gray-900 border border-gray-300 rounded px-2 py-1"
                  placeholder="Idea title"
                />
              ) : (
                <h2 className="text-2xl font-bold text-gray-900">{displayIdea.title}</h2>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto px-6 py-4">
              {isEditing ? (
                <form className="space-y-4" onSubmit={handleEditSubmit}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                      placeholder="Enter category"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 min-h-32"
                      placeholder="Enter description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                      placeholder="Enter tags, separated by commas"
                    />
                  </div>
                </form>
              ) : (
                <>
                  {displayIdea.description ? (
                    <p className="whitespace-pre-wrap text-gray-700">
                      {displayIdea.description}
                    </p>
                  ) : (
                    <p className="text-gray-500">No description provided</p>
                  )}
                </>
              )}
            </div>

            <div className="border-t border-gray-200 px-6 py-4">
              {!isEditing && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {displayIdea.category && (
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                      {displayIdea.category}
                    </span>
                  )}
                  {displayIdea.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              {shareMessage && (
                <div className="mb-3 rounded bg-green-50 px-3 py-2 text-sm text-green-700">
                  {shareMessage}
                </div>
              )}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {!isEditing && displayIdea.submitter_email && (
                    <span className="rounded bg-gray-100 px-2 py-1 text-sm text-gray-700">
                      Owner: {displayIdea.submitter_email}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!isEditing && !isOwner && (
                    <>
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
                    </>
                  )}
                  {!isEditing && (
                    <button
                      onClick={handleCopyShareLink}
                      className="rounded bg-blue-500 px-4 py-2 text-white font-medium hover:bg-blue-600"
                    >
                      🔗 Copy Link
                    </button>
                  )}
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleEditSubmit}
                        disabled={isSubmitting}
                        className="rounded bg-blue-500 px-4 py-2 text-white font-medium hover:bg-blue-600 disabled:bg-gray-400"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditTitle(displayIdea.title);
                          setEditDescription(displayIdea.description || "");
                          setEditCategory(displayIdea.category || "");
                          setEditTags(displayIdea.tags.join(", "));
                        }}
                        className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      {isOwner && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="rounded bg-blue-500 px-4 py-2 text-white font-medium hover:bg-blue-600"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => setShowModal(false)}
                        className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
                      >
                        Close
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
