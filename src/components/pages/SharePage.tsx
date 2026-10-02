"use client"

import React, { useEffect } from "react"
import { useParams } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import "@/styles/styles.css"

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
      updateMetaTag("og:site_name", "The Phinominal African Lives")

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

  const shell = "min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center px-4 py-10"

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <main className={shell}>
        <div className="w-full max-w-xl animate-pulse motion-reduce:animate-none" aria-busy="true">
          <div className="aspect-[1200/630] w-full rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-6 h-8 w-3/4 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-4 h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-2 h-4 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </main>
    )
  }

  /* ---------- Not found ---------- */
  if (!post) {
    return (
      <main className={shell}>
        <div className="w-full max-w-md text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter leading-tight text-zinc-950 dark:text-white">
            Post not found
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            This post may have been removed, or the link may be incorrect.
          </p>
          <a
            href="/"
            className="mt-8 inline-block rounded-full bg-blue-600 px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
          >
            Go to home page
          </a>
        </div>
      </main>
    )
  }

  const plainTitle = getPlainTextFromHTML(post.title)
  const plainDescription = getExcerpt(post.content, 160)
  const imageUrl = getAbsoluteImageUrl(post.image_url || "")

  return (
    <main className={shell}>
      <article className="w-full max-w-xl">
        <p className="mb-6 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
          The Phinominal African Lives
        </p>

        {imageUrl && (
          <img
            src={imageUrl}
            alt={plainTitle}
            className="block h-auto w-full rounded-2xl bg-zinc-100 shadow-sm dark:bg-zinc-900"
          />
        )}

        <h1 className="mt-6 text-3xl md:text-4xl font-extrabold tracking-tighter leading-tight text-zinc-950 dark:text-white">
          {plainTitle}
        </h1>

        {plainDescription && (
          <p className="mt-4 text-lg leading-8 text-zinc-600 dark:text-zinc-400">{plainDescription}</p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <a
            href={`/post/${post.id}`}
            className="rounded-full bg-blue-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
          >
            Read the full post
          </a>

          <p
            className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400"
            role="status"
            aria-live="polite"
          >
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-600 motion-reduce:animate-none dark:border-zinc-700 dark:border-t-blue-500"
              aria-hidden="true"
            />
            Opening the post…
          </p>
        </div>
      </article>
    </main>
  )
}

export default SharePage