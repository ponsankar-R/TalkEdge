const API_URL = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem('talkedge_admin_token');
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  };
}

export async function getUsers() {
  const res = await fetch(`${API_URL}/api/admin/users`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch users.');
  return data.users; // [{ id, email, created_at }]
}

export async function addUser(email, password) {
  const res = await fetch(`${API_URL}/api/admin/users`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add user.');
  return data;
}

export async function bulkAddUsers(users) {
  const res = await fetch(`${API_URL}/api/admin/users/bulk`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ users }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Bulk import failed.');
  return data; // { created, skipped, skippedEmails }
}

export async function deleteUser(id) {
  const res = await fetch(`${API_URL}/api/admin/users/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete user.');
  return data;
}
