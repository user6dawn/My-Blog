import { Metadata, ResolvingMetadata } from 'next'
import { supabase } from '@/lib/supabase'
import PostDetailPage from '@/components/pages/PostDetailPage'

type Props = {
  params: { id: string }
}

// Helper function to remove HTML tags
function stripHtml(html: string) {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
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
  
  // Clean the title and content
  const cleanTitle = post?.title ? post.title.replace(/<[^>]*>/g, '') : 'Post Details'
  const cleanContent = post?.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 160) : 'Read this interesting post'

  return {
    title: cleanTitle,
    description: cleanContent,
    openGraph: {
      title: cleanTitle,
      description: cleanContent,
      images: [
        ...(post?.image_url ? [post.image_url] : []),
        ...previousImages,
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: cleanTitle,
      description: cleanContent,
      images: post?.image_url ? [post.image_url] : [],
    },
  }
}

export default function Page({ params }: Props) {
  return <PostDetailPage />
}