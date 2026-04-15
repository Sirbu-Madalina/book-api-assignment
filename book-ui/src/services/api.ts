// Base URL for API (from env or fallback to local)
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

function getToken() {
  return localStorage.getItem("token");
}

// Reusable function for all API requests
export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();

  // the headers include Content-Type, which tells the server the data is JSON, and auth-token, which identifies the user making the request
  const headers: HeadersInit = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { "auth-token": token } : {}),
    ...(options.headers ?? {}),
  };

  // sends a request to your backend API
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 204) {
    return null;
  }

  // checks what type of data the server sent back
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  let data: any = null;

  // If it is JSON, I parse it as JSON, otherwise as text. If parsing fails, I set it to null.
  try {
    data = isJson ? await res.json() : await res.text();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.error || data?.message || `Request failed (${res.status})`;

    throw new Error(message);
  }

  return data;
}