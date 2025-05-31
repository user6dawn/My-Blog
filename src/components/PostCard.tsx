import React, { useState } from 'react';
import Link from 'next/link';
import { Post } from '../types';
import { supabase } from '../lib/supabase';
import { Heart, Share2, MessageCircle, X, Facebook, Instagram, LinkIcon } from 'lucide-react';

interface PostCardProps {
  post: Post;
  likedPosts: Record<string, boolean>;
  setLikedPosts: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

const PostCard: React.FC<PostCardProps> = ({ post, likedPosts, setLikedPosts }) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  // Helper function to clean HTML tags
  const cleanHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

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

  const handleShare = () => {
    setShareUrl(`${window.location.origin}/post/${post.id}`);
    setShowShareModal(true);
  };

  const socialMediaShare = (platform: string) => {
    if (!shareUrl) return;

    const cleanTitle = cleanHtml(post.title);
    const url = shareUrl;

    switch (platform) {
      case "x":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(cleanTitle)}&url=${encodeURIComponent(url)}`,
          "_blank",
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${cleanTitle}\n\n${url}`)}`,
          "_blank"
        );
        break;
      case "instagram":
        navigator.clipboard.writeText(url).then(() => {
          alert('Link copied! Open Instagram and paste in your story or direct message.');
        });
        break;
      case "tiktok":
        navigator.clipboard.writeText(url).then(() => {
          alert('Link copied! Open TikTok and paste in your bio or direct message.');
        });
        break;
    }
    setShowShareModal(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    } catch (error) {
      console.error('Copy failed:', error);
      alert('Could not copy to clipboard');
    }
  };

  const ShareModal = () => (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-lg w-full">
        <div className="p-4 border-b border-gray-200 dark:border-zinc-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Share Post</h3>
          <button
            onClick={() => setShowShareModal(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-4 max-w-lg mx-auto">
            {post.image_url && (
              <img
                src={post.image_url}
                alt={cleanHtml(post.title)}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
            )}
            <h3 className="text-lg font-semibold mb-2 dark:text-gray-100">
              {cleanHtml(post.title)}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {cleanHtml(post.content).substring(0, 160)}...
            </p>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4">
            <button
              onClick={() => socialMediaShare('x')}
              className="flex flex-col items-center justify-center p-3 rounded-lg bg-black text-white hover:bg-gray-800 dark:bg-zinc-800 dark:hover:bg-zinc-700"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 mb-1 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span className="text-xs">X (Twitter)</span>
            </button>
            <button
              onClick={() => socialMediaShare('facebook')}
              className="flex flex-col items-center justify-center p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
            >
              <Facebook size={24} className="mb-1" />
              <span className="text-xs">Facebook</span>
            </button>
            <button
              onClick={() => socialMediaShare('whatsapp')}
              className="flex flex-col items-center justify-center p-3 rounded-lg bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 mb-1 fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="text-xs">WhatsApp</span>
            </button>
            <button
              onClick={() => socialMediaShare('instagram')}
              className="flex flex-col items-center justify-center p-3 rounded-lg bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white hover:opacity-90 transition-opacity"
            >
              <Instagram size={24} className="mb-1" />
              <span className="text-xs">Instagram</span>
            </button>
            <button
              onClick={() => socialMediaShare('tiktok')}
              className="flex flex-col items-center justify-center p-3 rounded-lg bg-black text-white hover:bg-gray-800 dark:bg-zinc-800 dark:hover:bg-zinc-700"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 mb-1 fill-current">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
              <span className="text-xs">TikTok</span>
            </button>
            <button
              onClick={copyToClipboard}
              className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700"
            >
              <LinkIcon size={24} className="mb-1" />
              <span className="text-xs">Copy Link</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden shadow-md dark:border-gray-700">
      {post.image_url && (
        <img
          src={post.image_url}
          alt={cleanHtml(post.title)}
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
                aria-label={`Like ${cleanHtml(post.title)}`}
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
                onClick={handleShare}
                className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                aria-label={`Share ${cleanHtml(post.title)}`}
              >
                <Share2 size={16} />
              </button>

              <Link
                href={`/post/${post.id}`}
                className="flex items-center gap-1"
              >
                <MessageCircle size={16} />
                <span>{post.comment_count || 0}</span>
              </Link>
            </div>

            <Link href={`/post/${post.id}`} className="text-blue-500">
              Read More
            </Link>
          </div>
        </div>
      </div>

      {showShareModal && <ShareModal />}
    </div>
  );
};

export default PostCard;