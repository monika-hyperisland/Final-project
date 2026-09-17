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

import { getCurrentUser } from "../../services/authService";
import { createPayment } from "../../services/paymentService";
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
interface CurrentUser {
  id: string;
  name: string;
  email: string;
}

function GroupPage() {
  const { id } = useParams();

const [group, setGroup] = useState<Group | null>(null);
const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
const [paymentError, setPaymentError] = useState("");
const [error, setError] = useState("");
const [isLoadingGroup, setIsLoadingGroup] = useState(true);

const [memberEmail, setMemberEmail] = useState("");
const [memberError, setMemberError] = useState("");

const [expenses, setExpenses] = useState<Expense[]>([]);
const [expensesError, setExpensesError] = useState("");

const [expenseDescription, setExpenseDescription] = useState("");
const [expenseAmount, setExpenseAmount] = useState("");
const [paidBy, setPaidBy] = useState("");
const [participantIds, setParticipantIds] = useState<string[]>([]);
const [expenseFormError, setExpenseFormError] = useState("");

const [balances, setBalances] = useState<Balance[]>([]);
const [settlements, setSettlements] = useState<Settlement[]>([]);
const [balanceError, setBalanceError] = useState("");
const navigate = useNavigate();

  useEffect(() => {
  async function loadCurrentUser() {
    try {
      const userData = await getCurrentUser();
      setCurrentUser(userData);
    } catch {
      setPaymentError(
        "Failed to identify current user",
      );
    }
  }

  loadCurrentUser();
}, []);

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
function handleParticipantChange(
  memberId: string,
  checked: boolean,
) {
  if (checked) {
    setParticipantIds((currentIds) => [
      ...currentIds,
      memberId,
    ]);
  } else {
    setParticipantIds((currentIds) =>
      currentIds.filter((id) => id !== memberId),
    );
  }
}
function handleSelectAllParticipants(
  checked: boolean,
) {
  if (!group) {
    return;
  }

  if (checked) {
    setParticipantIds(
      group.members.map((member) => member._id),
    );
  } else {
    setParticipantIds([]);
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
      participantIds,
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
    setParticipantIds([]);
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

async function handleMarkAsPaid(
  settlement: Settlement,
) {
  if (!id) {
    return;
  }

  setPaymentError("");

  try {
    await createPayment(
      id,
      settlement.to,
      settlement.amountCents,
    );

    const updatedBalances = await getBalances(id);
    const updatedSettlements = await getSettlements(id);

    setBalances(updatedBalances);
    setSettlements(updatedSettlements);
  } catch (error) {
    if (error instanceof Error) {
      setPaymentError(error.message);
    } else {
      setPaymentError("Failed to record payment");
    }
  }
}

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
      <Link 
      to="/dashboard"
     className={styles.backLink}
  > 
        ← Dashboard
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
        className={styles.dangerButton}
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
{memberError && (
  <p className={styles.error}>{memberError}</p>)}
</section>
<section className={styles.card}>
  <h2>Expenses</h2>
  <h3>Add expense</h3>

  <form 
  className={styles.expenseForm}
  onSubmit={handleCreateExpense}>
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

    <fieldset className={styles.participants}>
  <legend>Split between</legend>
  <label className={styles.participantOption}>
  <input
    type="checkbox"
    checked={
      group.members.length > 0 &&
      group.members.every((member) =>
        participantIds.includes(member._id),
      )
    }
    onChange={(event) =>
      handleSelectAllParticipants(
        event.target.checked,
      )
    }
  />

  <span>All members</span>
</label>
  {group.members.map((member) => (
    <label 
    key={member._id}
    className={styles.participantOption}
    >
      <input
        type="checkbox"
        checked={participantIds.includes(member._id)}
        onChange={(event) =>
          handleParticipantChange(
            member._id,
            event.target.checked,
          )
        }
      />
      <span>{member.name}</span>

    </label>
    
  ))}
</fieldset>

    <button 
    type="submit"
    className={styles.expenseSubmit}
  >
      Add expense
    </button>
  </form>

  {expenseFormError && (
    <p className={styles.error}>
      {expenseFormError}</p>
  )}

  {expensesError && (
    <p className={styles.error}>
      {expensesError}</p>
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
      <p>
      Paid by: {getMemberName(expense.paidBy)}
      </p>
    </div>
  ))}
</section>

<section className={styles.card}>
  <h2>Balances</h2>

  {balanceError && (
    <p className={styles.error}>
      {balanceError}
    </p>
  )}

  {balances.map((balance) => (
    <div
      key={balance.userId}
      className={styles.balanceRow}
    >
      <span className={styles.balanceName}>
        {getMemberName(balance.userId)}
      </span>

      <span
        className={`${styles.balanceAmount} ${
          balance.balanceCents > 0
            ? styles.balancePositive
            : balance.balanceCents < 0
              ? styles.balanceNegative
              : styles.balanceZero
        }`}
      >
        {balance.balanceCents > 0 ? "+" : ""}
        {(balance.balanceCents / 100).toFixed(2)}{" "}
        {group.currency}
      </span>
    </div>
  ))}
</section>

<section className={styles.card}>
  <h2>Settlements</h2>

  {settlements.length === 0 && !balanceError && (
    <p className={styles.settledMessage}>
      All settled up.
    </p>
  )}

  {settlements.map((settlement) => (
    <div
      key={`${settlement.from}-${settlement.to}`}
      className={styles.settlementRow}
    >
      <div className={styles.settlementInfo}>
        <span>
          {getMemberName(settlement.from)}
        </span>

        <span className={styles.owesText}>
          owes
        </span>

        <span>
          {getMemberName(settlement.to)}
        </span>

        <strong>
          {(settlement.amountCents / 100).toFixed(2)}{" "}
          {group.currency}
        </strong>
      </div>

      {currentUser?.id === settlement.from && (
        <button
          type="button"
          className={styles.paymentButton}
          onClick={() =>
            handleMarkAsPaid(settlement)
          }
        >
          Mark as paid
        </button>
      )}
    </div>
  ))}

  {paymentError && (
    <p className={styles.error}>
      {paymentError}
    </p>
  )}
</section>
</main>
);
}

export default GroupPage;