"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import IdeaCard from "./IdeaCard";
import { IdeaWithTags } from "@/types";

export default function DashboardClient() {
  const [ideas, setIdeas] = useState<IdeaWithTags[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCurrentUser();
    fetchIdeas();
  }, [search, category]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUserId(data.user.id);
      }
    } catch (err) {
      console.error("Failed to fetch current user:", err);
    }
  };

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (category) params.append("category", category);

      const response = await fetch(`/api/ideas?${params}`, {
        credentials: "include",
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch ideas");
      }

      const data = await response.json();
      setIdeas(data.ideas);
      setError("");
    } catch (err) {
      setError("Failed to load ideas");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const tags = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);

      const response = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category || null,
          is_public: true,
          tags,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      setFormData({
        title: "",
        description: "",
        category: "",
        tags: "",
        is_public: false,
      });
      setShowForm(false);
      await fetchIdeas();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create idea");
    } finally {
      setSubmitting(false);
    }
  };

  const handleIdeaUpdate = (updatedIdea: IdeaWithTags) => {
    setIdeas(
      ideas.map((idea) => (idea.id === updatedIdea.id ? updatedIdea : idea))
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Ideas</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            {showForm ? "Cancel" : "+ New Idea"}
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search ideas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded border border-gray-300 px-3 py-2"
          />
          <input
            type="text"
            placeholder="Filter by category..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2"
          />
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreateIdea}
          className="mb-8 space-y-4 rounded-lg border border-gray-200 bg-white p-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                placeholder="e.g., Project, Learning"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tags
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                placeholder="Comma-separated (e.g., urgent, important)"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !formData.title}
            className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Idea"}
          </button>
        </form>
      )}

      {loading && <p className="text-center text-gray-500">Loading ideas...</p>}

      {error && !loading && (
        <p className="rounded bg-red-100 p-4 text-red-800">{error}</p>
      )}

      {!loading && ideas.length === 0 && (
        <p className="text-center text-gray-500">
          No ideas yet. Create your first one!
        </p>
      )}

      {!loading && ideas.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} isOwner={idea.user_id === currentUserId} onIdeaUpdate={handleIdeaUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}
