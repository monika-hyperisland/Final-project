const API_URL = "http://localhost:3000";

export async function login(
  email: string,
  password: string,
) {
  const response = await fetch(
    `${API_URL}/api/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email,
        password,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return response.json();
}

export async function register(
  name: string,
  email: string,
  password: string,
) {
  const response = await fetch(
    `${API_URL}/api/auth/register`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        name,
        email,
        password,
      }),
    },
  );

  if (!response.ok) {
    const data = await response.json();

    throw new Error(
      data.message || "Registration failed",
    );
  }

  return response.json();
}

export async function getCurrentUser() {
  const response = await fetch(
    `${API_URL}/api/auth/me`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Not authenticated");
  }

  return response.json();
}

export async function logout() {
  const response = await fetch(
    `${API_URL}/api/auth/logout`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Logout failed");
  }
}