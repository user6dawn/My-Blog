"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import Layout from "@/components/Layout"
import PostCard from "@/components/PostCard"
import AdDisplay from "@/components/AdDisplay"
import type { Post, Ad } from "@/types"
import "@/styles/styles.css"

const PageHeader: React.FC<{ showSubtitle?: boolean }> = ({ showSubtitle = true }) => (
  <header className="mb-10 md:mb-12">
    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.95] text-zinc-950 dark:text-white">
      Recent posts
    </h1>
    {showSubtitle && (
      <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">The latest posts, newest first.</p>
    )}
  </header>
)

const FeedSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-hidden="true">
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className="rounded-2xl bg-zinc-100 dark:bg-zinc-900 p-4 animate-pulse">
        <div className="h-48 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-4 h-5 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-3 h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-2 h-4 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
    ))}
  </div>
)

const SidebarSkeleton: React.FC = () => (
  <div className="rounded-2xl bg-zinc-100 dark:bg-zinc-900 p-4" aria-hidden="true">
    <div className="h-64 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
  </div>
)

const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({})
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by ensuring component is mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select("id, title, content, image_url, likes, created_at")
        .order("created_at", { ascending: false })

      if (postsError) throw postsError

      // Fetch ads
      const { data: adsData, error: adsError } = await supabase
        .from("ads")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (adsError) throw adsError

      // Fetch comments count
      const { data: commentData, error: commentError } = await supabase.from("comments").select("post_id")

      if (commentError) throw commentError

      // Count comments per post
      const commentMap: Record<string, number> = {}
      commentData?.forEach(({ post_id }) => {
        commentMap[post_id] = (commentMap[post_id] || 0) + 1
      })

      // Merge comment count into each post
      const postsWithComments = postsData?.map((post) => ({
        ...post,
        comment_count: commentMap[post.id] || 0,
      }))

      setPosts(postsWithComments || [])
      setAds(adsData || [])
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      fetchData()
    }
  }, [mounted, fetchData])

  useEffect(() => {
    // Only access localStorage after component is mounted to prevent hydration mismatch
    if (mounted) {
      try {
        const storedLikes = JSON.parse(localStorage.getItem("likedPosts") || "{}")
        setLikedPosts(storedLikes)
      } catch (error) {
        console.error("Error parsing liked posts from localStorage:", error)
        setLikedPosts({})
      }
    }
  }, [mounted])

  // Pick ads once per data load, so they don't change every time a post is liked
  const sidebarAd = useMemo(() => {
    const pool = ads.filter((ad) => ad?.position === "sidebar")
    return pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null
  }, [ads])

  const betweenPostAds = useMemo(() => {
    const pool = ads.filter((ad) => ad?.position === "between_posts")
    const slots = Math.floor(posts.length / 4)
    return Array.from({ length: slots }, () =>
      pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null,
    )
  }, [ads, posts.length])

  // Prevent rendering until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-10 md:py-16">
          <div className="flex flex-col md:flex-row md:gap-10">
            <div className="w-full md:w-2/3">
              <PageHeader showSubtitle={false} />
              <FeedSkeleton />
            </div>
            <div className="hidden md:block md:w-1/3">
              <div className="sticky top-24">
                <SidebarSkeleton />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 md:py-16">
        <div className="flex flex-col md:flex-row md:gap-10">
          <div className="w-full md:w-2/3">
            <PageHeader showSubtitle={!loading && !error && posts.length > 0} />

            {loading ? (
              <FeedSkeleton />
            ) : error ? (
              <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 dark:border-red-900/60 dark:bg-red-950/40"
              >
                <p className="text-lg font-semibold text-red-800 dark:text-red-300">The posts didn&apos;t load.</p>
                <p className="mt-1 text-sm text-red-700/90 dark:text-red-300/80">
                  {error}. Check your connection and try again.
                </p>
                <button
                  type="button"
                  onClick={fetchData}
                  className="mt-5 rounded-full bg-red-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
                >
                  Try again
                </button>
              </div>
            ) : !posts.length ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 py-20 text-center dark:border-zinc-700">
                <p className="text-xl font-semibold text-zinc-900 dark:text-white">No posts yet</p>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">New posts will show up here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.flatMap((post, index) => {
                  const elements: React.ReactNode[] = []

                  elements.push(
                    <PostCard
                      key={`post-${post.id}`}
                      post={post}
                      likedPosts={likedPosts}
                      setLikedPosts={setLikedPosts}
                    />,
                  )

                  if ((index + 1) % 4 === 0 && index < posts.length - 1) {
                    const slot = (index + 1) / 4 - 1
                    elements.push(
                      <div key={`ad-between-${index}`} className="col-span-1 md:col-span-2 my-2">
                        <AdDisplay ad={betweenPostAds[slot] ?? null} position="between_posts" />
                      </div>,
                    )
                  }

                  return elements
                })}
              </div>
            )}
          </div>

          <aside className="w-full md:w-1/3 mt-10 md:mt-0" aria-label="Sponsored">
            <div className="md:sticky md:top-24">
              <AdDisplay ad={sidebarAd} position="sidebar" />
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  )
}

export default HomePage