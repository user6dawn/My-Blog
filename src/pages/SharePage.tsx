"use client"

import React, { useEffect } from "react"
import { useParams } from "react-router-dom"
import { supabase } from "../lib/supabase"

// This is a special page that will be used for sharing
// It will be rendered server-side and will have the proper meta tags
const SharePage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return

      try {
        const { data, error } = await supabase
          .from("posts")
          .select("id, title, content, image_url, created_at")
          .eq("id", id)
          .single()

        if (error) throw error
        setPost(data)
      } catch (error) {
        console.error("Error fetching post:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id])

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

  // Ensure image URL is absolute
  const getAbsoluteImageUrl = (imageUrl: string) => {
    if (!imageUrl) return ""
    if (imageUrl.startsWith("http")) return imageUrl
    if (imageUrl.startsWith("//")) return `https:${imageUrl}`
    return `${window.location.origin}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`
  }

  // Redirect to the actual post page after a short delay
  useEffect(() => {
    if (!loading && post) {
      const timer = setTimeout(() => {
        window.location.href = `/post/${id}`
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [loading, post, id])

  // Update document head with meta tags
  useEffect(() => {
    if (post) {
      const plainTitle = getPlainTextFromHTML(post.title)
      const plainDescription = getExcerpt(post.content, 160)
      const imageUrl = getAbsoluteImageUrl(post.image_url || "")

      // Update title
      document.title = plainTitle

      // Create or update meta tags
      const updateMetaTag = (property: string, content: string) => {
        let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement
        if (!meta) {
          meta = document.createElement("meta")
          meta.setAttribute("property", property)
          document.head.appendChild(meta)
        }
        meta.setAttribute("content", content)
      }

      const updateNameMetaTag = (name: string, content: string) => {
        let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement
        if (!meta) {
          meta = document.createElement("meta")
          meta.setAttribute("name", name)
          document.head.appendChild(meta)
        }
        meta.setAttribute("content", content)
      }

      // Update Open Graph tags
      updateMetaTag("og:type", "article")
      updateMetaTag("og:url", `${window.location.origin}/post/${post.id}`)
      updateMetaTag("og:title", plainTitle)
      updateMetaTag("og:description", plainDescription)
      updateMetaTag("og:site_name", "Phinominal African Lives")

      if (imageUrl) {
        updateMetaTag("og:image", imageUrl)
        updateMetaTag("og:image:width", "1200")
        updateMetaTag("og:image:height", "630")
      }

      // Update Twitter tags
      updateNameMetaTag("twitter:card", "summary_large_image")
      updateNameMetaTag("twitter:title", plainTitle)
      updateNameMetaTag("twitter:description", plainDescription)
      if (imageUrl) {
        updateNameMetaTag("twitter:image", imageUrl)
      }

      // Update description
      updateNameMetaTag("description", plainDescription)
    }
  }, [post])

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Loading...
      </div>
    )
  }

  if (!post) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Post not found
      </div>
    )
  }

  const plainTitle = getPlainTextFromHTML(post.title)
  const plainDescription = getExcerpt(post.content, 160)
  const imageUrl = getAbsoluteImageUrl(post.image_url || "")

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {imageUrl && (
        <img
          src={imageUrl || "/placeholder.svg"}
          alt={plainTitle}
          style={{
            width: "100%",
            height: "auto",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        />
      )}
      <h1
        style={{
          fontSize: "24px",
          marginBottom: "10px",
          color: "#333",
        }}
      >
        {plainTitle}
      </h1>
      <p
        style={{
          fontSize: "16px",
          lineHeight: "1.5",
          color: "#666",
          marginBottom: "20px",
        }}
      >
        {plainDescription}
      </p>
      <p
        style={{
          fontSize: "14px",
          color: "#999",
        }}
      >
        Redirecting to full post...
      </p>
    </div>
  )
}

export default SharePage
