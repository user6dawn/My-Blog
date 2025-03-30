import Link from "next/link";
import styles from "../styles/style.module.css";

export default function About() {
  return (
    <div>
      {/* ✅ Header */}
      <header className={styles.header}>
      The Balance Code Alliance
              <nav className={styles.nav}>
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        </header>

      <div className={styles.container}>
        <h1 className={styles.contents}>About Us</h1>

        <div className={styles.contents}>
            <p>Welcome to <strong> The Balance Code Alliance
            </strong> a world filled with chaos, confusion, and broken systems, The Balance Code Alliance is a movement dedicated to restoring harmony, order, and purpose through the wisdom of Natural Law. <br />  <br />

We believe that true peace, strength, and prosperity come when we align our spiritual, physical, and relational lives with the divine structure that governs all things. By understanding and applying these timeless principles, you can experience:
<br />
✅ Healing from emotional, spiritual, and relational struggles <br />
✅ Clarity in leadership, purpose, and decision-making <br />
✅ Stronger, more fulfilling relationships built on divine order <br />
✅ Inner peace and resilience, even in a chaotic world <br />
✅ A prosperous, balanced life rooted in truth <br /> <br />

Our mission is to help you unlock the keys to a stable, happy, and prosperous life by teaching the forgotten laws that guide everything—from personal well-being to family, community, and leadership.
<br />
Through practical lifestyle principles, deep spiritual wisdom, and time-tested traditions, we provide the tools to break free from disorder and step into the life you were designed to live.
<br />
This is more than just a movement—it is a return to the foundation of life itself.

🔥 Are you ready to rediscover balance, purpose, and prosperity?
</p>

        </div >

        <p className={styles.contents}>joint the movement today. <Link href="/contact" className={styles.contents}>Click me!</Link></p>
      </div>

      {/* ✅ Footer */}
      <footer className={styles.footer}>
        © {new Date().getFullYear()} All right reserved. Onyxe Nnaemeka Blog.
      </footer>
    </div>
  );
}
