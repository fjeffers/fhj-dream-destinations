// src/utils/adminFetch.js
// Authenticated fetch wrapper for admin Netlify function calls.
// Automatically attaches the Supabase JWT from localStorage as
// an Authorization: Bearer header.

export function getAdminToken() {
  try {
    return localStorage.getItem("fhj_admin_token") || null;
  } catch {
    return null;
  }
}

export async function adminFetch(url, options = {}) {
  const token = getAdminToken();
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
