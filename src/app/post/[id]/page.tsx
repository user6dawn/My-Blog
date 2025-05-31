import { Metadata, ResolvingMetadata } from 'next'
import { supabase } from '@/lib/supabase'
import PostDetailPage from '@/components/pages/PostDetailPage'

type Props = {
  params: { id: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id

  const { data: post } = await supabase
    .from('posts')
    .select('title, content, image_url')
    .eq('id', id)
    .single()

  const previousImages = (await parent).openGraph?.images || []

  return {
    title: post?.title || 'Post Details',
    description: post?.content?.substring(0, 160) || 'Read this interesting post',
    openGraph: {
      title: post?.title || 'Post Details',
      description: post?.content?.substring(0, 160) || 'Read this interesting post',
      images: [
        ...(post?.image_url ? [post.image_url] : []),
        ...previousImages,
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post?.title || 'Post Details',
      description: post?.content?.substring(0, 160) || 'Read this interesting post',
      images: post?.image_url ? [post.image_url] : [],
    },
  }
}

export default function Page({ params }: Props) {
  return <PostDetailPage />
}