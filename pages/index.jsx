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
      <div className="">
        <h1 className={styles.title}>Blog Posts</h1>

        {posts.length === 0 ? (
          <p> className={styles} No posts available.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id}>
              {/* ✅ Blog Image  */}
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt={post.title}
                  className={styles.image}
                  style={{ height: "150px" }} 
                />
              )}

      {/* ✅ Blog Content  */}
      <div >

        {/* ✅ Blog Title (Next to Image) */}
        <h2 className={styles.blog_title}>{post.title}</h2>
        
        {/* ✅ Blog Description (Underneath Title) */}
        <p className={styles.content}>{post.content.slice(0, 100)}...</p>

        {/* ✅ Read More Link */}
          <p className={styles.readmore}>
            <Link href={`/post/${post.id}`}>
              Read More...
            </Link>
          </p>

        {/* ✅ Buttons Row */}
          <div>

            {/* ✅ Like Button (Only Click Once) */}
                <div className={styles.button}> 
                  <button
                    onClick={() => likePost(post.id, post.likes)}
                    disabled={likedPosts[post.id]}
                    className={` ${ likedPosts[post.id] ? "liking" : "liked"}`} >
                    👍 {post.likes || 0} Likes
                  </button>
                </div>

          {/* ✅ Share Button */} 
            <div className={styles.button}>
              <button
                onClick={() => sharePost(post.title, post.id)}
                disabled={isSharing}
                className={` ${ isSharing ? "" : ""}`}>
                {isSharing ? "Sharing..." : "Share"}
              </button>
            </div>
        </div>
      </div>
            </div>
          ))
        )}
      </div>
    );
  }
