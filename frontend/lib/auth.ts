export async function loginUser(email: string, password: string) {
  const res = await fetch("http://127.0.0.1:8000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Invalid credentials");
  return res.json();
}

export async function registerUser(email: string, password: string) {
  const res = await fetch("http://127.0.0.1:8000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Registration failed");
  return res.json();
}
