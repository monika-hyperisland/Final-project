interface BalanceSplit {
  user: string;
  amountCents: number;
}

interface BalanceExpense {
  amountCents: number;
  paidBy: string;
  splits: BalanceSplit[];
}
interface BalancePayment {
  from: string;
  to: string;
  amountCents: number;
}

export function calculateBalances(
  expenses: BalanceExpense[],
  payments: BalancePayment[] = [],
) {
type Balances = {
  [userId: string]: number;
};

const balances: Balances = {};

  for (const expense of expenses) {
    const payerId = expense.paidBy;

    if (balances[payerId] === undefined) {
      balances[payerId] = 0;
    }

    balances[payerId] += expense.amountCents;

    for (const split of expense.splits) {
      const userId = split.user;

      if (balances[userId] === undefined) {
        balances[userId] = 0;
      }

      balances[userId] -= split.amountCents;
    }
  }

  for (const payment of payments) {
  if (balances[payment.from] === undefined) {
    balances[payment.from] = 0;
  }

  if (balances[payment.to] === undefined) {
    balances[payment.to] = 0;
  }

  balances[payment.from] += payment.amountCents;
  balances[payment.to] -= payment.amountCents;
}

  return Object.entries(balances).map(
    ([userId, balanceCents]) => {
      return {
        userId,
        balanceCents,
      };
    },
  );
}