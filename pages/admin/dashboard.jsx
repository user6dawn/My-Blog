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

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push("/admin");
      setUser(session?.user);
    };
    checkAuth();
  }, [router]);

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
      
    } catch (error) {
      console.error('Error:', error);
      alert(`Failed to create post: ${error.message}`);
    } finally {
      setUploading(false);
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
              <button 
                className={styles.adButton}>
                <Link href={"/ad"} className={styles.adButton}>add new ad</Link>
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
        </main>

        <footer className={styles.adminFooter}>
          © {new Date().getFullYear()}Onyxe Nnaemeka Blog. All rights reserved.
        </footer>
      </div>
    </div>
  );
}