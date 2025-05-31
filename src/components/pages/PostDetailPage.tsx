"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import Link from 'next/link'
import Head from 'next/head'
import { supabase } from "@/lib/supabase"
import CommentList from "@/components/CommentList"
import CommentForm from "@/components/CommentForm"
import AdDisplay from "@/components/AdDisplay"
import type { Post, Comment, Ad } from "@/types"
import { Share2, Home, Heart, X, Facebook, LinkIcon, Instagram, Send } from "lucide-react"
import Layout from "@/components/Layout"
import '@/styles/styles.css';

const PostDetailPage: React.FC = () => {
  const params = useParams()
  const id = params?.id as string
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [showSharePreview, setShowSharePreview] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Helper function to extract plain text from HTML
  const getPlainTextFromHTML = (html: string) => {
    if (!html) return ""
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = html
    return tempDiv.textContent || tempDiv.innerText || ""
  }

  // Helper function to get a short excerpt from content
  const getExcerpt = (htmlContent: string, maxLength = 160) => {
    if (!htmlContent) return ""
    const plainText = getPlainTextFromHTML(htmlContent)
    return plainText.length > maxLength ? plainText.substring(0, maxLength) + "..." : plainText
  }

  useEffect(() => {
    const fetchPostDetails = async () => {
      if (!id) return

      try {
        const { data: postData, error: postError } = await supabase
          .from("posts")
          .select("id, title, content, image_url, likes, created_at")
          .eq("id", id)
          .single()

        if (postError) throw postError

        const { data: commentData, error: commentError } = await supabase
          .from("comments")
          .select("id, name, comment, created_at, parent_id, likes, post_id")
          .eq("post_id", id)
          .order("created_at", { ascending: true })

        if (commentError) throw commentError

        const { data: adsData, error: adsError } = await supabase
          .from("ads")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })

        if (adsError) throw adsError

        setPost(postData)
        setAds(adsData || [])
        setShareUrl(`${window.location.origin}/post/${id}`)

        const nestComments = (comments: Comment[]) => {
          const map: Record<string, Comment> = {}
          comments.forEach((c) => (map[c.id] = { ...c, replies: [] }))

          const roots: Comment[] = []
          comments.forEach((c) => {
            if (c.parent_id) {
              if (map[c.parent_id]?.replies) {
                map[c.parent_id].replies?.push(map[c.id])
              }
            } else {
              roots.push(map[c.id])
            }
          })
          return roots
        }

        setComments(nestComments(commentData || []))
      } catch (error) {
        console.error("Error fetching post details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPostDetails()
  }, [id])

  useEffect(() => {
    const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "{}")
    setLiked(likedPosts[id || ""] || false)
  }, [id])

  const refreshComments = async () => {
    if (!id) return

    const { data, error } = await supabase
      .from("comments")
      .select("id, name, comment, created_at, parent_id, likes, post_id")
      .eq("post_id", id)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error refreshing comments:", error)
      return
    }

    const nestComments = (comments: Comment[]) => {
      const map: Record<string, Comment> = {}
      comments.forEach((c) => (map[c.id] = { ...c, replies: [] }))

      const roots: Comment[] = []
      comments.forEach((c) => {
        if (c.parent_id) {
          if (map[c.parent_id]?.replies) {
            map[c.parent_id].replies?.push(map[c.id])
          }
        } else {
          roots.push(map[c.id])
        }
      })
      return roots
    }

    setComments(nestComments(data || []))
  }

  const likePost = async () => {
    if (!post || liked) return

    const { error } = await supabase
      .from("posts")
      .update({ likes: (post.likes || 0) + 1 })
      .eq("id", post.id)

    if (!error) {
      setPost({ ...post, likes: (post.likes || 0) + 1 })
      setLiked(true)
      const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "{}")
      likedPosts[post.id] = true
      localStorage.setItem("likedPosts", JSON.stringify(likedPosts))
    }
  }

  const copyToClipboardWithImage = async () => {
    if (!post) return;
    
    try {
      const url = `${window.location.origin}/post/${post.id}`;
      const plainTitle = getPlainTextFromHTML(post.title);
      
      // Create rich text with image
      const htmlContent = `
        <div style="font-family: sans-serif; max-width: 500px;">
          <h1 style="font-size: 1.2rem; margin-bottom: 0.5rem;">${plainTitle}</h1>
          ${post.image_url ? `<img src="${post.image_url}" alt="${plainTitle}" style="max-width: 100%; border-radius: 8px; margin-bottom: 0.5rem;">` : ''}
          <p style="margin: 0;">Read more: <a href="${url}">${url}</a></p>
        </div>
      `;
      
      // Modern clipboard API
      if (navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/plain': new Blob([`${plainTitle}\n\n${post.image_url ? post.image_url + '\n\n' : ''}${url}`], { type: 'text/plain' }),
            'text/html': new Blob([htmlContent], { type: 'text/html' })
          })
        ]);
        alert('Copied to clipboard with image!');
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = `${plainTitle}\n\n${url}`;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Copied to clipboard!');
      }
    } catch (error) {
      console.error('Copy failed:', error);
      alert('Could not copy to clipboard');
    }
  };

  const sharePost = async () => {
    if (!post) return;
    
    try {
      setIsSharing(true);
      const url = `${window.location.origin}/post/${post.id}`;
      const plainTitle = getPlainTextFromHTML(post.title);
      
      if (navigator.share) {
        // Try to share with image file if possible
        if (post.image_url && navigator.canShare?.({ files: [new File([], 'image.png')] })) {
          try {
            const response = await fetch(post.image_url);
            const blob = await response.blob();
            const file = new File([blob], 'post-image.png', { type: blob.type });
            
            await navigator.share({
              title: plainTitle,
              text: `${plainTitle}\n\n${url}`,
              files: [file],
            });
            return;
          } catch (error) {
            console.log("Image sharing failed, falling back to text");
          }
        }
        
        // Standard text sharing fallback
        await navigator.share({
          title: plainTitle,
          text: `${plainTitle}\n\n${url}`,
          url: url,
        });
      } else {
        // Fallback for non-mobile or unsupported browsers
        setShowSharePreview(true);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      setShowSharePreview(true); // Fallback to preview modal
    } finally {
      setIsSharing(false);
    }
  };

  const socialMediaShare = (platform: string) => {
    if (!post || !shareUrl) return;

    const url = shareUrl;
    const plainTitle = getPlainTextFromHTML(post.title);
    const imageUrl = post.image_url || '';

    switch (platform) {
      case "x":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(plainTitle)}&url=${encodeURIComponent(url)}`,
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
          `https://wa.me/?text=${encodeURIComponent(`${plainTitle}\n\n${url}`)}`,
          "_blank"
        );
        break;
      case "instagram":
        // Since Instagram doesn't have a direct share URL, we'll copy the link and show instructions
        navigator.clipboard.writeText(url).then(() => {
          alert('Link copied! Open Instagram and paste in your story or direct message.');
        });
        break;
      case "tiktok":
        // TikTok doesn't have a direct share URL, we'll copy the link and show instructions
        navigator.clipboard.writeText(url).then(() => {
          alert('Link copied! Open TikTok and paste in your bio or direct message.');
        });
        break;
    }
    setShowSharePreview(false);
  };

  const SharePreview = ({ onClose }: { onClose: () => void }) => {
    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      } catch (error) {
        console.error('Copy failed:', error);
        alert('Could not copy to clipboard');
      }
    };

    const RichPreviewMockup = () => (
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-4 max-w-lg mx-auto">
        {post?.image_url && (
          <img
            src={post.image_url}
            alt={getPlainTextFromHTML(post?.title || '')}
            className="w-full h-48 object-cover rounded-md mb-4"
          />
        )}
        <h3 className="text-lg font-semibold mb-2 dark:text-gray-100">
          {getPlainTextFromHTML(post?.title || '')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          {getExcerpt(post?.content || '')}
        </p>
      </div>
    );

    return (
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-lg w-full">
          <div className="p-4 border-b border-gray-200 dark:border-zinc-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Share Post</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-4">
            <RichPreviewMockup />
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
  };

  const getRandomAd = (position: string) => {
    const filteredAds = ads.filter((ad) => ad?.position === position)
    return filteredAds.length > 0 ? filteredAds[Math.floor(Math.random() * filteredAds.length)] : null
  }

  const flattenComments = (comments: Comment[]) => {
    let flat: Comment[] = []
    comments.forEach((c) => {
      const { replies, ...commentWithoutReplies } = c
      flat.push(commentWithoutReplies as Comment)
      if (replies?.length) {
        flat = flat.concat(flattenComments(replies))
      }
    })
    return flat
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-pulse text-xl">Loading post...</div>
        </div>
      </Layout>
    )
  }

  if (!post) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <p className="mb-6">Sorry, the post you're looking for doesn't exist or has been removed.</p>
          <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Return Home
          </Link>
        </div>
      </Layout>
    )
  }

  const currentShareUrl = `${window.location.origin}/post/${post.id}`;
  const plainTextContent = post.content.replace(/<[^>]*>/g, "");
  const excerpt = plainTextContent.substring(0, 160);

  return (
    <Layout>
      <Head>
        <title>{post.title} | The Balance Code Alliance</title>
        <meta name="description" content={excerpt} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={currentShareUrl} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={excerpt} />
        {post.image_url && (
          <>
            <meta property="og:image" content={post.image_url} />
            <meta property="og:image:secure_url" content={post.image_url} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={post.title} />
            <meta property="og:image:type" content="image/webp" />
          </>
        )}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@YourTwitterHandle" />
        <meta name="twitter:creator" content="@YourTwitterHandle" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={excerpt} />
        {post.image_url && (
          <meta name="twitter:image" content={post.image_url} />
        )}
      </Head>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md overflow-hidden transition-colors duration-300">
          {post.image_url && (
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-64 sm:h-96 object-cover"
            />
          )}

          <div className="p-6 text-gray-800 dark:text-gray-100 transition-colors duration-300">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4" dangerouslySetInnerHTML={{ __html: post.title }} />

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={likePost}
                  className={`flex items-center space-x-2 ${
                    liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                  }`}
                >
                  <Heart className={liked ? 'fill-current' : ''} size={20} />
                  <span>{post?.likes || 0}</span>
                </button>
                <button
                  onClick={() => setShowSharePreview(true)}
                  className="flex items-center space-x-2 text-gray-500 hover:text-blue-500"
                >
                  <Share2 size={20} />
                </button>
              </div>
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
              >
                <Home size={18} />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="my-6">
          <AdDisplay ad={getRandomAd("between_posts")} position="between_posts" />
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6 mt-6 transition-colors duration-300">
          <CommentForm postId={post.id} onCommentAdded={refreshComments} />

          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Comments ({flattenComments(comments).length})</h2>
            <CommentList comments={comments} postId={post.id} onCommentUpdated={refreshComments} />
          </div>
        </div>

        <div className="my-6">
          <AdDisplay ad={getRandomAd("between_posts")} position="between_posts" />
        </div>

        {showSharePreview && <SharePreview onClose={() => setShowSharePreview(false)} />}
      </div>
    </Layout>
  )
}

export default PostDetailPage