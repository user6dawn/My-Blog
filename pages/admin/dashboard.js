import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Dashboard() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const addPost = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!title || !content) {
      alert("Title and content cannot be empty.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("posts")
        .insert([{ title, content }])
        .select(); // Fetch the inserted data

      if (error) {
        console.error("Database error:", error);
        alert(`Error: ${error.message}`);
      } else {
        console.log("Post added:", data);
        alert("Blog post added successfully!");
        setTitle("");
        setContent("");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("An unexpected error occurred. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <form onSubmit={addPost} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 w-full"
          required
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border p-2 w-full h-40"
          required
        ></textarea>
        <button
          type="submit"
          className={`p-2 w-full ${loading ? "bg-gray-400" : "bg-green-500 text-white"}`}
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Post"}
        </button>
      </form>
    </div>
  );
}
