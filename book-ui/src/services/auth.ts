import { apiFetch } from "./api";

export async function login(email: string, password: string) {
  const data = await apiFetch("/user/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  // your API returns { error:null, data:{ userId, token } }
  const token = data?.data?.token;
  if (token) localStorage.setItem("token", token);

  return data;
}

export async function register(name: string, email: string, password: string) {
  return apiFetch("/user/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export function logout() {
  localStorage.removeItem("token");
}

export function isLoggedIn() {
  return !!localStorage.getItem("token");
}