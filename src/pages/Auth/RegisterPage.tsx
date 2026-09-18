import {
  useState,
  type SyntheticEvent,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { register } from "../../services/authService";
import styles from "./Auth.module.css";

function RegisterPage() {
  const [name, setName] = useState("");
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
      await register(
        name,
        email,
        password,
      );

      navigate("/login");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Registration failed");
      }
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
       <h1 className={styles.title}>Register</h1>
      <p className={styles.subtitle}>Create your account and start splitting bills with your crew.</p>

      <form 
      className={styles.form}
      onSubmit={handleSubmit}>
        <label>
          Name
          <input
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            required
          />
        </label>

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
          Create account
        </button>
      </form>

      <p className={styles.switchText}>
        Already have an account?{" "}
        <Link
          className={styles.link}
          to="/login"
        >
          Login
        </Link>
      </p>
    </div>
  </div>
);
}
export default RegisterPage;