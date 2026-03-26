import { apiFetch } from "./api";

export async function login(email: string, password: string) {
  const data = await apiFetch("/user/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  const token = data?.data?.token ?? data?.token;
  const userId = data?.data?.userId;
  const yearlyReadingGoal = data?.data?.yearlyReadingGoal;

  if (token) localStorage.setItem("token", token);
  if (userId) localStorage.setItem("userId", userId);
  if (yearlyReadingGoal !== undefined) {
    localStorage.setItem("yearlyReadingGoal", String(yearlyReadingGoal));
  }

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
  localStorage.removeItem("userId");
  localStorage.removeItem("yearlyReadingGoal");
}

export function isLoggedIn() {
  return !!localStorage.getItem("token");
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getUserId() {
  return localStorage.getItem("userId");
}

export function getYearlyReadingGoal() {
  const value = localStorage.getItem("yearlyReadingGoal");
  return value ? Number(value) : null;
}