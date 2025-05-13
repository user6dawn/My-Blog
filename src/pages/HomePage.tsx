import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import PostCard from '../components/PostCard';
import AdDisplay from '../components/AdDisplay';
import NotificationBell from '../components/NotificationBell';
import { Post, Ad } from '../types';

const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
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

        // Fetch comments count
        const { data: commentData, error: commentError } = await supabase
          .from("comments")
          .select("post_id");

        if (commentError) throw commentError;

        // Count comments per post
        const commentMap: Record<string, number> = {};
        commentData?.forEach(({ post_id }) => {
          commentMap[post_id] = (commentMap[post_id] || 0) + 1;
        });

        // Merge comment count into each post
        const postsWithComments = postsData?.map(post => ({
          ...post,
          comment_count: commentMap[post.id] || 0
        }));

        setPosts(postsWithComments || []);
        setAds(adsData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const storedLikes = JSON.parse(localStorage.getItem("likedPosts") || "{}");
    setLikedPosts(storedLikes);
  }, []);

  const getRandomAd = (position: string) => {
    const filteredAds = ads.filter(ad => ad?.position === position);
    return filteredAds.length > 0 
      ? filteredAds[Math.floor(Math.random() * filteredAds.length)] 
      : null;
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:gap-6">
        <div className="w-full md:w-2/3">
          <h1 className="text-2xl font-bold mb-6">Recent Posts</h1>
          
          {loading ? (
            <div className="text-center py-8">Loading posts...</div>
          ) : !posts.length ? (
            <p className="no-posts">No posts available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {posts.flatMap((post, index) => {
                const elements: JSX.Element[] = [];

                elements.push(
                  <PostCard
                    key={`post-${post.id}`}
                    post={post}
                    likedPosts={likedPosts}
                    setLikedPosts={setLikedPosts}
                  />
                );

                if ((index + 1) % 2 === 0 && index < posts.length - 1) {
                  elements.push(
                    <div key={`ad-mobile-${index}`} className="block md:hidden">
                      <AdDisplay ad={getRandomAd('between_posts')} position="between_posts" />
                    </div>
                  );
                }

                if ((index + 1) % 4 === 0 && index < posts.length - 1) {
                  elements.push(
                    <div key={`ad-desktop-${index}`} className="hidden md:block col-span-2">
                      <AdDisplay ad={getRandomAd('between_posts')} position="between_posts" />
                    </div>
                  );
                }

                return elements;
              })}
            </div>
          )}
        </div>
        
        <div className="hidden md:block md:w-1/3">
          <div className="sticky top-24">
            <AdDisplay ad={getRandomAd('sidebar')} position="sidebar" />
            <div className="mt-6">
              <AdDisplay ad={getRandomAd('sidebar')} position="sidebar" />
            </div>
          </div>
        </div>
      </div>
      
      <NotificationBell />
    </Layout>
  );
};

export default HomePage;