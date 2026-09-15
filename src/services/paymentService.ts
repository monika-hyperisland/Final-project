const API_URL = "http://localhost:3000";

export async function createPayment(
  groupId: string,
  to: string,
  amountCents: number,
) {
  const response = await fetch(
    `${API_URL}/api/groups/${groupId}/payments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        to,
        amountCents,
      }),
    },
  );

  if (!response.ok) {
    const data = await response.json();

    throw new Error(
      data.message || "Failed to create payment",
    );
  }

  return response.json();
}