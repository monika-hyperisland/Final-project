const API_URL = "http://localhost:3000";

export async function getExpenses(groupId: string) {
  const response = await fetch(
    `${API_URL}/api/groups/${groupId}/expenses`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load expenses");
  }

  return response.json();
}

export async function createExpense(
  groupId: string,
  description: string,
  amountCents: number,
  paidBy: string,
) {
  const response = await fetch(
    `${API_URL}/api/groups/${groupId}/expenses`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      credentials: "include",

      body: JSON.stringify({
        description,
        amountCents,
        paidBy,
      }),
    },
  );

  if (!response.ok) {
    const data = await response.json();

    throw new Error(
      data.message || "Failed to create expense",
    );
  }

  return response.json();
}