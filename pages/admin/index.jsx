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

    router.push("/admin/dashboard");
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h2 className={styles.loginTitle}>Admin Login</h2>

        {error && <p className={styles.errorMessage}>{error}</p>}

        <form onSubmit={handleLogin} className={styles.loginForm}>
          <input
            className={styles.loginInput}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className={styles.loginInput}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button 
            className={styles.loginButton} 
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}