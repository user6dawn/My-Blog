import Link from "next/link";
import styles from "../styles/style.module.css";

export default function About() {
  return (
    <div>
      {/* ✅ Header */}
      <header className={styles.header}>
      Healthy Daddy Living
              <nav className={styles.nav}>
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        </header>

      <div className={styles.container}>
        <h1 className={styles.content}>About Us</h1>

        <div className={styles.content}>
            <p>Welcome to <strong>My Blog</strong>, your go-to source for insightful articles and stories.</p>
            <p>Our mission is to create a community of readers who share ideas and experiences.</p>
        </div >

        <p className={styles.content}>Have questions? <Link href="/contact" className={styles.readmore}> Click me</Link>.</p>
      </div>

      {/* ✅ Footer */}
      <footer className={styles.footer}>
        © {new Date().getFullYear()} Onyeze Emeka's Blog. All rights reserved.
      </footer>
    </div>
  );
}
