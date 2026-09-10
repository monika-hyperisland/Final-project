import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  getCurrentUser,
  logout,
} from "../../services/authService";

import {
  createGroup,
  getGroups,
} from "../../services/groupService";

interface User {
  name: string;
  email: string;
}

interface Group {
  _id: string;
  name: string;
  currency: string;
}

function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState("");

  const [groupName, setGroupName] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDashboard() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
        navigate("/login");
        return;
      }

      try {
        const userGroups = await getGroups();
        setGroups(userGroups);
      } catch {
        setError("Failed to load groups");
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [navigate]);

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch {
      setError("Failed to log out");
    }
  }

  async function handleCreateGroup(
    event: React.SyntheticEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    try {
      const newGroup = await createGroup(
        groupName,
        currency,
      );

      setGroups((currentGroups) => [
        ...currentGroups,
        newGroup,
      ]);

      setGroupName("");
      setCurrency("EUR");
    } catch {
      setError("Failed to create group");
    }
  }

  return (
    <div>
      <h1>Dashboard</h1>

      {user && (
        <p>Welcome, {user.name}</p>
      )}

      <button
      type="button"
      onClick={handleLogout}
    >
      Logout
    </button>

      <h2>Create group</h2>

      <form onSubmit={handleCreateGroup}>
        <label>
          Group name
          <input
            type="text"
            value={groupName}
            onChange={(event) =>
              setGroupName(event.target.value)
            }
            required
          />
        </label>

        <label>
          Currency
          <select
            value={currency}
            onChange={(event) =>
              setCurrency(event.target.value)
            }
          >
            <option value="EUR">EUR</option>
            <option value="SEK">SEK</option>
            <option value="USD">USD</option>
          </select>
        </label>

        <button type="submit">
          Create group
        </button>
      </form>

      <h2>Your groups</h2>

      {error && <p>{error}</p>}

      {isLoading && <p>Loading...</p>}

      {!isLoading && groups.length === 0 &&
      !error && (
        <p>You don't have any groups yet.</p>
      )}

      {groups.map((group) => (
        <div key={group._id}>
          <Link to={`/groups/${group._id}`}>
            {group.name}
          </Link>

          <p>Currency: {group.currency}</p>
        </div>
      ))}
    </div>
  );
}

export default DashboardPage;
