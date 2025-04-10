import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../styles/style.module.css";

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

          {/* Navigation Menu - Only visible when isNavOpen is true */}
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

        <main className={styles.container}> <br /> <br /> <br /> <br /> <br />
          <h1 className={styles.contents}>About Us</h1>
          <div className={styles.contents}>
            <p>
              Welcome to <strong>The Balance Code Alliance</strong>. In a world filled with chaos, confusion, and broken systems, The Balance Code Alliance is a movement dedicated to restoring harmony, order, and purpose through the wisdom of Natural Law. <br /><br />

              We believe that true peace, strength, and prosperity come when we align our spiritual, physical, and relational lives with the divine structure that governs all things. By understanding and applying these timeless principles, you can experience:
              <br />
              ✅ Healing from emotional, spiritual, and relational struggles <br />
              ✅ Clarity in leadership, purpose, and decision-making <br />
              ✅ Stronger, more fulfilling relationships built on divine order <br />
              ✅ Inner peace and resilience, even in a chaotic world <br />
              ✅ A prosperous, balanced life rooted in truth <br /><br />

              Our mission is to help you unlock the keys to a stable, happy, and prosperous life by teaching the forgotten laws that guide everything—from personal well-being to family, community, and leadership.
              <br />
              Through practical lifestyle principles, deep spiritual wisdom, and time-tested traditions, we provide the tools to break free from disorder and step into the life you were designed to live.
              <br />
              This is more than just a movement—it is a return to the foundation of life itself.

              <br /><br />
              🔥 Are you ready to rediscover balance, purpose, and prosperity?
            </p>
          </div>

          <p className={styles.contents}>
            Join the movement today. <Link href="/contact" className={styles.readmore1}><h2>Click me!</h2></Link> <br />
          </p>
        </main>

        <footer className={styles.footer}>
        Onyxe Nnaemeka Blog. All rights reserved.© {new Date().getFullYear()}
                </footer>
      </div>
    </div>
  );
}