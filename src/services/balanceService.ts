const API_URL = "http://localhost:3000";

export async function getBalances(groupId: string) {
  const response = await fetch(
    `${API_URL}/api/groups/${groupId}/balances`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load balances");
  }

  return response.json();
}

export async function getSettlements(groupId: string) {
  const response = await fetch(
    `${API_URL}/api/groups/${groupId}/settlements`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load settlements");
  }

  return response.json();
}
