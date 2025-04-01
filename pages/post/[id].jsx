import { supabase } from "../../lib/supabase";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "../../styles/style.module.css";

export async function getServerSideProps({ params }) {
  try {
    // Get the post
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select("id, title, content, image_url, likes, created_at")
      .eq("id", params.id)
      .single();

    if (postError) throw postError;

    // Get comments for this post
    const { data: commentData, error: commentError } = await supabase
      .from("comments")
      .select("id, name, comment, created_at")
      .eq("post_id", params.id)
      .order("created_at", { ascending: false });

    if (commentError) throw commentError;

    return { 
      props: { 
        post: postData,
        initialComments: commentData || []
      } 
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return { notFound: true };
  }
}

export default function BlogPost({ post, initialComments }) {
  const [likes, setLikes] = useState(post.likes || 0);
  const [liked, setLiked] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const closeNav = () => {
    setIsNavOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isNavOpen && !event.target.closest(`.${styles.nav}`) && 
          !event.target.closest(`.${styles.navToggle}`)) {
        closeNav();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNavOpen]);

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

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .insert([
          {
            post_id: post.id,
            name: name.trim(),
            comment: comment.trim()
          }
        ])
        .select();

      if (error) throw error;

      setComments([data[0], ...comments]);
      setName("");
      setComment("");
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.bg}>
      <div className={styles.container}>
        {/* Header with Navigation */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerTitleLarge}>The Balance Code</span>
            <span className={styles.headerSubtitleSmall}>Alliance Network</span>
          </div>

          <button 
            className={styles.navToggle} 
            onClick={toggleNav}
            aria-label={isNavOpen ? "Close menu" : "Open menu"}
            aria-expanded={isNavOpen}
          >
            {isNavOpen ? '✕' : '☰'}
          </button>

          {/* Navigation Menu - Only visible when isNavOpen is true */}
          {isNavOpen && (
            <>
              <nav className={`${styles.nav} ${isNavOpen ? styles.open : ''}`}>
                <Link href="/" onClick={closeNav} className={styles.navLink}>Home</Link>
                <Link href="/about" onClick={closeNav} className={styles.navLink}>About</Link>
                <Link href="/contact" onClick={closeNav} className={styles.navLink}>Contact</Link>
              </nav>
              <div 
                className={`${styles.navOverlay} ${isNavOpen ? styles.open : ''}`} 
                onClick={closeNav}
                aria-hidden="true"
              />
            </>
          )}
        </header>

        {/* Blog Post Content */}
        <div className={styles.detailsCard}>
          {post.image_url && (
            <img src={post.image_url} alt={post.title} className={styles.detailsImage} />
          )}

          <h1 className={styles.detailsTitle}>{post.title}</h1>

          <p className={styles.detailsDescription}>{post.content}</p>

          <div className={styles.detailsButtonRow}>
            <button onClick={likePost} disabled={liked} className={liked ? styles.liked : styles.liked}>
              👍 {likes}
            </button>

            <button onClick={sharePost} disabled={isSharing} className={styles.share}>
              {isSharing ? "Sharing..." : "🔗"}
            </button>
          </div>

          <button onClick={() => router.push("/")} className={styles.backButton}>
            Go Back Home
          </button>
        </div>

        {/* Comment Section */}
        <div className={styles.commentSection}>
          <h2 className={styles.commentTitle}>Leave a Comment</h2>
          <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className={styles.commentInput}
              required
            />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Your comment"
              className={styles.commentTextarea}
              required
            />
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={styles.commentSubmit}
            >
              {isSubmitting ? "Posting..." : "Post Comment"}
            </button>
          </form>

          {/* Comments List */}
          <div className={styles.commentsList}>
            <h2 className={styles.commentTitle}>Comments ({comments.length})</h2>
            {comments.length === 0 ? (
              <p className={styles.noComments}>No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className={styles.commentItem}>
                  <h3 className={styles.commentName}>{comment.name}</h3>
                  <p className={styles.commentText}>{comment.comment}</p>
                  <p className={styles.commentDate}>
                    {new Date(comment.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
        <br /><br /><br />

        <footer className={styles.footer}>
          © {new Date().getFullYear()} All rights reserved. Onyxe Nnaemeka Blog.
        </footer>
      </div>
    </div>
  );
}