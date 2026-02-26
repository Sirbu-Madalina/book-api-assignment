const BASE_URL = "http://localhost:4000/api";

function getToken() {
  return localStorage.getItem("token");
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  const token = getToken();
  if (token) headers.set("auth-token", token);

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // Try parse JSON if possible
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    // normalize errors
    const message = data?.error || data?.message || res.statusText;
    throw new Error(message);
  }

  return data;
}