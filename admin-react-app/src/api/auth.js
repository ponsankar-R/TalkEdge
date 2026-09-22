const API_URL = import.meta.env.VITE_API_URL;

export async function loginAdmin(email, password) {
  const res = await fetch(`${API_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Login failed.');
  }

  return data; // { message, token, admin }
}
