import { supabase } from "../lib/supabase";
import { useState, useEffect } from "react";

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

export default function Home({ initialPosts }) {
  const [posts, setPosts] = useState(initialPosts);
  const [isSharing, setIsSharing] = useState(false);
  const [likedPosts, setLikedPosts] = useState({});

  useEffect(() => {
    const storedLikes = JSON.parse(localStorage.getItem("likedPosts")) || {};
    setLikedPosts(storedLikes);
  }, []);

  const likePost = async (id, currentLikes) => {
    if (likedPosts[id]) return; 

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
      localStorage.setItem("likedPosts", JSON.stringify(updatedLikes));
    }
  };

  const sharePost = async (title, id) => {
    const url = `${window.location.origin}/post/${id}`;

    if (!navigator.share) {
      alert("Sharing is not supported in your browser.");
      return;
    }

    if (isSharing) return;

    try {
      setIsSharing(true);
      await navigator.share({ title, url });
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
          <BlogCard
            key={post.id}
            post={post}
            likePost={likePost}
            likedPosts={likedPosts}
            sharePost={sharePost}
            isSharing={isSharing}
          />
        ))
      )}
    </div>
  );
}
