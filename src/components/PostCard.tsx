import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../types';
import { supabase } from '../lib/supabase';
import { Heart, Share2, MessageCircle } from 'lucide-react';

interface PostCardProps {
  post: Post;
  likedPosts: Record<string, boolean>;
  setLikedPosts: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

const PostCard: React.FC<PostCardProps> = ({ post, likedPosts, setLikedPosts }) => {
  const [isSharing, setIsSharing] = useState(false);

  const likePost = async (id: string, currentLikes: number) => {
    if (likedPosts[id]) return;

    const { error } = await supabase
      .from("posts")
      .update({ likes: currentLikes + 1 })
      .eq("id", id);

    if (!error) {
      const updatedLikes = { ...likedPosts, [id]: true };
      setLikedPosts(updatedLikes);
      localStorage.setItem("likedPosts", JSON.stringify(updatedLikes));
    }
  };

  const sharePost = async (title: string, id: string) => {
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

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden shadow-md dark:border-gray-700">
      {post.image_url && (
        <img
          src={post.image_url}
          alt={post.title}
          className="w-full h-48 object-cover"
        />
      )}

      <div className="flex-1 p-4 flex flex-col">
        <h2
          className="text-xl font-semibold mb-2"
          dangerouslySetInnerHTML={{ __html: post.title }}
        />

        <p
          className="mb-4 text-gray-700 dark:text-gray-300"
          dangerouslySetInnerHTML={{
            __html:
              post.content.slice(0, 100) +
              (post.content.length > 100 ? "..." : ""),
          }}
        />

        <div className="mt-auto pt-4 border-t dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <button
                onClick={() => likePost(post.id, post.likes)}
                disabled={likedPosts[post.id]}
                className="flex items-center gap-1"
                aria-label={`Like ${post.title}`}
              >
                <Heart
                  size={16}
                  className={
                    likedPosts[post.id]
                      ? "text-red-500 fill-red-500"
                      : "text-gray-700 dark:text-gray-300"
                  }
                />
                <span>{post.likes || 0}</span>
              </button>

              <button
                onClick={() => sharePost(post.title, post.id)}
                disabled={isSharing}
                className="flex items-center gap-1"
                aria-label={`Share ${post.title}`}
              >
                {isSharing ? "Sharing..." : <Share2 size={16} />}
              </button>

              <Link
                to={`/post/${post.id}`}
                className="flex items-center gap-1"
              >
                <MessageCircle size={16} />
                <span>{post.comment_count || 0}</span>
              </Link>
            </div>

            <Link
              to={`/post/${post.id}`}
              className="text-blue-500 dark:text-blue-400 font-medium hover:text-blue-600 dark:hover:text-blue-300"
            >
              Read More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;