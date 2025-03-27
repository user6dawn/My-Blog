import { supabase } from "../lib/supabase";
import { useState, useEffect } from "react";
import Link from "next/link";

// ✅ Fetch posts from Supabase on the server
export async function getServerSideProps() {
  try {
    const { data, error } = await supabase
      .from("posts") 
      .select("id, title, content, image_url, likes, created_at") 
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
  const [isSharing, setIsSharing] = useState(false);
  const [likedPosts, setLikedPosts] = useState({}); // ✅ Track liked posts in state

  useEffect(() => {
    // ✅ Load liked posts from localStorage to prevent multiple likes
    const storedLikes = JSON.parse(localStorage.getItem("likedPosts")) || {};
    setLikedPosts(storedLikes);
  }, []);

  // ✅ Handle Like Functionality (Prevent Multiple Likes)
  const likePost = async (id, currentLikes) => {
    if (likedPosts[id]) return; // ✅ Prevent liking again

    const { error } = await supabase
      .from("posts")
      .update({ likes: currentLikes + 1 })
      .eq("id", id);

    if (error) {
      console.error("Error liking post:", error);
    } else {
      setPosts(posts.map(post => post.id === id ? { ...post, likes: currentLikes + 1 } : post));
      const updatedLikes = { ...likedPosts, [id]: true };
      setLikedPosts(updatedLikes);
      localStorage.setItem("likedPosts", JSON.stringify(updatedLikes)); // ✅ Store in localStorage
    }
  };

  // ✅ Handle Share Functionality
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
          <div key={post.id} className="mb-6 border-b pb-6">
            {/* ✅ Display Blog Image */}
            {post.image_url && (
              <img 
                src={post.image_url} 
                alt={post.title} 
                className="w-full h-64 object-cover mb-3 rounded" 
              />
            )}

            <h2 className="text-2xl font-semibold">{post.title}</h2>
            <p>{post.content.slice(0, 100)}...</p>
            <Link href={`/post/${post.id}`} className="text-blue-500">Read More</Link>

            {/* ✅ Like Button (Only Click Once) */}
            <button
              onClick={() => likePost(post.id, post.likes)}
              disabled={likedPosts[post.id]} // ✅ Disable after clicking once
              className={`px-3 py-1 rounded ml-4 ${
                likedPosts[post.id] ? "bg-gray-400 text-white cursor-not-allowed" : "bg-blue-500 text-white"
              }`}
            >
              👍 {post.likes || 0} Likes
            </button>

            {/* ✅ Share Button */}
            <button
              onClick={() => sharePost(post.title, post.id)}
              disabled={isSharing} 
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
  