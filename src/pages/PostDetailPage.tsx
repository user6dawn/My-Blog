"use client"

import { Helmet } from "react-helmet"
import type React from "react"
import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { supabase } from "../lib/supabase"
import CommentList from "../components/CommentList"
import CommentForm from "../components/CommentForm"
import AdDisplay from "../components/AdDisplay"
import type { Post, Comment, Ad } from "../types"
import { Share2, Home, Heart, X, Twitter, Facebook, Linkedin, LinkIcon } from "lucide-react"
import Layout from "../components/Layout"

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [showSharePreview, setShowSharePreview] = useState(false)

  // Helper function to extract plain text from HTML
  const getPlainTextFromHTML = (html: string) => {
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = html
    return tempDiv.textContent || tempDiv.innerText || ""
  }

  // Helper function to get a short excerpt from content
  const getExcerpt = (htmlContent: string, maxLength = 160) => {
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

  const fetchImageFile = async (imageUrl: string): Promise<File> => {
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    const fileName = imageUrl.split("/").pop() || "image.jpg"
    return new File([blob], fileName, { type: blob.type })
  }

  const sharePost = async () => {
    if (!post) return

    // Always show the custom share preview instead of using native share
    setShowSharePreview(true)
  }

  const socialMediaShare = (platform: string) => {
    if (!post) return

    const url = `${window.location.origin}/post/${post.id}`

    const plainTitle = (() => {
      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = post.title
      return tempDiv.textContent || tempDiv.innerText || ""
    })()

    const text = `Check out: ${plainTitle}`

    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          "_blank",
        )
        break
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank")
        break
      case "linkedin":
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank")
        break
    }
    setShowSharePreview(false)
  }

  const SharePreview = ({ onClose }: { onClose: () => void }) => {
    if (!post) return null

    const url = `${window.location.origin}/post/${post.id}`

    const copyToClipboard = async () => {
      const plainTitle = (() => {
        const tempDiv = document.createElement("div")
        tempDiv.innerHTML = post.title
        return tempDiv.textContent || tempDiv.innerText || ""
      })()

      await navigator.clipboard.writeText(`${plainTitle}\n\n${url}`)
      alert("Link copied to clipboard!")
      onClose()
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-zinc-800 rounded-lg max-w-md w-full overflow-hidden shadow-xl">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Share this post</h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="border rounded-lg overflow-hidden mb-4 bg-gray-50 dark:bg-zinc-700">
              {post.image_url && (
                <img src={post.image_url || "/placeholder.svg"} alt={post.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-3">
                <h4 className="font-bold text-sm mb-1">{post.title}</h4>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => socialMediaShare("twitter")}
                className="flex items-center justify-center gap-2 p-2 bg-blue-400 text-white rounded hover:bg-blue-500 transition-colors"
              >
                <Twitter size={16} />
                <span>Twitter</span>
              </button>
              <button
                onClick={() => socialMediaShare("facebook")}
                className="flex items-center justify-center gap-2 p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <Facebook size={16} />
                <span>Facebook</span>
              </button>
              <button
                onClick={() => socialMediaShare("linkedin")}
                className="flex items-center justify-center gap-2 p-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors"
              >
                <Linkedin size={16} />
                <span>LinkedIn</span>
              </button>
              <button
                onClick={copyToClipboard}
                className="flex items-center justify-center gap-2 p-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                <LinkIcon size={16} />
                <span>Copy Link</span>
              </button>
            </div>

            {/* Add native share option if available */}
            {navigator.share && (
              <button
                onClick={async () => {
                  const url = `${window.location.origin}/post/${post.id}`
                  const plainTitle = getPlainTextFromHTML(post.title)
                  const plainExcerpt = getExcerpt(post.content)

                  try {
                    const shareData: ShareData = {
                      title: plainTitle,
                      text: `${plainTitle}\n\n${plainExcerpt}\n\n`,
                      url: url,
                    }

                    if (post.image_url) {
                      try {
                        const imageFile = await fetchImageFile(post.image_url)
                        const testShareData = { ...shareData, files: [imageFile] }
                        if (navigator.canShare && navigator.canShare(testShareData)) {
                          shareData.files = [imageFile]
                        }
                      } catch (error) {
                        console.error("Error sharing image:", error)
                      }
                    }

                    await navigator.share(shareData)
                    onClose()
                  } catch (error) {
                    console.error("Error with native sharing:", error)
                  }
                }}
                className="w-full flex items-center justify-center gap-2 p-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors mt-2"
              >
                <Share2 size={16} />
                <span>More Apps</span>
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

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
          <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Return Home
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {post && (
        <Helmet>
          <title>{post.title.replace(/<[^>]*>/g, "")}</title>
          <meta name="description" content={post.content.substring(0, 160).replace(/<[^>]*>/g, "")} />

          {/* Open Graph / Facebook */}
          <meta property="og:type" content="article" />
          <meta property="og:url" content={`${window.location.origin}/post/${post.id}`} />
          <meta property="og:title" content={post.title.replace(/<[^>]*>/g, "")} />
          <meta property="og:description" content={post.content.substring(0, 160).replace(/<[^>]*>/g, "")} />
          {post.image_url && <meta property="og:image" content={post.image_url} />}

          {/* Twitter */}
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content={`${window.location.origin}/post/${post.id}`} />
          <meta property="twitter:title" content={post.title.replace(/<[^>]*>/g, "")} />
          <meta property="twitter:description" content={post.content.substring(0, 160).replace(/<[^>]*>/g, "")} />
          {post.image_url && <meta property="twitter:image" content={post.image_url} />}
        </Helmet>
      )}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md overflow-hidden transition-colors duration-300">
          {post.image_url && (
            <img
              src={post.image_url || "/placeholder.svg"}
              alt={post.title}
              className="w-full h-64 sm:h-96 object-cover"
            />
          )}

          <div className="p-6 text-gray-800 dark:text-gray-100 transition-colors duration-300">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4" dangerouslySetInnerHTML={{ __html: post.title }} />

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>

            <div className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-4">
                <button
                  onClick={likePost}
                  disabled={liked}
                  className="flex items-center gap-1"
                  aria-label={`Like ${post.title}`}
                >
                  <Heart
                    size={16}
                    className={liked ? "text-red-500 fill-red-500" : "text-gray-700 dark:text-gray-300"}
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
