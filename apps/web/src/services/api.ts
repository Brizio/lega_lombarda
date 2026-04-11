import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10_000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

/* ─── Auth ─── */

export async function register(username: string, password: string) {
  const { data } = await api.post('/auth/register', { username, password });
  return data as { token: string; user: { id: string; username: string } };
}

export async function login(username: string, password: string) {
  const { data } = await api.post('/auth/login', { username, password });
  return data as { token: string; user: { id: string; username: string } };
}

export async function loginAsGuest() {
  const { data } = await api.post('/auth/guest');
  return data as { token: string; user: { id: string; username: string } };
}

export async function checkAuth() {
  const { data } = await api.get('/auth/check');
  return data as { authenticated: boolean; userId: string; username: string };
}

/* ─── Game ─── */

export async function createGame(name?: string) {
  const { data } = await api.post('/game/create', { name });
  return data as { gameId: string };
}

export async function joinGame(gameId: string) {
  await api.post('/game/join', { gameId });
}

export async function getAvailableGames() {
  const { data } = await api.get('/game/available');
  return data as Array<{ id: string; players: Array<{ id: string; name: string; faction: string }>; status: string }>;
}

export async function getGameState(gameId: string) {
  const { data } = await api.get(`/game/${gameId}/state`);
  return data;
}

/* ─── Game Actions ─── */

export const gameAction = (gameId: string, action: string, body: Record<string, unknown> = {}) =>
  api.post(`/game/${gameId}/${action}`, body);

export { api };
