import { supabase } from "../../lib/supabase";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "../../styles/style.module.css";

export async function getServerSideProps({ params }) {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("id, title, content, image_url, likes, created_at")
      .eq("id", params.id)
      .single();

    if (error) throw error;

    return { props: { post: data } };
  } catch (error) {
    console.error("Error fetching post:", error);
    return { notFound: true };
  }
}

export default function BlogPost({ post }) {
  const [likes, setLikes] = useState(post.likes || 0);
  const [liked, setLiked] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const likedPosts = JSON.parse(localStorage.getItem("likedPosts")) || {};
    setLiked(likedPosts[post.id] || false);
  }, [post.id]);

  const likePost = async () => {
    if (liked) return;

    const { error } = await supabase
      .from("posts")
      .update({ likes: likes + 1 })
      .eq("id", post.id);

    if (!error) {
      setLikes(likes + 1);
      setLiked(true);
      localStorage.setItem(
        "likedPosts",
        JSON.stringify({ ...JSON.parse(localStorage.getItem("likedPosts") || "{}"), [post.id]: true })
      );
    }
  };

  const sharePost = async () => {
    const url = `${window.location.origin}/post/${post.id}`;

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
      await navigator.share({ title: post.title, url });
      console.log("Blog shared successfully!");
    } catch (error) {
      console.error("Error sharing:", error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div>
      {/* ✅ Header */}
      {/* ✅ Header */}
      <header className={styles.header}>
      Healthy Daddy Living
        <nav className={styles.nav}>
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        </header>

      {/* ✅ Blog Post Content */}
      <div className={styles.detailsCard}>
        {/* ✅ Blog Image (Top) */}
        {post.image_url && (
          <img src={post.image_url} alt={post.title} className={styles.detailsImage} />
        )}

        {/* ✅ Blog Title */}
        <h1 className={styles.detailsTitle}>{post.title}</h1>

        {/* ✅ Blog Description */}
        <p className={styles.detailsDescription}>{post.content}</p>

        {/* ✅ Go Back Home Button */}
        <button onClick={() => router.push("/")} className={styles.backButton}>
          Go Back Home
        </button>

        {/* ✅ Buttons Row (Always at Bottom) */}
        <div className={styles.detailsButtonRow}>
          <button onClick={likePost} disabled={liked} className={liked ? styles.liked : styles.liked}>
            👍 {likes} Likes
          </button>

          <button onClick={sharePost} disabled={isSharing} className={styles.share}>
            {isSharing ? "Sharing..." : "🔗 Share"}
          </button>
        </div>
      </div>

      {/* ✅ Footer */}
      <footer className={styles.footer}>
        © {new Date().getFullYear()} My Blog. All rights reserved.
      </footer>
    </div>
  );
}
