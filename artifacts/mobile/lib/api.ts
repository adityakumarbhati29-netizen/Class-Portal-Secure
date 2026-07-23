import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@portal_token';

// In dev: EXPO_PUBLIC_DOMAIN is set by the workflow to $REPLIT_DEV_DOMAIN
// In prod APK: set EXPO_PUBLIC_API_URL before building
function getBaseUrl(): string {
  const explicit = process.env.EXPO_PUBLIC_API_URL;
  if (explicit) return explicit.replace(/\/$/, '');
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}/api`;
  return 'http://localhost:8080/api';
}

export const BASE_URL = getBaseUrl();

// Token helpers
export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}
export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}
export async function clearToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

// Core fetch wrapper
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body?.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  login: (username: string, password: string) =>
    apiFetch<{ token: string; user: { id: string; username: string; role: string; name: string } }>(
      '/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }
    ),
  me: () =>
    apiFetch<{ id: string; username: string; role: string; name: string; password: string }>('/auth/me'),
};

// ── Users ─────────────────────────────────────────────────────────────────
export const usersApi = {
  list: () => apiFetch<Array<{ id: string; username: string; role: string; name: string; password: string }>>('/users'),
  create: (data: { username: string; password: string; role: string; name: string }) =>
    apiFetch('/users', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/users/${id}`, { method: 'DELETE' }),
};

// ── Students ──────────────────────────────────────────────────────────────
export const studentsApi = {
  list: () => apiFetch<Array<{ id: string; rollNo: number; name: string; fatherName: string; contact: string; section: string }>>('/students'),
  create: (data: object) => apiFetch('/students', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/students/${id}`, { method: 'DELETE' }),
};

// ── Class Tests ───────────────────────────────────────────────────────────
export const classTestsApi = {
  list: () => apiFetch<Array<{ id: string; subject: string; date: string; maxMarks: number; results: Array<{ rollNo: number; name: string; marks: number }> }>>('/class-tests'),
  create: (data: object) => apiFetch('/class-tests', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/class-tests/${id}`, { method: 'DELETE' }),
};

// ── Subjects ──────────────────────────────────────────────────────────────
export const subjectsApi = {
  list: () => apiFetch<Array<{ id: string; name: string; teacher: string; topics: Array<{ id: string; title: string; description: string }> }>>('/subjects'),
  create: (data: object) => apiFetch('/subjects', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/subjects/${id}`, { method: 'DELETE' }),
  addTopic: (subjectId: string, data: object) => apiFetch(`/subjects/${subjectId}/topics`, { method: 'POST', body: JSON.stringify(data) }),
  deleteTopic: (subjectId: string, topicId: string) => apiFetch(`/subjects/${subjectId}/topics/${topicId}`, { method: 'DELETE' }),
};

// ── Soft Board ────────────────────────────────────────────────────────────
export const softBoardApi = {
  list: () => apiFetch<Array<{ id: string; title: string; content: string; date: string; author: string; pinned: boolean; colorIndex: number }>>('/soft-board'),
  create: (data: object) => apiFetch('/soft-board', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: object) => apiFetch(`/soft-board/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/soft-board/${id}`, { method: 'DELETE' }),
};

// ── Notices ───────────────────────────────────────────────────────────────
export const noticesApi = {
  list: () => apiFetch<Array<{ id: string; title: string; content: string; date: string; priority: string; author: string }>>('/notices'),
  create: (data: object) => apiFetch('/notices', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/notices/${id}`, { method: 'DELETE' }),
};
