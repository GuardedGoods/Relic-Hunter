const API_BASE = window.RELIC_API_URL || '/api';

let authToken = localStorage.getItem('relicHunter_token') || null;
let currentUser = localStorage.getItem('relicHunter_username') || null;

export function isLoggedIn() {
  return authToken !== null;
}

export function getUsername() {
  return currentUser;
}

export async function register(username, password) {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  return data;
}

export async function login(username, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  authToken = data.token;
  currentUser = data.username;
  localStorage.setItem('relicHunter_token', authToken);
  localStorage.setItem('relicHunter_username', currentUser);
  return data;
}

export function logout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('relicHunter_token');
  localStorage.removeItem('relicHunter_username');
}

export async function submitScore(runData) {
  if (!authToken) return null;
  try {
    const res = await fetch(`${API_BASE}/scores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(runData),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null; // silently fail if API is down
  }
}

export async function getLeaderboard() {
  try {
    const res = await fetch(`${API_BASE}/leaderboard`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.leaderboard || [];
  } catch {
    return []; // silently fail
  }
}

export async function getPersonalStats() {
  if (!authToken) return null;
  try {
    const res = await fetch(`${API_BASE}/leaderboard/personal`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getGlobalStats() {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
