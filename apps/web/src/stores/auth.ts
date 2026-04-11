import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as api from '@/services/api';
import { connectSocket, disconnectSocket } from '@/services/socket';
import { router } from '@/router';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') ?? '');
  const userId = ref('');
  const username = ref('');

  const isAuthenticated = computed(() => !!token.value);

  function setSession(t: string, user: { id: string; username: string }) {
    token.value = t;
    userId.value = user.id;
    username.value = user.username;
    localStorage.setItem('token', t);
    connectSocket();
  }

  async function doRegister(user: string, pass: string) {
    const res = await api.register(user, pass);
    setSession(res.token, res.user);
    router.push('/');
  }

  async function doLogin(user: string, pass: string) {
    const res = await api.login(user, pass);
    setSession(res.token, res.user);
    router.push('/');
  }

  async function doGuest() {
    const res = await api.loginAsGuest();
    setSession(res.token, res.user);
    router.push('/');
  }

  async function checkAuth() {
    if (!token.value) return;
    try {
      const res = await api.checkAuth();
      userId.value = res.userId;
      username.value = res.username;
      connectSocket();
    } catch {
      logout();
    }
  }

  function logout() {
    token.value = '';
    userId.value = '';
    username.value = '';
    localStorage.removeItem('token');
    disconnectSocket();
    router.push('/login');
  }

  return { token, userId, username, isAuthenticated, doRegister, doLogin, doGuest, checkAuth, logout };
});
