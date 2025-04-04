import { supabase } from "../../lib/supabase";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "./styles/style.module.css";

export default function Dashboard() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push("/admin");
      setUser(session?.user);
    };
    checkAuth();
    fetchPosts();
  }, [router]);

  const fetchPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const toggleNav = () => setIsNavOpen(!isNavOpen);
  const closeNav = () => setIsNavOpen(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be smaller than 5MB');
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      alert("Title and content are required!");
      return;
    }

    setUploading(true);

    try {
      let imageUrl = null;
      if (image) {
        imageUrl = await uploadImage(image);
      }

      const { data, error } = await supabase.from('posts').insert([{
        title,
        content,
        image_url: imageUrl,
        likes: 0,
        created_at: new Date().toISOString()
      }]).select();

      if (error) throw error;

      alert('Post created successfully!');
      setTitle('');
      setContent('');
      setImage(null);
      setImagePreview(null);
      fetchPosts(); // Refresh the posts list
      
    } catch (error) {
      console.error('Error:', error);
      alert(`Failed to create post: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const deletePost = async (postId) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      alert('Post deleted successfully');
      fetchPosts(); // Refresh the posts list
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin');
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminWrapper}>
        <header className={styles.adminHeader}>
          <div className={styles.headerLeft}>
            <span className={styles.headerTitleLarge}>The Balance Code Alliance</span>
            <span className={styles.headerSubtitleSmall}>Restoring Order.  Unlocking Peace.  Empowering Lives</span>
          </div>

          <button 
            className={styles.navToggle} 
            onClick={toggleNav}
            aria-label={isNavOpen ? "Close menu" : "Open menu"}
            aria-expanded={isNavOpen}
          >
            {isNavOpen ? '✕' : '☰'}
          </button>

          {isNavOpen && (
            <>
              <nav className={`${styles.nav} ${isNavOpen ? styles.open : ''}`}>
                <Link href="/" onClick={closeNav} className={styles.navLink}>Home</Link>
                <Link href="/about" onClick={closeNav} className={styles.navLink}>About</Link>
                <Link href="/contact" onClick={closeNav} className={styles.navLink}>Contact</Link>
              </nav>
              <div 
                className={`${styles.navOverlay} ${isNavOpen ? styles.open : ''}`} 
                onClick={closeNav}
                aria-hidden="true"
              />
            </>
          )}
        </header>

        <main className={styles.adminMain}>
          <div className={styles.dashboardCard}>
            <div className={styles.dashboardHeader}>
              <h1>Create New Post</h1>
              <button className={styles.adButton}>
                <Link href={"./ads"} className={styles.adButton}>Add New Ad</Link>
              </button>
              <button 
                onClick={handleLogout}
                className={styles.logoutButton}
              >
                Logout
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.postForm}>
              <input
                className={styles.formInput}
                type="text"
                placeholder="Post Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              
              <textarea
                className={styles.formTextarea}
                placeholder="Post Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={6}
              />
              
              <div className={styles.fileUploadWrapper}>
                <label className={styles.fileUploadLabel}>
                  {image ? 'Change Image' : 'Select Image'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={styles.fileInput}
                  />
                </label>
                {imagePreview && (
                  <div className={styles.imagePreview}>
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
              </div>
              
              <button
                type="submit"
                className={styles.submitButton}
                disabled={uploading}
              >
                {uploading ? 'Publishing...' : 'Publish Post'}
              </button>
            </form>
          </div>

          {/* Posts Table */}
          <div className={styles.postsTableContainer}>
            <h2>Manage Existing Posts</h2>
            {isLoadingPosts ? (
              <p>Loading posts...</p>
            ) : posts.length === 0 ? (
              <p>No posts available.</p>
            ) : (
              <table className={styles.postsTable}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Created At</th>
                    <th>Likes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id}>
                      <td>{post.title}</td>
                      <td>{new Date(post.created_at).toLocaleDateString()}</td>
                      <td>{post.likes}</td>
                      <td>
                        <button
                          onClick={() => deletePost(post.id)}
                          className={styles.deleteButton}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>

        <footer className={styles.adminFooter}>
        Onyxe Nnaemeka Blog. All rights reserved.© {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}