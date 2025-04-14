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

    // Get active ads
    const { data: adsData, error: adsError } = await supabase
      .from("ads")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (commentError || adsError) throw commentError || adsError;

    return {
      props: {
        post: postData,
        initialComments: commentData || [],
        ads: adsData || [],
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return { notFound: true };
  }
}

export default function BlogPost({ post, initialComments, ads }) {
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
      if (isNavOpen && !event.target.closest(`.${styles.nav}`) && !event.target.closest(`.${styles.navToggle}`)) {
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
            comment: comment.trim(),
          },
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

  // Get random ad
  const getRandomAd = () => {
    if (!ads || ads.length === 0) return null;
    const betweenPostsAds = ads.filter(ad => ad?.position === 'between_posts');
    return betweenPostsAds.length > 0 
      ? betweenPostsAds[Math.floor(Math.random() * betweenPostsAds.length)] 
      : null;
  };

  return (
    <div className={styles.bg}>
      <div className={styles.container}>
        {/* Header with Navigation */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerTitleLarge}>The Balance Code Alliance</span>
            <span className={styles.headerSubtitleSmall}>Restoring Order.  Unlocking Peace.  Empowering Lives</span>
          </div>

          <button 
            className={styles.navToggle} 
            onClick={toggleNav}
            aria-label={isNavOpen ? "Close menu" : "Open menu"}
            aria-expanded={isNavOpen}
          >
            {isNavOpen ? '✕' : '☰'}
          </button>

          {/* Navigation Menu */}
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

          <div style={{ textAlign: "left" }}>
            <p
              className={styles.detailsDescription}
              dangerouslySetInnerHTML={{
                __html: post.content.replace(/\n/g, '<br />').replace(/ {2,}/g, ' &nbsp;')
              }}
            />
          </div>

          <div className={styles.detailsButtonRow}>
            <div className={styles.likeshare}>
            <button
              onClick={likePost}
              disabled={liked}
              className={styles.liked}
            >
              <img
                src={liked ? "/liked.svg" : "/notliked.svg"}
                alt="Like"
                width={20}
                height={20}
              />{" "}
              {likes}
            </button>

            <button
              onClick={() => sharePost(post.title, post.id)}
              disabled={isSharing}
              className={isSharing ? styles.sharing : styles.share}
              aria-label={`Share ${post.title}`}
            >
              {isSharing ? (
                "sharing"
              ) : (
                <img src="/share.svg" alt="Sharing..." width={20} height={20} />
              )}
            </button>
            </div>
            <button onClick={() => router.push("/")} className={styles.backButton}>
              Go Back Home
            </button>
          </div>

          {/* Ad between content and comment section */}
          {getRandomAd() && (
            <div className={styles.adContainer}>
              <div className={styles.adContent}>
                <a 
                  href={getRandomAd().link_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={() => trackAdClick(getRandomAd().id)}
                >
                  {getRandomAd().image_url && (
                    <img src={getRandomAd().image_url} className={styles.adImage} />
                  )}
                </a>
              </div>
            </div>
          )}

          {/* Comment Section */}
          <div className={styles.commentSection} style={{ textAlign: "left" }}>
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
                className={styles.commentSubmitButton}
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
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
