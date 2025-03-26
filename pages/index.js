import { supabase } from "../lib/supabase";
import { useState } from "react";
import Link from "next/link";

// ✅ Fetch posts from Supabase on the server
export async function getServerSideProps() {
  try {
    const { data, error } = await supabase
      .from("posts") // ✅ Ensure this matches your table name
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

  // ✅ Handle Like Functionality
  const likePost = async (id, currentLikes) => {
    const { data, error } = await supabase
      .from("blogs") // ✅ Ensure this matches your table name
      .update({ likes: currentLikes + 1 })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error liking post:", error);
    } else {
      setPosts(posts.map(post => post.id === id ? { ...post, likes: currentLikes + 1 } : post));
    }
  };

  // ✅ Handle Share Functionality
  const sharePost = async (title, id) => {
    const url = `${window.location.origin}/post/${id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        console.log("Blog shared successfully!");
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      alert("Sharing is not supported in your browser.");
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
              👍 {post.likes} Likes
            </button>

            {/* ✅ Share Button */}
            <button
              onClick={() => sharePost(post.title, post.id)}
              className="bg-green-500 text-white px-3 py-1 rounded ml-2"
            >
              🔗 Share
            </button>
          </div>
        ))
      )}
    </div>
  );
}
