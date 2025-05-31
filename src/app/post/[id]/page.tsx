'use client'

import { Suspense } from 'react'
import PostDetailPage from '@/components/pages/PostDetailPage'
import Loading from '@/components/Loading'

export default function Post() {
  return (
    <Suspense fallback={<Loading />}>
      <PostDetailPage />
    </Suspense>
  )
}