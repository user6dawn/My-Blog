import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import CommentList from '../components/CommentList';
import CommentForm from '../components/CommentForm';
import AdDisplay from '../components/AdDisplay';
import { Post, Comment, Ad } from '../types';
import { Share2, Home, Heart, MessageCircle } from 'lucide-react';
import Layout from '../components/Layout';
import { Helmet } from 'react-helmet';

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    const fetchPostDetails = async () => {
      if (!id) return;

      try {
        const { data: postData, error: postError } = await supabase
          .from("posts")
          .select("id, title, content, image_url, likes, created_at")
          .eq("id", id)
          .single();

        if (postError) throw postError;

        const { data: commentData, error: commentError } = await supabase
          .from("comments")
          .select("id, name, comment, created_at, parent_id, likes, post_id")
          .eq("post_id", id)
          .order("created_at", { ascending: true });

        if (commentError) throw commentError;

        const { data: adsData, error: adsError } = await supabase
          .from("ads")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (adsError) throw adsError;

        setPost(postData);
        setAds(adsData || []);

        const nestComments = (comments: Comment[]) => {
          const map: Record<string, Comment> = {};
          comments.forEach(c => (map[c.id] = { ...c, replies: [] }));

          const roots: Comment[] = [];
          comments.forEach(c => {
            if (c.parent_id && map[c.parent_id]?.replies) {
              map[c.parent_id].replies.push(map[c.id]);
            } else {
              roots.push(map[c.id]);
            }
          });

          return roots;
        };

        setComments(nestComments(commentData || []));
      } catch (error) {
        console.error("Error fetching post details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [id]);

  useEffect(() => {
    const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "{}");
    setLiked(likedPosts[id || ''] || false);
  }, [id]);

  const refreshComments = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from("comments")
      .select("id, name, comment, created_at, parent_id, likes, post_id")
      .eq("post_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error refreshing comments:", error);
      return;
    }

    const nestComments = (comments: Comment[]) => {
      const map: Record<string, Comment> = {};
      comments.forEach(c => (map[c.id] = { ...c, replies: [] }));

      const roots: Comment[] = [];
      comments.forEach(c => {
        if (c.parent_id && map[c.parent_id]?.replies) {
          map[c.parent_id].replies.push(map[c.id]);
        } else {
          roots.push(map[c.id]);
        }
      });

      return roots;
    };

    setComments(nestComments(data || []));
  };

  const likePost = async () => {
    if (!post || liked) return;

    const { error } = await supabase
      .from("posts")
      .update({ likes: (post.likes || 0) + 1 })
      .eq("id", post.id);

    if (!error) {
      setPost({ ...post, likes: (post.likes || 0) + 1 });
      setLiked(true);

      const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "{}");
      likedPosts[post.id] = true;
      localStorage.setItem("likedPosts", JSON.stringify(likedPosts));
    }
  };

  const sharePost = async () => {
    if (!post) return;

    const url = `${window.location.origin}/post/${post.id}`;

    if (!navigator.share) {
      await navigator.clipboard.writeText(url);
      alert("Post URL copied to clipboard!");
      return;
    }

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

  const getRandomAd = (position: string) => {
    const filteredAds = ads.filter(ad => ad?.position === position);
    return filteredAds.length > 0
      ? filteredAds[Math.floor(Math.random() * filteredAds.length)]
      : null;
  };

  const flattenComments = (comments: Comment[]) => {
    let flat: Comment[] = [];
    comments.forEach((c) => {
      const { replies, ...commentWithoutReplies } = c;
      flat.push(commentWithoutReplies as Comment);
      if (replies?.length) {
        flat = flat.concat(flattenComments(replies));
      }
    });
    return flat;
  };

  const canonicalUrl = post ? `${window.location.origin}/post/${post.id}` : '';

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-pulse text-xl">Loading post...</div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <p className="mb-6">Sorry, the post you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Return Home
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.title}</title>
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={(post.content || '').replace(/<[^>]+>/g, '').slice(0, 150)} />
        <meta property="og:image" content={post.image_url || '/default-og-image.jpg'} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Your Blog Name" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={(post.content || '').replace(/<[^>]+>/g, '').slice(0, 150)} />
        <meta name="twitter:image" content={post.image_url || '/default-og-image.jpg'} />
        <meta name="twitter:site" content="@yourhandle" />
        <meta name="twitter:creator" content="@yourhandle" />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md overflow-hidden transition-colors duration-300">
            {post.image_url && (
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full object-cover"
              />
            )}

            <div className="p-6 text-gray-800 dark:text-gray-100 transition-colors duration-300">
              <h1
                className="text-2xl sm:text-3xl font-bold mb-4"
                dangerouslySetInnerHTML={{ __html: post.title }}
              />

              <div className="prose prose-lg dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </div>

              <div className="mt-6 pt-4 border-t border-gray-300 dark:border-gray-700 flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <button
                    onClick={likePost}
                    disabled={liked}
                    className="flex items-center gap-1"
                    aria-label={`Like ${post.title}`}
                  >
                    <Heart
                      size={16}
                      className={
                        liked
                          ? "text-red-500 fill-red-500"
                          : "text-gray-700 dark:text-gray-300"
                      }
                    />
                    <span>{post.likes || 0}</span>
                  </button>

                  <button
                    onClick={sharePost}
                    disabled={isSharing}
                    className="flex items-center gap-1"
                    aria-label={`Share ${post.title}`}
                  >
                    {isSharing ? "Sharing..." : <Share2 size={16} />}
                  </button>

                  <div className="flex items-center gap-1">
                    <MessageCircle size={16} />
                    <span>{flattenComments(comments).length}</span>
                  </div>
                </div>

                <Link
                  to="/"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                >
                  <Home size={18} />
                  <span>Back to Home</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="my-6">
            <AdDisplay ad={getRandomAd('between_posts')} position="between_posts" />
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6 mt-6 transition-colors duration-300">
            <CommentForm postId={post.id} onCommentAdded={refreshComments} />

            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">
                Comments ({flattenComments(comments).length})
              </h2>
              <CommentList
                comments={comments}
                postId={post.id}
                onCommentUpdated={refreshComments}
              />
            </div>
          </div>

          <div className="my-6">
            <AdDisplay ad={getRandomAd('between_posts')} position="between_posts" />
          </div>
        </div>
      </Layout>
    </>
  );
};

export default PostDetailPage;
