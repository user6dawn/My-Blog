import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { Analytics } from "@vercel/analytics/react"
import styles from "../styles/style.module.css";
import Head from 'next/head';

export async function getServerSideProps() {
  try {
    // Fetch posts
    const { data: postsData, error: postsError } = await supabase
      .from("posts")
      .select("id, title, content, image_url, likes, created_at")
      .order("created_at", { ascending: false });

    if (postsError) throw postsError;

    // Fetch ads
    const { data: adsData, error: adsError } = await supabase
      .from("ads")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (adsError) throw adsError;

    // Fetch all comments with post_id only
    const { data: commentData, error: commentError } = await supabase
      .from("comments")
      .select("post_id");

    if (commentError) throw commentError;

    // Count comments per post
    const commentMap = {};
    commentData.forEach(({ post_id }) => {
      commentMap[post_id] = (commentMap[post_id] || 0) + 1;
    });

    // Merge comment count into each post
    const postsWithComments = postsData.map(post => ({
      ...post,
      comment_count: commentMap[post.id] || 0
    }));

    return { 
      props: { 
        initialPosts: postsWithComments,
        initialAds: adsData || []
      } 
    };

  } catch (error) {
    console.error("Error fetching data:", error);
    return { 
      props: { 
        initialPosts: [],
        initialAds: []
      } 
    };
  }
}


export default function Home({ initialPosts = [], initialAds = [] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [ads, setAds] = useState(initialAds);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [likedPosts, setLikedPosts] = useState({});
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    const storedLikes = JSON.parse(localStorage.getItem("likedPosts")) || {};
    setLikedPosts(storedLikes);
  }, []);

  useEffect(() => {
    const trackAdImpression = async (adId) => {
      try {
        await supabase.rpc('increment_ad_display', { ad_id: adId });
      } catch (error) {
        console.error('Error tracking ad impression:', error);
      }
    };

    ads?.forEach(ad => {
      if (ad?.id) trackAdImpression(ad.id);
    });
  }, [ads]);

  const toggleNav = () => setIsNavOpen(!isNavOpen);
  const closeNav = () => setIsNavOpen(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isNavOpen && 
        !event.target.closest(`.${styles.nav}`) && 
        !event.target.closest(`.${styles.navToggle}`)
      ) {
        closeNav();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNavOpen]);

  const likePost = async (id, currentLikes) => {
    if (likedPosts[id]) return;
    const { error } = await supabase
      .from("posts")
      .update({ likes: currentLikes + 1 })
      .eq("id", id);

    if (!error) {
      const updatedPosts = posts.map(post =>
        post.id === id ? { ...post, likes: currentLikes + 1 } : post
      );
      const updatedLikes = { ...likedPosts, [id]: true };
      setPosts(updatedPosts);
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

  const trackAdClick = async (adId) => {
    try {
      await supabase.rpc('increment_ad_clicks', { ad_id: adId });
    } catch (error) {
      console.error('Error tracking ad click:', error);
    }
  };

  const getRandomAd = () => {
    const betweenPostsAds = ads.filter(ad => ad?.position === 'between_posts');
    return betweenPostsAds.length > 0 
      ? betweenPostsAds[Math.floor(Math.random() * betweenPostsAds.length)] 
      : null;
  };


  return (
    <>
      <Head>
        <title>The Balance Code Alliance</title>
        <meta name="description" content="Restoring Order. Unlocking Peace. Empowering Lives. Explore insightful blogs and articles by Onyxe Nnaemeka." />
        <meta name="robots" content="index, follow" />
        <meta name="google-site-verification" content="QQ-oix7EJcaWi6X6perTvyv7J8JX9PVnQ_jI5GTBWBY" />
      </Head>

      <div className={styles.bg}>
        <div className={styles.container}>
          {/* Header */}
          <header className={styles.header}>
            <div className={styles.headerLeft}>
              <span className={styles.headerTitleLarge}>The Balance Code Alliance</span>
              <span className={styles.headerSubtitleSmall}>Restoring Order. Unlocking Peace. Empowering Lives</span>
            </div>

            <button 
              className={styles.navToggle} 
              onClick={toggleNav}
              aria-label={isNavOpen ? "Close menu" : "Open menu"}
              aria-expanded={isNavOpen}
            >
              {isNavOpen ? '✕' : '☰'}
            </button>

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

          <main>
            <h1 className={styles.postdetails}>Recent Posts</h1>
            {!posts?.length ? (
              <p className={styles.noPosts}>No posts available.</p>
            ) : (
              posts.map((post, index) => {
                const randomAd = getRandomAd();
                return (
                  <div key={post.id}>
                    <div className={styles.card}>
                      {post.image_url && <img src={post.image_url} alt={post.title} className={styles.image} />}
                      <div className={styles.content}>

                        <h2 className={styles.blog_title}
                        dangerouslySetInnerHTML={{ __html: post.title }}
                        />

                        <p className={styles.description}
                        dangerouslySetInnerHTML={{
                          __html: post.content.slice(0, 200) + 
                        (post.length > 200 ? "..." : "")}}
                        /> 
                        <div className={styles.bottomRow}>
                          <div className={styles.buttonRow}>
                            <button
                              onClick={() => likePost(post.id, post.likes)}
                              disabled={likedPosts[post.id]}
                              className={styles.liked}
                              aria-label={`Like ${post.title}`}
                            >
                              <img
                                src={likedPosts[post.id] ? "/liked.svg" : "/notliked.svg"}
                                alt="Like"
                                width={20}
                                height={20}
                              />{" "}{post.likes || 0}
                              
                            </button>

                            <button
                              onClick={() => sharePost(post.title, post.id)}
                              disabled={isSharing}
                              className={isSharing ? styles.sharing : styles.share}
                              aria-label={`Share ${post.title}`}
                            >
                              {isSharing ? "sharing" : <img src="/share.svg" alt="Share" width={20} height={20} />}
                            </button>

                            <Link href={`/post/${post.id}`} className={styles.commentButton}>
                              <img src="/comment.svg" alt="Comments" width={20} height={20} />
                              <span style={{ marginLeft: "5px", fontSize: "16px", color: "#000000" }}>
                                {post.comment_count || 0}
                              </span>
                            </Link>


                          </div>

                          <Link href={`/post/${post.id}`} className={styles.readmore}>
                            <button className={styles.readmore}>Read More...</button>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Ad */}
                    {index < posts.length - 1 && (
                      <div className={styles.adContainer}>
                        <div className={styles.adContent}>
                          {randomAd ? (
                            <a 
                              href={randomAd.link_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              onClick={() => trackAdClick(randomAd.id)}
                            >
                              {randomAd.image_url && (
                                <img src={randomAd.image_url} className={styles.adImage}/>
                              )}
                            </a>
                          ) : (
                            <p className={styles.adPlaceholder}>
                              <marquee behavior="scroll" direction="right">Advertisement</marquee>
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </main>

          <br />

          <footer className={styles.footer}>
          © {new Date().getFullYear()} Onyxe Nnaemeka Blog. All rights reserved.
          </footer>
          <Analytics />
        </div>
      </div>
    </>
  );
}
