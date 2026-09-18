import {
  useState,
  type SyntheticEvent,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../services/authService";
import styles from "./Auth.module.css";
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(
    event: SyntheticEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    try {
      await login(email, password);

      navigate("/dashboard");
    } catch {
      setError("Invalid email or password");
    }
  }

  return (
    <div className={styles.page}>
      <div className={`${styles.brandRow} ${styles.pageBrand}`}>
        <div className={styles.logoMark}>S</div>
        <div>
          <p className={styles.brandText}>Smart Expense Splitter</p>
          <p className={styles.appName}>SplitFlow</p>
        </div>
      </div>

     <div className={styles.card}>
      
      <h1 className={styles.title}>Login</h1>
      <p className={styles.subtitle}>Welcome back. Track and settle group expenses faster.</p>

      <form 
        className={styles.form} 
        onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
          />
        </label>

        {error && (
         <p className={styles.error}>{error}</p>
        )}

        <button type="submit">
          Login
        </button>
      </form>

      <p className={styles.switchText}>
        Don't have an account?{" "}
        <Link
          className={styles.link}
          to="/register"
        >
          Register
        </Link>
      </p>
    </div>
  </div>
);}

export default LoginPage;