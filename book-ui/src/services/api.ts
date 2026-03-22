const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

function getToken() {
  return localStorage.getItem("token");
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();

  const headers: HeadersInit = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { "auth-token": token } : {}),
    ...(options.headers ?? {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 204) {
    return null;
  }

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  let data: any = null;

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