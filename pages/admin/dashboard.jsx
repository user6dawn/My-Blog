import { supabase } from "../../lib/supabase";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "./styles/style.module.css";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

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

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editPostId, setEditPostId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
  
      if (!session || error) {
        // Try to refresh token
        const { data: refreshedSession, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError || !refreshedSession.session) {
          router.push("/admin"); // redirect to login if refresh fails
          return;
        }
        setUser(refreshedSession.session.user);
      } else {
        setUser(session.user);
      }
    };
  
    checkAuth();
  }, []);
  

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

  const handleImageChange = (e, isEdit = false) => {
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
      if (isEdit) {
        setEditImage(file);
        setEditImagePreview(URL.createObjectURL(file));
      } else {
        setImage(file);
        setImagePreview(URL.createObjectURL(file));
      }
    }
  };
  

  const uploadImage = async (file) => {
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
      fetchPosts();
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
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin');
  };

  const openEditModal = (post) => {
    setEditPostId(post.id);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditImagePreview(post.image_url || null);
    setEditImage(null);
    setEditModalOpen(true);
  };

  const updatePost = async () => {
    try {
      let imageUrl = editImagePreview;
      if (editImage) {
        imageUrl = await uploadImage(editImage);
      }

      const { error } = await supabase
        .from('posts')
        .update({
          title: editTitle,
          content: editContent,
          image_url: imageUrl
        })
        .eq('id', editPostId);

      if (error) throw error;

      alert("Post updated successfully");
      setEditModalOpen(false);
      fetchPosts();
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Failed to update post");
    }
  };
  // Dynamically import ReactQuill to avoid SSR issues in Next.js
  const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      [{ size: [] }],
      ["link"],
      ["clean"]
    ]
  };

  const quillFormats = [
    "header", "bold", "italic", "underline", "size", "link"
  ];

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminWrapper}>
        {/* Header */}
        <header className={styles.adminHeader}>
          <div className={styles.headerLeft}>
            <span className={styles.headerTitleLarge}>The Balance Code Alliance</span>
            <span className={styles.headerSubtitleSmall}>Restoring Order. Unlocking Peace. Empowering Lives</span>
          </div>
          <button className={styles.navToggle} onClick={toggleNav}>
            {isNavOpen ? '✕' : '☰'}
          </button>
          {isNavOpen && (
            <>
              <nav className={`${styles.nav} ${isNavOpen ? styles.open : ''}`}>
                <Link href="/" className={styles.navLink} onClick={closeNav}>Home</Link>
                <Link href="/about" className={styles.navLink} onClick={closeNav}>About</Link>
                <Link href="/contact" className={styles.navLink} onClick={closeNav}>Contact</Link>
              </nav>
              <div className={styles.navOverlay} onClick={closeNav} />
            </>
          )}
        </header>

        {/* Main */}
        <main className={styles.adminMain}>
          <div className={styles.dashboardCard}>
            <div className={styles.dashboardHeader}>
              <h1>Create New Post</h1>
              <button className={styles.adButton}>
                <Link href={"./ads"} className={styles.submitButton}>Create New Ad</Link>
              </button>
              <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
            </div>

            <form onSubmit={handleSubmit} className={styles.postForm}>
              <input
                type="text"
                placeholder="Post Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={styles.formInput}
              />
              <ReactQuill
                value={content}
                onChange={setContent}
                modules={quillModules}
                formats={quillFormats}
                className={styles.formTextarea}
              />

              <label className={styles.fileUploadLabel}>
                {image ? 'Change Image' : 'Select Image'}
                <input type="file" onChange={handleImageChange} className={styles.fileInput} />
              </label>
              {imagePreview && <img src={imagePreview} alt="Preview" className={styles.imagePreview} />}
              <button type="submit" disabled={uploading} className={styles.submitButton}>
                {uploading ? "Publishing..." : "Publish Post"}
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
                        <button onClick={() => openEditModal(post)} className={styles.editButton}>Edit</button>
                        <button onClick={() => deletePost(post.id)} className={styles.deleteButton}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>

        {/* Edit Modal */}
        {editModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h2>Edit Post</h2>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className={styles.formInput}
              />
              <ReactQuill
                value={editContent}
                onChange={setEditContent}
                modules={quillModules}
                formats={quillFormats}
                className={styles.formTextarea}
              />

              <label className={styles.fileUploadLabel}>
                {editImage ? 'Change Image' : 'Select Image'}
                <input type="file" onChange={(e) => handleImageChange(e, true)} className={styles.fileInput} />
              </label>
              {editImagePreview && <img src={editImagePreview} alt="Edit Preview" className={styles.imagePreview} />}
              <div className={styles.modalActions}>
                <button onClick={updatePost} className={styles.submitButton}>Save Changes</button>
                <button onClick={() => setEditModalOpen(false)} className={styles.deleteButton}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className={styles.adminFooter}>
          Onyxe Nnaemeka Blog. All rights reserved. © {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
