import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../styles/style.module.css";

export default function Contact() {
  const [isNavOpen, setIsNavOpen] = useState(false);

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

  return (
    <div className={styles.bg}>
      <div className={styles.container}>
        {/* Header with Navigation */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerTitleLarge}>The Balance Code Alliance</span>
            <span className={styles.headerSubtitleSmall}>
              Restoring Order. Unlocking Peace. Empowering Lives
            </span>
          </div>

          <button 
            className={styles.navToggle} 
            onClick={toggleNav}
            aria-label={isNavOpen ? "Close menu" : "Open menu"}
            aria-expanded={isNavOpen}
          >
            {isNavOpen ? '✕' : '☰'}
          </button>

          {/* Navigation Menu */}
          {isNavOpen && (
            <>
              <nav className={`${styles.nav} ${isNavOpen ? styles.open : ''}`}>
                <Link href="/" className={styles.navLink} onClick={closeNav}>Home</Link>
                <Link href="/about" className={styles.navLink} onClick={closeNav}>About</Link>
                <Link href="/contact" className={styles.navLink} onClick={closeNav}>Contact</Link>
                <Link href="/gallery" className={styles.navLink} onClick={closeNav}>Gallery</Link>
              </nav>
              <div 
                className={`${styles.navOverlay} ${isNavOpen ? styles.open : ''}`} 
                onClick={closeNav}
                aria-hidden="true"
              />
            </>
          )}
        </header>

        {/* Main Content */}
        <main className={styles.contents}>
          <div style={{ paddingTop: "150px" }}>
            <h1 className={styles.detailTitle}>Get in Touch</h1>
            <div>
              <p>📞 <strong>Phone:</strong> +234 704 222 4426</p>
              <p>📧 <strong>Email:</strong> onyxeblg@gmail.com</p>
              <h3>Follow Us @</h3>
            </div>

            <div className={styles.content}>
              <a className={styles.readmore1} href="https://www.youtube.com/@Onyxenkembu" target="_blank" rel="noopener noreferrer">YouTube</a> |
              <a className={styles.readmore1} href="https://www.tiktok.com/@onyxenkb?_t=ZM-8v6E9odcU5N&_r=1" target="_blank" rel="noopener noreferrer">TikTok</a> |
              <a className={styles.readmore1} href="https://www.facebook.com/share/1FyC5cQQEx/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">Facebook</a>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className={styles.footer}>
          © {new Date().getFullYear()} Onyxe Nnaemeka's Blog. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
