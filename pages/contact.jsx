import Link from "next/link";
import styles from "../styles/style.module.css";

export default function Contact() {
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
        <h1 className={styles.content}>Get in Touch</h1>

        <p className={styles.content}>📞 <strong>Phone:</strong> +234 803 335 6633</p>
        <p className={styles.content}>📧 <strong>Email:</strong> contact@myblog.com</p>
        

        <h3 className={styles.content}>Follow Us</h3>
        <div className={styles.content}>
          <a className={styles.readmore} href="https://www.instagram.com/healthydaddylife?igsh=YmYyZ29mNmU4bjVz" target="_blank" rel="noopener noreferrer">Instagram</a> |
          <a className={styles.readmore} href="https://www.tiktok.com/@onyxenkb?_t=ZM-8v6E9odcU5N&_r=1" target="_blank" rel="noopener noreferrer"> tiktok</a> |
          <a className={styles.readmore} href="https://web.facebook.com/Zukydman" target="_blank" rel="noopener noreferrer"> Facebook</a>
        </div>
      </div>

      {/* ✅ Footer */}
      <footer className={styles.footer}>
        © {new Date().getFullYear()} My Blog. All rights reserved.
      </footer>
    </div>
  );
}
