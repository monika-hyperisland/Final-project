import { useEffect,
  useState,
  type SyntheticEvent 
} from "react";

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

import { 
  createExpense,
   getExpenses, } from "../../services/expenseService";

import {
  getBalances,
  getSettlements,
} from "../../services/balanceService";

import styles from "./GroupPage.module.css";
interface Member {
  _id: string;
  name: string;
  email: string;
}

interface Expense {
  _id: string;
  description: string;
  amountCents: number;
  paidBy: string;
}

interface Balance {
  userId: string;
  balanceCents: number;
}

interface Settlement {
  from: string;
  to: string;
  amountCents: number;
}
interface Group {
  _id: string;
  name: string;
  currency: string;
  createdBy: string;
  members: Member[];
}

function GroupPage() {
  const { id } = useParams();

const [group, setGroup] = useState<Group | null>(null);
const [error, setError] = useState("");
const [isLoadingGroup, setIsLoadingGroup] = useState(true);

const [memberEmail, setMemberEmail] = useState("");
const [memberError, setMemberError] = useState("");

const [expenses, setExpenses] = useState<Expense[]>([]);
const [expensesError, setExpensesError] = useState("");

const [expenseDescription, setExpenseDescription] = useState("");
const [expenseAmount, setExpenseAmount] = useState("");
const [paidBy, setPaidBy] = useState("");
const [expenseFormError, setExpenseFormError] = useState("");

const [balances, setBalances] = useState<Balance[]>([]);
const [settlements, setSettlements] = useState<Settlement[]>([]);
const [balanceError, setBalanceError] = useState("");

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
      } finally {
        setIsLoadingGroup(false);
      }
    }

    loadGroup();
  }, [id]);
  
  useEffect(() => {
  async function loadExpenses() {
    if (!id) {
      return;
    }

    try {
      const expenseData = await getExpenses(id);
      setExpenses(expenseData);
    } catch {
      setExpensesError("Failed to load expenses");
    }
  }

  loadExpenses();
}, [id]);

useEffect(() => {
  async function loadBalances() {
    if (!id) {
      return;
    }

    try {
      const balanceData = await getBalances(id);
      const settlementData = await getSettlements(id);

      setBalances(balanceData);
      setSettlements(settlementData);
    } catch {
      setBalanceError(
        "Failed to load balances and settlements",
      );
    }
  }

  loadBalances();
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

async function handleCreateExpense(
  event: SyntheticEvent<HTMLFormElement>,
) {
  event.preventDefault();

  if (!id) {
    return;
  }

  setExpenseFormError("");

  const amount = Number(expenseAmount);
  const amountCents = Math.round(amount * 100);

  if (!Number.isFinite(amount) || amount <= 0) {
    setExpenseFormError("Enter a valid amount");
    return;
  }

  if (!paidBy) {
    setExpenseFormError("Select who paid");
    return;
  }

  try {
    await createExpense(
      id,
      expenseDescription,
      amountCents,
      paidBy,
    );

    const updatedExpenses = await getExpenses(id);
    setExpenses(updatedExpenses);

    const updatedBalances = await getBalances(id);
    const updatedSettlements = await getSettlements(id);

    setBalances(updatedBalances);
    setSettlements(updatedSettlements);

    setExpenseDescription("");
    setExpenseAmount("");
    setPaidBy("");
  } catch (error) {
    if (error instanceof Error) {
      setExpenseFormError(error.message);
    } else {
      setExpenseFormError("Failed to create expense");
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
if (isLoadingGroup) {
  return <p>Loading group...</p>;
}

if (!group) {
  return <p>Group not found.</p>;
}  }

  function getMemberName(userId: string) {
  const member = group?.members.find(
    (member) => member._id === userId,
  );

  if (!member) {
    return "Unknown member";
  }

  return member.name;
}

  return (
    <main className={styles.page}>
      <Link to="/dashboard">
        ← Back to dashboard
      </Link>

      <h1>{group.name}</h1>

      <p>Currency: {group.currency}</p>

    <section className={styles.card}>
      <h2>Members</h2>

{group.members.map((member) => (
  <div 
  key={member._id}
  className={styles.listItem}
  >
    <p>{member.name}</p>
    <p>{member.email}</p>

    {member._id !== group.createdBy && (
      <button
        type="button"
        onClick={() =>
          handleRemoveMember(member._id)
        }
      >
        Remove
      </button>
    )}
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
</section>
<section className={styles.card}>
  <h2>Expenses</h2>
  <h3>Add expense</h3>

  <form onSubmit={handleCreateExpense}>
    <label>
      Description
      <input
        type="text"
        value={expenseDescription}
        onChange={(event) =>
          setExpenseDescription(event.target.value)
        }
        required
      />
    </label>

    <label>
      Amount
      <input
        type="number"
        step="0.01"
        min="0.01"
        value={expenseAmount}
        onChange={(event) =>
          setExpenseAmount(event.target.value)
        }
        required
      />
    </label>

    <label>
      Paid by
      <select
        value={paidBy}
        onChange={(event) =>
          setPaidBy(event.target.value)
        }
        required
      >
        <option value="">
          Select member
        </option>

        {group.members.map((member) => (
          <option
            key={member._id}
            value={member._id}
          >
            {member.name}
          </option>
        ))}
      </select>
    </label>

    <button type="submit">
      Add expense
    </button>
  </form>

  {expenseFormError && (
    <p>{expenseFormError}</p>
  )}

  {expensesError && (
    <p>{expensesError}</p>
  )}

  {expenses.length === 0 && !expensesError && (
    <p>No expenses yet.</p>
  )}

  {expenses.map((expense) => (
    <div key={expense._id}
      className={styles.listItem}
    >
      <p>{expense.description}</p>

      <p>
        {(expense.amountCents / 100).toFixed(2)}{" "}
        {group.currency}
      </p>
    </div>
  ))}
</section>

<section className={styles.card}>
  <h2>Balances</h2>

  {balanceError && <p>{balanceError}</p>}

  {balances.map((balance) => (
    <div 
      key={balance.userId}
      className={styles.listItem}>
      <p>
        {getMemberName(balance.userId)}:{" "}
        {balance.balanceCents > 0 ? "+" : ""}
        {(balance.balanceCents / 100).toFixed(2)}{" "}
        {group.currency}
      </p>
    </div>
  ))}
</section>

<section className={styles.card}>
  <h2>Settlements</h2>

  {settlements.map((settlement, index) => (
    <div 
    key={index}
    className={styles.listItem}>
      <p>
        {getMemberName(settlement.from)} owes{" "}
        {getMemberName(settlement.to)}{" "}
        {(settlement.amountCents / 100).toFixed(2)}{" "}
        {group.currency}
      </p>
    </div>
  ))}
</section>
</main>
);
}

export default GroupPage;