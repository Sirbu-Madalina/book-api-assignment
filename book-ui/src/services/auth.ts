import { apiFetch } from "./api";

// sends the login request to the backend using apiFetch
export async function login(email: string, password: string) {
  const data = await apiFetch("/user/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  // extracts the token and user data from the response
  const token = data?.data?.token ?? data?.token;
  const userId = data?.data?.userId;
  const yearlyReadingGoal = data?.data?.yearlyReadingGoal;
 // data is stored in local Storage, while is logged in
  if (token) localStorage.setItem("token", token);
  if (userId) localStorage.setItem("userId", userId);
  if (yearlyReadingGoal !== undefined) {
    localStorage.setItem("yearlyReadingGoal", String(yearlyReadingGoal));
  }

  return data;
}

//sends a request to create a new user account.
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

//checks if a user is logged in by verifying if a token exists
export function isLoggedIn() {
  return !!localStorage.getItem("token");
}

// helpers that retrieve stored user data
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