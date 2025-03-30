import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabase";
import styles from "./styles/style.module.css";


export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Handle User Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError("Invalid email or password");
      return;
    }

    // ✅ Redirect to the dashboard if login is successful
    router.push("/admin/dashboard");
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className={styles.detailsTitle}>Admin Login</h2>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleLogin} className={styles.enteryField}>
          <input
            className={styles.email}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className={styles.password}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className={styles.loginButton} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
