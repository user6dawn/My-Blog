import Link from "next/link";
import styles from "../styles/style.module.css";

export default function Contact() {
  return (
    <div>
      {/* ✅ Header */}
      <header className={styles.header} href="./">
      The Balance Code Alliance
        <nav className={styles.nav}>
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <p className={styles.header1}>Restoring Order.  Unlocking Peace.  Empowering Lives</p>
        </nav>
        </header>
        

      <div className={styles.contents}>
        <br />  <br />  <br /> <br /> <br /> <br /> <br />
      <h1 className={styles.detailTitle}>Get in Touch</h1>
        <div >
        
        <p > 📞 <strong>Phone:</strong> +234 803 335 6633</p>
          <p > 📧 <strong>Email:</strong> onyxeblg@gmail.com <br /><h3 >Follow Us</h3></p>
          
        </div>

        <div className={styles.content}>
          <a className={styles.readmore1} href="https://www.instagram.com/onyxemark?igsh=MXYya3Z3ZGQ5bjMxbg%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer"> Instagram </a> |
          <a className={styles.readmore1} href="https://www.tiktok.com/@onyxenkb?_t=ZM-8v6E9odcU5N&_r=1" target="_blank" rel="noopener noreferrer"> tiktok </a> |
          <a className={styles.readmore1} href="https://web.facebook.com/Zukydman" target="_blank" rel="noopener noreferrer"> Facebook </a>
        </div>
      </div>

      {/* ✅ Footer */}
      <footer className={styles.footer}>
        © {new Date().getFullYear()} All right reserved. Onyxe Nnaemeka Blog.
      </footer>
    </div>
  );
}
