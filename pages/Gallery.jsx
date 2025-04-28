import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../styles/style.module.css";
import Head from 'next/head';

export default function About() {
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
    <>
      <Head>
        <title>The Balance Code Alliance</title>
        <meta name="description" content="Restoring Order. Unlocking Peace. Empowering Lives. Explore insightful blogs and articles by Onyxe Nnaemeka." />
        <meta name="robots" content="index, follow" />
        <meta name="google-site-verification" content="QQ-oix7EJcaWi6X6perTvyv7J8JX9PVnQ_jI5GTBWBY" />
        <link rel="icon" type="image/png" href="/favicon-32x32.png" />
      </Head>

      <div className={styles.bg}>
        <div className={styles.container}>
          {/* Header with Navigation */}
          <header className={styles.header}>
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

            {/* Navigation Menu */}
            {isNavOpen && (
              <>
                <nav className={`${styles.nav} ${isNavOpen ? styles.open : ''}`}>
                <Link href="/" className={styles.navLink} onClick={closeNav}>Home</Link>
                  <Link href="/about" className={styles.navLink} onClick={closeNav}>About</Link>
                  <Link href="/contact" className={styles.navLink} onClick={closeNav}>Contact</Link>
                  <Link href="/Gallery" className={styles.navLink} onClick={closeNav}>Gallery</Link>
                </nav>
                <div 
                  className={`${styles.navOverlay} ${isNavOpen ? styles.open : ''}`} 
                  onClick={closeNav}
                  aria-hidden="true"
                />
              </>
            )}
          </header>

          {/* Page Content */}
          <div style={{ paddingTop: "8rem", textAlign: "center" }}>
            <h1>Coming Soon...</h1>
          </div>

          {/* Footer */}
          <footer className={styles.footer}>
            © {new Date().getFullYear()} Onyxe Nnaemeka's Blog. All rights reserved.
          </footer>
        </div>
      </div>
    </>
  );
}
