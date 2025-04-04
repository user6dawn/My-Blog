import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import styles from "../styles/style.module.css";

export async function getServerSideProps() {
  try {
    // Fetch posts
    const { data: postsData, error: postsError } = await supabase
      .from("posts")
      .select("id, title, content, image_url, likes, created_at")
      .order("created_at", { ascending: false });

    if (postsError) throw postsError;

    // Fetch active ads
    const { data: adsData, error: adsError } = await supabase
      .from("ads")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (adsError) throw adsError;

    return { 
      props: { 
        initialPosts: postsData || [],
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

  // Track ad impressions
  useEffect(() => {
    const trackAdImpression = async (adId) => {
      try {
        await supabase.rpc('increment_ad_display', { ad_id: adId });
      } catch (error) {
        console.error('Error tracking ad impression:', error);
      }
    };

    if (ads && ads.length > 0) {
      ads.forEach(ad => {
        if (ad?.id) trackAdImpression(ad.id);
      });
    }
  }, [ads]);

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

  const trackAdClick = async (adId) => {
    try {
      await supabase.rpc('increment_ad_clicks', { ad_id: adId });
    } catch (error) {
      console.error('Error tracking ad click:', error);
    }
  };

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

        <main>
          <h1 className={styles.postdetails}>Recent Posts</h1>
          {!posts || posts.length === 0 ? (
            <p className={styles.noPosts}>No posts available.</p>
          ) : (
            posts.map((post, index) => {
              const randomAd = getRandomAd();
              return (
                <div key={post.id}>
                  <div className={styles.card}>
                    {post.image_url && (
                      <img src={post.image_url} alt={post.title} className={styles.image} />
                    )}
                    <div className={styles.content}>
                      <h2 className={styles.blog_title}>{post.title}</h2>
                      <p className={styles.description}>{post.content.slice(0, 200)}...</p>
                      <div className={styles.bottomRow}>
                        <div className={styles.buttonRow}>
                          <button
                            onClick={() => likePost(post.id, post.likes)}
                            disabled={likedPosts[post.id]}
                            className={likedPosts[post.id] ? styles.liked : styles.liked}
                            aria-label={`Like ${post.title}`}
                          >
                            👍{post.likes || 0}
                          </button>
                          <button
                            onClick={() => sharePost(post.title, post.id)}
                            disabled={isSharing}
                            className={isSharing ? styles.sharing : styles.share}
                            aria-label={`Share ${post.title}`}
                          >
                            {isSharing ? "Sharing..." : "🔗"}
                          </button>
                          <Link href={`/post/${post.id}`} className={styles.commentButton}>💬</Link>
                        </div>
                        <button className={styles.readmore}>
                          <Link href={`/post/${post.id}`} className={styles.readmore}>Read More...</Link>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Ad Space - Only show between posts, not after last post */}
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
                              <img src={randomAd.image_url} className={styles.adImage}/>)}
                          </a>
                        ) : (
                          <p className={styles.adPlaceholder}><marquee behavior="" direction="right">Advertisement</marquee></p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </main>

        <footer className={styles.footer}>
        Onyxe Nnaemeka Blog. All rights reserved.© {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}