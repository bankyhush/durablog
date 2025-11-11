"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function BlogHomeUI() {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [isPending, setIsPending] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const queryClient = useQueryClient();

  // Create New Blog
  const newBlog = async (data) => {
    setIsPending(true);
    setError("");
    setSuccess("");

    try {
      const res = await axios.post("/api/posts", data);
      if (res.data.success) {
        setSuccess("Post created successfully");
        reset();
        queryClient.invalidateQueries({ queryKey: ["blogging"] });
        setTimeout(() => setSuccess(""), 2000);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create post");
    } finally {
      setIsPending(false);
    }
  };

  // Fetch Blogs
  const fetchBlogs = async () => {
    const res = await axios.get("/api/posts");
    return res.data;
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["blogging"],
    queryFn: fetchBlogs,
  });

  // Delete Post
  const deletePost = async (id) => {
    setDeletingId(id);
    setError("");
    setSuccess("");

    try {
      await axios.delete(`/api/posts/${id}`);
      setSuccess("Post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["blogging"] });
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete post");
    } finally {
      setDeletingId(null);
    }
  };

  // Edit Post (fill the form)
  const startEdit = (post) => {
    setEditingId(post.id);
    setValue("id", post.id);
    setValue("title", post.title);
    setValue("content", post.content);
  };

  // Update Post
  const updatePost = async (data) => {
    setIsPending(true);
    setError("");
    setSuccess("");

    try {
      const res = await axios.put(`/api/posts/${data.id}`, {
        title: data.title,
        content: data.content,
      });

      setSuccess("Post updated successfully");
      reset();
      queryClient.invalidateQueries({ queryKey: ["blogging"] });
      // Optional: clear success message after a short delay
      setTimeout(() => setSuccess(""), 2000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update post");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 font-sans">
      <main className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-8">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 dark:text-white mb-10">
          ✍️ Dura Blog
        </h1>

        {/* Create / Edit Post Form */}
        <section className="mb-10 border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-700 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            {editingId ? "✏️ Edit Post" : "🆕 Create a New Post"}
          </h2>

          <form
            onSubmit={handleSubmit(editingId ? updatePost : newBlog)}
            className="space-y-4 mt-4"
          >
            <input type="hidden" {...register("id")} />
            <input
              type="text"
              {...register("title")}
              placeholder="Enter post title"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <textarea
              {...register("content")}
              placeholder="Write your post content..."
              rows={5}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            ></textarea>
            <div className="flex justify-end gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setEditingId(null);
                  }}
                  className="px-6 py-3 rounded-lg bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isPending}
                className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
              >
                {isPending
                  ? editingId
                    ? "Updating..."
                    : "Publishing..."
                  : editingId
                  ? "Update Post"
                  : "Publish Post"}
              </button>
            </div>
          </form>

          {/* Alerts */}
          <div className="mt-2 space-y-2">
            {error && (
              <span className="inline-block bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">
                {error}
              </span>
            )}
            {success && (
              <span className="inline-block bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                {success}
              </span>
            )}
          </div>
        </section>

        {/* Blog List */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
            Recent Posts
          </h2>

          {isLoading && (
            <ul className="space-y-6">
              {Array.from({ length: 3 }).map((_, idx) => (
                <li
                  key={idx}
                  className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow animate-pulse"
                >
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-6"></div>
                </li>
              ))}
            </ul>
          )}

          {isError && <p className="text-red-600">Failed to fetch posts.</p>}

          {!isLoading && data?.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-6">
              No posts found.
            </p>
          )}

          <ul className="space-y-6">
            {data?.map((post) => (
              <li
                key={post.id}
                className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow hover:shadow-lg transition"
              >
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {post.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {post.content.length > 100
                    ? post.content.slice(0, 100) + "..."
                    : post.content}
                </p>
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>
                    🕒 {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(post)}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-700 text-blue-800 dark:text-blue-100 rounded-full text-sm font-semibold hover:bg-blue-200 dark:hover:bg-blue-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deletePost(post.id)}
                      disabled={deletingId === post.id}
                      className="px-3 py-1 bg-red-100 dark:bg-red-700 text-red-800 dark:text-red-100 rounded-full text-sm font-semibold hover:bg-red-200 dark:hover:bg-red-600 transition"
                    >
                      {deletingId === post.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <footer className="text-center mt-10 text-gray-500 dark:text-gray-400 text-sm">
          © 2025 My Professional Blog — Built with Next.js & Tailwind CSS
        </footer>
      </main>
    </div>
  );
}
