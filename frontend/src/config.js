export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// Shared fetch helper that automatically sends the auth token from localStorage
export function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  return fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
