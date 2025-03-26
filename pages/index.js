import { supabase } from "../lib/supabase";
import Link from "next/link";

export async function getServerSideProps() {
  try {
    const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false });

    if (error) throw error;

    return { props: { posts: data || [] } };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return { props: { posts: [] } }; 
  }
}

export default function Home({ posts }) {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Blog Posts</h1>
      {posts.length === 0 ? (
        <p>No posts available.</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="mb-4 border-b pb-4">
            <h2 className="text-2xl font-semibold">{post.title}</h2>
            <p>{post.content.slice(0, 100)}...</p>
            <Link href={`/post/${post.id}`} className="text-blue-500">Read More</Link>
          </div>
        ))
      )}
    </div>
  );
}
