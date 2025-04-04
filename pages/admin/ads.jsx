import { useState, useEffect } from 'react';
import { supabase } from "../../lib/supabase";
import Link from 'next/link';
import styles from "./styles/style.module.css";
import { useRouter } from "next/router";

export default function AdsManager() {
  const router = useRouter();
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    link_url: '',
    position: 'between_posts',
    is_active: true
  });

  // Ads list state
  const [ads, setAds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isNavOpen, setIsNavOpen] = useState(false);

  // Fetch existing ads
  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAds(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const closeNav = () => {
    setIsNavOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isNavOpen && !event.target.closest(`.${styles.nav}`) && 
          !event.target.closest(`.${styles.navToggle}`)) {
        closeNav();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNavOpen]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate required fields
      if (!formData.title || !formData.content || !formData.link_url) {
        throw new Error('Title, content, and link URL are required');
      }

      // Insert the new ad
      const { data, error } = await supabase
        .from('ads')
        .insert([formData])
        .select();

      if (error) throw error;

      // Update local state
      setAds([data[0], ...ads]);
      setSuccess('Ad created successfully!');
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        image_url: '',
        link_url: '',
        position: 'between_posts',
        is_active: true
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle ad status (active/inactive)
  const toggleAdStatus = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('ads')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchAds(); // Refresh the list
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete an ad
  const deleteAd = async (id) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;
    
    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAds(ads.filter(ad => ad.id !== id));
      setSuccess('Ad deleted successfully');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminWrapper}>
        <header className={styles.adminHeader}>
          <div className={styles.headerLeft}>
            <span className={styles.headerTitleLarge}>The Balance Code Alliance</span>
            <span className={styles.headerSubtitleSmall}>Restoring Order. Unlocking Peace. Empowering Lives</span>
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
          <h1>Ads Management</h1>
          
          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}

          <div className={styles.adminGrid}>
            {/* Create Ad Form */}
            <div className={styles.adminForm}>
              <h2>Create New Ad</h2>
              <form onSubmit={handleSubmit}>
                <label>
                  Title: *
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </label>
                
                <label>
                  Content: *
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    required
                  />
                </label>
                
                <label>
                  Image URL:
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </label>
                
                <label>
                  Link URL: *
                  <input
                    type="url"
                    name="link_url"
                    value={formData.link_url}
                    onChange={handleChange}
                    required
                    placeholder="https://example.com"
                  />
                </label>
                
                <label>
                  Position:
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                  >
                    <option value="between_posts">Between Posts</option>
                    {/* <option value="sidebar">Sidebar</option>
                    <option value="header">Header</option>
                    <option value="footer">Footer</option> */}
                  </select>
                </label>
                
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                  Active
                </label>
                
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className={styles.submitButton}
                >
                  {isLoading ? 'Creating...' : 'Create Ad'}
                </button>
                <button className={styles.submitButton}>
                <Link href="/admin/dashboard" className={styles.backToAdmin}>
            ← Back to Admin Dashboard
          </Link>
                </button>
              </form>
            </div>
            
            {/* Existing Ads List */}
            <div className={styles.adminList}>
              <h2>Existing Ads ({ads.length})</h2>
              
              {isLoading && !ads.length ? (
                <p>Loading ads...</p>
              ) : ads.length === 0 ? (
                <p>No ads created yet</p>
              ) : (
                <div className={styles.adsTable}>
                  <div className={styles.tableHeader}>
                    <span>Title</span>
                    <span>Position</span>
                    <span>Status</span>
                    <span>Actions</span>
                  </div>
                  
                  {ads.map(ad => (
                    <div key={ad.id} className={styles.tableRow}>
                      <span>{ad.title}</span>
                      <span>{ad.position.replace('_', ' ')}</span>
                      <span>
                        <button 
                          onClick={() => toggleAdStatus(ad.id, ad.is_active)}
                          className={ad.is_active ? styles.active : styles.inactive}
                        >
                          {ad.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </span>
                      <span>
                        <button 
                          onClick={() => deleteAd(ad.id)}
                          className={styles.deleteButton}
                        >
                          Delete
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          

        </main>

        <footer className={styles.adminFooter}>
        Onyxe Nnaemeka Blog. All rights reserved.© {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}