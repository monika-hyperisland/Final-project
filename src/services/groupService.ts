const API_URL = "http://localhost:3000";

export async function getGroups() {
  const response = await fetch(
    `${API_URL}/api/groups`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load groups");
  }

  return response.json();
}

export async function createGroup(
  name: string,
  currency: string,
) {
  const response = await fetch(
    `${API_URL}/api/groups`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      credentials: "include",

      body: JSON.stringify({
        name,
        currency,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to create group");
  }

  return response.json();
}

export async function getGroup(groupId: string) {
  const response = await fetch(
    `${API_URL}/api/groups/${groupId}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load group");
  }

  return response.json();
}
export async function addMember(
  groupId: string,
  email: string,
) {
  const response = await fetch(
    `${API_URL}/api/groups/${groupId}/members`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      credentials: "include",

      body: JSON.stringify({
        email,
      }),
    },
  );

  if (!response.ok) {
  const data = await response.json();

  throw new Error(
    data.message || "Failed to add member",
  );
}
  return response.json();
}
export async function removeMember(
  groupId: string,
  memberId: string,
) {
  const response = await fetch(
    `${API_URL}/api/groups/${groupId}/members/${memberId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  if (!response.ok) {
    const data = await response.json();

    throw new Error(
      data.message || "Failed to remove member",
    );
  }

  return response.json();
}