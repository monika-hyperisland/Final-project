interface Balance {
  userId: string;
  balanceCents: number;
}

interface Settlement {
  from: string;
  to: string;
  amountCents: number;
}

export function calculateSettlements(
  balances: Balance[],
): Settlement[] {
  const debtors = balances
    .filter((balance) => balance.balanceCents < 0)
    .map((balance) => {
      return {
        userId: balance.userId,
        amountCents: -balance.balanceCents,
      };
    });

  const creditors = balances
    .filter((balance) => balance.balanceCents > 0)
    .map((balance) => {
      return {
        userId: balance.userId,
        amountCents: balance.balanceCents,
      };
    });

  const settlements: Settlement[] = [];

  let debtorIndex = 0;
  let creditorIndex = 0;

  while (
    debtorIndex < debtors.length &&
    creditorIndex < creditors.length
  ) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];

    const amountCents = Math.min(
      debtor.amountCents,
      creditor.amountCents,
    );

    settlements.push({
      from: debtor.userId,
      to: creditor.userId,
      amountCents,
    });

    debtor.amountCents -= amountCents;
    creditor.amountCents -= amountCents;

    if (debtor.amountCents === 0) {
      debtorIndex += 1;
    }

    if (creditor.amountCents === 0) {
      creditorIndex += 1;
    }
  }

  return settlements;
}