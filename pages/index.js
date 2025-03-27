import { supabase } from "../lib/supabase";
import { useState } from "react";
import Link from "next/link";

// ✅ Fetch posts from Supabase on the server
export async function getServerSideProps() {
  try {
    const { data, error } = await supabase
      .from("posts") // ✅ Correct table name
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { props: { initialPosts: data || [] } };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return { props: { initialPosts: [] } };
  }
}

// ✅ Home Page Component
export default function Home({ initialPosts }) {
  const [posts, setPosts] = useState(initialPosts);
  const [isSharing, setIsSharing] = useState(false); // ✅ Prevent multiple shares

  // ✅ Handle Like Functionality
  const likePost = async (id, currentLikes) => {
    const { data, error } = await supabase
      .from("posts") // ✅ Fixed table name
      .update({ likes: currentLikes + 1 })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error liking post:", error);
    } else {
      setPosts(posts.map(post => post.id === id ? { ...post, likes: currentLikes + 1 } : post));
    }
  };

  // ✅ Handle Share Functionality (Fixed)
  const sharePost = async (title, id) => {
    const url = `${window.location.origin}/post/${id}`;
    
    if (!navigator.share) {
      alert("Sharing is not supported in your browser.");
      return;
    }

    if (isSharing) {
      console.warn("A share action is already in progress.");
      return;
    }

    try {
      setIsSharing(true);
      await navigator.share({ title, url });
      console.log("Blog shared successfully!");
    } catch (error) {
      console.error("Error sharing:", error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Blog Posts</h1>

      {posts.length === 0 ? (
        <p>No posts available.</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="mb-4 border-b pb-4">
            <h2 className="text-2xl font-semibold">{post.title}</h2>
            <p>{post.content.slice(0, 100)}...</p>
            <Link href={`/post/${post.id}`} className="text-blue-500">Read More</Link>

            {/* ✅ Like Button */}
            <button
              onClick={() => likePost(post.id, post.likes)}
              className="bg-blue-500 text-white px-3 py-1 rounded ml-4"
            >
              👍 {post.likes || 0} Likes
            </button>

            {/* ✅ Share Button */}
            <button
              onClick={() => sharePost(post.title, post.id)}
              disabled={isSharing} // ✅ Prevent multiple shares
              className={`bg-green-500 text-white px-3 py-1 rounded ml-2 ${isSharing ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isSharing ? "Sharing..." : "🔗 Share"}
            </button>
          </div>
        ))
      )}
    </div>
  );
}
