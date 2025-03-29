import { supabase } from "../lib/supabase";
import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../styles/style.module.css";

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

    if (!error) {
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
    <div className={styles.container}>

      {/* ✅ Header */}
      <header className={styles.header}>
        Healthy Daddy Living
        <nav className={styles.nav}>
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        </header>
      

      <h1 className={styles.content}>Recent Posts</h1>

      {posts.length === 0 ? (
        <p className={styles.noPosts}>No posts available.</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} className={styles.card}>
            {/* ✅ Blog Image */}
            {post.image_url && (
              <img src={post.image_url} alt={post.title} className={styles.image} />
            )}

            {/* ✅ Blog Content */}
            <div className={styles.content}>
              <h2 className={styles.blog_title}>{post.title}</h2>
              <p className={styles.description}>{post.content.slice(0, 200)}...</p>

              {/* ✅ Bottom Row (Read More + Buttons) */}
              <div className={styles.bottomRow}>
                <button className={styles.readmore}>
                  <Link href={`/post/${post.id}`}>Read More...</Link>
                </button>

                {/* ✅ Buttons Row */}
                <div className={styles.buttonRow}>
                  {/* ✅ Like Button */}
                  <button
                    onClick={() => likePost(post.id, post.likes)}
                    disabled={likedPosts[post.id]}
                    className={likedPosts[post.id] ? styles.liked : styles.liked}
                  >
                    👍 {post.likes || 0} Likes
                  </button>

                  {/* ✅ Share Button */}
                  <button
                    onClick={() => sharePost(post.title, post.id)}
                    disabled={isSharing}
                    className={isSharing ? styles.sharing : styles.share}
                  >
                    {isSharing ? "Sharing..." : "🔗 Share"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}

      {/* ✅ Footer */}
      <footer className={styles.footer}>
        © {new Date().getFullYear()} My Blog. All rights reserved.
      </footer>

    </div>
  );
}
