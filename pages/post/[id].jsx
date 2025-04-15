import { supabase } from "../../lib/supabase";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "../../styles/style.module.css";

export async function getServerSideProps({ params }) {
  try {
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select("id, title, content, image_url, likes, created_at")
      .eq("id", params.id)
      .single();

    if (postError) throw postError;

const { data: commentData, error: commentError } = await supabase
  .from("comments")
  .select("id, name, comment, created_at, parent_id, likes")
  .eq("post_id", params.id)
  .order("created_at", { ascending: true });


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
  const [comments, setComments] = useState([]);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const nestComments = (comments) => {
    const map = {};
    comments.forEach((c) => (map[c.id] = { ...c, replies: [] }));
    const roots = [];
    comments.forEach((c) => {
      if (c.parent_id) {
        map[c.parent_id]?.replies.push(map[c.id]);
      } else {
        roots.push(map[c.id]);
      }
    });
    return roots;
  };

  useEffect(() => {
    setComments(nestComments(initialComments));
  }, [initialComments]);

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
    if (!navigator.share) return alert("Sharing not supported.");
    if (isSharing) return;
    try {
      setIsSharing(true);
      await navigator.share({ title: post.title, url });
    } catch (error) {
      console.error("Error sharing:", error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCommentSubmit = async (e, parentId = null, replyText = null, replyName = null, setReplying = null) => {
    e.preventDefault();
    const inputName = replyName || name;
    const inputComment = replyText || comment;
    if (!inputName.trim() || !inputComment.trim()) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .insert([
          {
            post_id: post.id,
            name: inputName.trim(),
            comment: inputComment.trim(),
            parent_id: parentId,
          },
        ])
        .select();

      if (error) throw error;

      setComments((prev) => nestComments([data[0], ...flattenComments(prev)]));
      if (!parentId) {
        setName("");
        setComment("");
      } else {
        setReplying(false);
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const flattenComments = (comments) => {
    let flat = [];
    comments.forEach((c) => {
      flat.push({ ...c, replies: [] });
      if (c.replies?.length) {
        flat = flat.concat(flattenComments(c.replies));
      }
    });
    return flat;
  };

  const likeComment = async (commentId) => {
    const likedComments = JSON.parse(localStorage.getItem("likedComments")) || {};
    if (likedComments[commentId]) return; // already liked
  
    const { data, error } = await supabase.rpc("increment_comment_likes", { comment_id_input: commentId });
  
    if (!error) {
      const updated = flattenComments(comments).map((c) =>
        c.id === commentId ? { ...c, likes: c.likes + 1 } : c
      );
      setComments(nestComments(updated));
  
      localStorage.setItem(
        "likedComments",
        JSON.stringify({ ...likedComments, [commentId]: true })
      );
    } else {
      console.error("Error liking comment:", error);
    }
  };
  

  const getRandomAd = () => {
    if (!ads || ads.length === 0) return null;
    const betweenPostsAds = ads.filter((ad) => ad?.position === "between_posts");
    return betweenPostsAds.length > 0
      ? betweenPostsAds[Math.floor(Math.random() * betweenPostsAds.length)]
      : null;
  };

  const Comment = ({ comment, level = 0 }) => {
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [replyName, setReplyName] = useState("");

      return (
        <div style={{ marginLeft: `${level * 20}px`, marginTop: "1rem", borderLeft: level ? "2px solid #ccc" : "none", paddingLeft: level ? "1rem" : "0" }}>
          <div className={styles.commentInput}>
            <h3 className={styles.commentName}>{comment.name}</h3>
            <p className={styles.commentText}>{comment.comment}</p>
            <div className="text-sm text-gray-600 flex gap-3 mb-2">
              <button
                onClick={() => likeComment(comment.id)}
                disabled={localStorage.getItem("likedComments")?.includes(comment.id)}
                className={styles.liked}
              >
                <img
                  src={
                    JSON.parse(localStorage.getItem("likedComments") || "{}")[comment.id]
                      ? "/liked.svg"
                      : "/notliked.svg"
                  }
                  alt="Like"
                  width={16}
                  height={16}
                />
                {comment.likes}
              </button>

              <button
                onClick={() => setShowReplyBox(!showReplyBox)}
                className={styles.commentReplySubmitButton}
              >
                {showReplyBox ? "cancel" : "Reply"}
              </button>
            </div>
    
            {showReplyBox && (
              <form onSubmit={(e) => handleCommentSubmit(e, comment.id, replyText, replyName, setShowReplyBox)} className={styles.commentForm}>
                <input
                  type="text"
                  value={replyName}
                  onChange={(e) => setReplyName(e.target.value)}
                  placeholder="Your name"
                  className={styles.commentInput}
                  required
                />
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Your reply"
                  className={styles.commentTextarea}
                  required
                />
                <button type="submit" className={styles.commentReplySubmitButton}>
                  {isSubmitting ? "Replying..." : "Post Reply"}
                </button>
              </form>
            )}
          </div>
    
          {comment.replies &&
            comment.replies.map((reply) => (
              <Comment key={reply.id} comment={reply} level={level + 1} />
            ))}
        </div>
      );
    };

  return (
    <div className={styles.bg}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerTitleLarge}>The Balance Code Alliance</span>
            <span className={styles.headerSubtitleSmall}>
              Restoring Order. Unlocking Peace. Empowering Lives
            </span>
          </div>
          <button
            className={styles.navToggle}
            onClick={() => setIsNavOpen(!isNavOpen)}
            aria-label={isNavOpen ? "Close menu" : "Open menu"}
            aria-expanded={isNavOpen}
          >
            {isNavOpen ? "✕" : "☰"}
          </button>
          {isNavOpen && (
            <>
              <nav className={`${styles.nav} ${isNavOpen ? styles.open : ""}`}>
                <Link href="/" onClick={() => setIsNavOpen(false)} className={styles.navLink}>
                  Home
                </Link>
                <Link href="/about" onClick={() => setIsNavOpen(false)} className={styles.navLink}>
                  About
                </Link>
                <Link href="/contact" onClick={() => setIsNavOpen(false)} className={styles.navLink}>
                  Contact
                </Link>
              </nav>
              <div className={`${styles.navOverlay} ${isNavOpen ? styles.open : ""}`} onClick={() => setIsNavOpen(false)} />
            </>
          )}
        </header>

        <div className={styles.detailsCard}>
          {post.image_url && (
            <img src={post.image_url} alt={post.title} className={styles.detailsImage} />
          )}
          <h1 className={styles.detailsTitle}>{post.title}</h1>
          <div style={{ textAlign: "left" }}>
            <p
                className={styles.detailsDescription}
                style={{ textAlign: "left" }}
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
          </div>

          <div className={styles.detailsButtonRow}>
            <div className={styles.likeshare}>
              <button onClick={likePost} disabled={liked} className={styles.liked}>
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
                {isSharing ? "sharing" : <img src="/share.svg" alt="Sharing..." width={20} height={20} />}
              </button>
            </div>
            <button onClick={() => (window.location.href = "/")} className={styles.backButton}>
              Go Back Home
            </button>
          </div>

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

            <div className={styles.commentsList}>
              <h2 className={styles.commentTitle}>Comments ({flattenComments(comments).length})</h2>
              {comments.length === 0 ? (
                <p className={styles.noComments}>No comments yet. Be the first to comment!</p>
              ) : (
                comments.map((comment) => <Comment key={comment.id} comment={comment} level={0} />)
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
