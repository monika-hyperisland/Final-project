import { useEffect,
  useState,
  type SyntheticEvent } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  addMember,
  getGroup,
  removeMember,
} from "../../services/groupService";
interface Member {
  _id: string;
  name: string;
  email: string;
}

interface Group {
  _id: string;
  name: string;
  currency: string;
  members: Member[];
}

function GroupPage() {
  const { id } = useParams();

  const [group, setGroup] = useState<Group | null>(null);
  const [error, setError] = useState("");

  const [memberEmail, setMemberEmail] = useState("");
  const [memberError, setMemberError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    async function loadGroup() {
      if (!id) {
        setError("Group ID is missing");
        return;
      }

      try {
        const groupData = await getGroup(id);
        setGroup(groupData);
      } catch {
        setError("Failed to load group");
      }
    }

    loadGroup();
  }, [id]);
  
  async function handleAddMember(
  event: SyntheticEvent<HTMLFormElement>,
) {
  event.preventDefault();

  if (!id) {
    return;
  }

  setMemberError("");

  try {
    await addMember(id, memberEmail);

    const updatedGroup = await getGroup(id);
    setGroup(updatedGroup);

    setMemberEmail("");

  } catch (error) {
    if (error instanceof Error) {
      setMemberError(error.message);
    } else {
      setMemberError("Failed to add member");
    }
  }
}

  async function handleRemoveMember(
  memberId: string,
) {
  if (!id) {
    return;
  }

  setMemberError("");

  try {
    await removeMember(id, memberId);

    const updatedGroup = await getGroup(id);
    setGroup(updatedGroup);
  } catch (error) {
    if (error instanceof Error) {
      setMemberError(error.message);
    } else {
      setMemberError("Failed to remove member");
    }
  }
}

  if (error) {
    return (
      <div>
        <p>{error}</p>

        <button onClick={() => navigate("/dashboard")}>
          Back to dashboard
        </button>
      </div>
    );
  }

  if (!group) {
    return <p>Loading group...</p>;
  }

  return (
    <div>
      <Link to="/dashboard">
        ← Back to dashboard
      </Link>

      <h1>{group.name}</h1>

      <p>Currency: {group.currency}</p>

      <h2>Members</h2>

      {group.members.map((member) => (
        <div key={member._id}>
          <p>{member.name}</p>
          <p>{member.email}</p>

          <button
      type="button"
      onClick={() =>
        handleRemoveMember(member._id)
      }
    >
      Remove
    </button>
        </div>
      ))}   
       <h3>Add member</h3>

<form onSubmit={handleAddMember}>
  <label>
    Email
    <input
      type="email"
      value={memberEmail}
      onChange={(event) =>
        setMemberEmail(event.target.value)
      }
      required
    />
  </label>

  <button type="submit">
    Add member
  </button>
</form>

{memberError && <p>{memberError}</p>}
      </div>
        );
      }

export default GroupPage;