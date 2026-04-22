"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IdeaWithTags } from "@/types";

interface IdeaDetailProps {
  idea: IdeaWithTags;
  isOwner: boolean;
}

export default function IdeaDetail({ idea, isOwner }: IdeaDetailProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: idea.title,
    description: idea.description,
    category: idea.category,
    tags: idea.tags.join(", "),
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [shareUrl, setShareUrl] = useState("");

  const handleSave = async () => {
    setSubmitting(true);
    setError("");

    try {
      const tags = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);

      const response = await fetch(`/api/ideas/${idea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category || null,
          tags,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      setIsEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save idea");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this idea?")) return;

    try {
      const response = await fetch(`/api/ideas/${idea.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete idea");
      }

      router.push("/dashboard");
    } catch (err) {
      setError("Failed to delete idea");
    }
  };

  const handleCopyShareUrl = () => {
    const url = `${window.location.origin}/public/ideas/${idea.id}`;
    navigator.clipboard.writeText(url);
    setShareUrl(url);
    setTimeout(() => setShareUrl(""), 3000);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-blue-600 hover:underline"
        >
          ← Back to Ideas
        </Link>
        {isOwner && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Edit
          </button>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        {isEditing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full border border-gray-300 px-3 py-2 text-2xl font-bold"
            />

            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full rounded border border-gray-300 px-3 py-2"
              rows={5}
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="Category"
                className="rounded border border-gray-300 px-3 py-2"
              />

              <input
                type="text"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                placeholder="Tags (comma-separated)"
                className="rounded border border-gray-300 px-3 py-2"
              />
            </div>

            {error && <p className="text-red-600">{error}</p>}

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={submitting}
                className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save"}
              </button>

              <button
                onClick={() => setIsEditing(false)}
                className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="ml-auto rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <>
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
              {idea.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="space-y-4 border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Created: {new Date(idea.created_at).toLocaleString()}</span>
                {idea.submitter_email && (
                  <span className="rounded bg-gray-100 px-2 py-1 text-gray-700">
                    Owner: {idea.submitter_email}
                  </span>
                )}
              </div>

              {isOwner && (
                <div className="space-y-2">
                  <button
                    onClick={handleCopyShareUrl}
                    className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    {shareUrl ? "Copied to clipboard!" : "Copy Share URL"}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
