import { supabase } from "../../lib/supabase";
import { useRouter } from "next/router";
import Link from "next/link";
import { useState, useEffect } from "react";

// ✅ Fetch individual post data
export async function getServerSideProps({ params }) {
  const { id } = params;

  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return { props: { initialPost: data || null } };
  } catch (error) {
    console.error("Error fetching post:", error);
    return { props: { initialPost: null } };
  }
}

// ✅ Blog Post Page Component
export default function BlogPost({ initialPost }) {
  const router = useRouter();
  const [post, setPost] = useState(initialPost);
  const [liked, setLiked] = useState(false);

  // ✅ Load liked state from localStorage
  useEffect(() => {
    if (post) {
      const likedPosts = JSON.parse(localStorage.getItem("likedPosts")) || {};
      setLiked(likedPosts[post.id] || false);
    }
  }, [post]);

  if (!post) {
    return (
      <div className="container mx-auto p-6">
        <h1>Post Not Found</h1>
        <Link href="/" className="text-blue-500">← Back to Home</Link>
      </div>
    );
  }

  // ✅ Handle Like Functionality (Limit to One Like per User)
  const likePost = async () => {
    if (liked) return; // ✅ Prevent multiple likes

    const { error } = await supabase
      .from("posts")
      .update({ likes: post.likes + 1 })
      .eq("id", post.id);

    if (error) {
      console.error("Error liking post:", error);
    } else {
      setPost({ ...post, likes: post.likes + 1 });
      setLiked(true);

      // ✅ Store liked state in localStorage
      const likedPosts = JSON.parse(localStorage.getItem("likedPosts")) || {};
      likedPosts[post.id] = true;
      localStorage.setItem("likedPosts", JSON.stringify(likedPosts));
    }
  };

  // ✅ Handle Share Functionality
  const sharePost = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, url });
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
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

      {/* ✅ Display Image Below Title & Above Content */}
      {post.image_url && (
        <img
          src={post.image_url}
          alt={post.title}
          className="w-full h-auto rounded-md my-3"
        />
      )}

      <p>{post.content}</p>

      {/* ✅ Like & Share Buttons */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={likePost}
          disabled={liked} // ✅ Disable after clicking
          className={`px-3 py-1 rounded ${
            liked ? "bg-gray-400 text-white cursor-not-allowed" : "bg-blue-500 text-white"
          }`}
        >
          👍 {post.likes} Likes
        </button>

        <button
          onClick={sharePost}
          className="bg-green-500 text-white px-3 py-1 rounded"
        >
          🔗 Share
        </button>
      </div>

      {/* ✅ Back to Home */}
      <Link href="/" className="text-blue-500 mt-6 inline-block">
        ← Back to Home
      </Link>
    </div>
  );
}
