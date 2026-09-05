interface BalanceSplit {
  user: string;
  amountCents: number;
}

interface BalanceExpense {
  amountCents: number;
  paidBy: string;
  splits: BalanceSplit[];
}

export function calculateBalances(
  expenses: BalanceExpense[],
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

  return Object.entries(balances).map(
    ([userId, balanceCents]) => {
      return {
        userId,
        balanceCents,
      };
    },
  );
}