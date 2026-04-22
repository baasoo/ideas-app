"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import IdeaCard from "./IdeaCard";
import { IdeaWithTags } from "@/types";

export default function DashboardClient() {
  const [ideas, setIdeas] = useState<IdeaWithTags[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [currentView, setCurrentView] = useState<"cards" | "list">("cards");
  const router = useRouter();
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchCategories();
    fetchIdeas();
  }, [search, selectedCategories]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
    }

    if (showCategoryDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showCategoryDropdown]);

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

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setCategoryOptions(data.categories);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedCategories.length > 0) params.append("categories", selectedCategories.join(","));

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
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Ideas</h1>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setCurrentView("cards")}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  currentView === "cards"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setCurrentView("list")}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  currentView === "list"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                List
              </button>
            </div>
          </div>
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
          <div className="relative w-64" ref={categoryDropdownRef}>
            <button
              type="button"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-left bg-white hover:bg-gray-50"
            >
              {selectedCategories.length === 0 ? (
                <span className="text-gray-500">Filter by category...</span>
              ) : (
                <span className="text-sm text-gray-700">
                  {selectedCategories.length} selected
                </span>
              )}
            </button>

            {showCategoryDropdown && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg z-10">
                <div className="p-2 max-h-60 overflow-y-auto">
                  {categoryOptions.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-gray-500">
                      No categories available
                    </p>
                  ) : (
                    categoryOptions.map((category) => (
                      <label
                        key={category}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer rounded"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories([...selectedCategories, category]);
                            } else {
                              setSelectedCategories(
                                selectedCategories.filter((c) => c !== category)
                              );
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{category}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {(search || selectedCategories.length > 0) && (
          <div className="flex flex-wrap gap-2 items-center">
            {search && search.split(/\s+/).map((term, index) => (
              term && (
                <span
                  key={`search-${index}`}
                  className="inline-flex items-center gap-1 bg-green-100 text-green-700 rounded px-2 py-1 text-sm"
                >
                  {term}
                  <button
                    type="button"
                    onClick={() => {
                      const terms = search.split(/\s+/).filter((t, i) => i !== index && t);
                      setSearch(terms.join(" "));
                    }}
                    className="ml-1 font-bold hover:text-green-900"
                  >
                    ×
                  </button>
                </span>
              )
            ))}
            {search && selectedCategories.length > 0 && (
              <span className="text-sm text-gray-500 font-medium">in</span>
            )}
            {selectedCategories.map((category) => (
              <span
                key={`category-${category}`}
                className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 rounded px-2 py-1 text-sm"
              >
                {category}
                <button
                  type="button"
                  onClick={() =>
                    setSelectedCategories(
                      selectedCategories.filter((c) => c !== category)
                    )
                  }
                  className="ml-1 font-bold hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
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

      {!loading && ideas.length > 0 && currentView === "cards" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} isOwner={idea.user_id === currentUserId} onIdeaUpdate={handleIdeaUpdate} />
          ))}
        </div>
      )}

      {!loading && ideas.length > 0 && currentView === "list" && (
        <div className="space-y-3">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{idea.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{idea.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 flex-shrink-0">
                    <span>Likes: {idea.like_count}</span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {idea.category && (
                    <span className="inline-block bg-blue-100 text-blue-700 rounded px-2 py-1 text-xs font-medium">
                      {idea.category}
                    </span>
                  )}
                  {idea.tags && idea.tags.map((tag) => (
                    <span key={tag} className="inline-block bg-gray-100 text-gray-700 rounded px-2 py-1 text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  Owner: {idea.submitter_email}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
