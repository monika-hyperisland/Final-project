export function splitAmountEqually(
  amountCents: number,
  memberIds: string[],
) {
  const memberCount = memberIds.length;

  if (memberCount === 0) {
    throw new Error("Cannot split between zero members");
  }

  const baseShare = Math.floor(
    amountCents / memberCount,
  );

  const remainder =
    amountCents % memberCount;

  return memberIds.map((userId, index) => {
  let share = baseShare;

  if (index < remainder) {
    share += 1;
  }

  return {
    user: userId,
    amountCents: share,
  };
});
}