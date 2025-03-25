// pages/index.js
import supabase from '../lib/supabase';

export default function Home({ blogs }) {
  return (
    <div>
      <h1>Welcome to My Blog</h1>
      <div>
        {blogs.map((blog) => (
          <div key={blog.id}>
            <h2>{blog.title}</h2>
            <p>{blog.content}</p>
            <small>{new Date(blog.created_at).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export async function getStaticProps() {
  const { data: blogs, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });

  return {
    props: {
      blogs,
    },
    revalidate: 60, // revalidate every minute
  };
}
