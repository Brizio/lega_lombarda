import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as api from '@/services/api';
import { joinGameRoom } from '@/services/socket';

export const useGameStore = defineStore('game', () => {
  const gameState = ref<Record<string, unknown> | null>(null);
  const gameId = ref('');
  const loading = ref(false);
  const error = ref('');

  const status = computed(() => (gameState.value?.status as string) ?? '');
  const phase = computed(() => (gameState.value?.phase as string) ?? '');
  const round = computed(() => (gameState.value?.round as number) ?? 0);
  const players = computed(() => (gameState.value?.players as unknown[]) ?? []);
  const cities = computed(() => (gameState.value?.cities as Record<string, unknown>) ?? {});
  const activeConflicts = computed(() => (gameState.value?.activeConflicts as unknown[]) ?? []);
  const log = computed(() => (gameState.value?.log as string[]) ?? []);
  const hand = computed(() => (gameState.value?.hand as unknown[]) ?? []);
  const draftState = computed(() => (gameState.value?.draftState as Record<string, unknown>) ?? null);

  async function createGame(name?: string) {
    loading.value = true;
    try {
      const res = await api.createGame(name);
      gameId.value = res.gameId;
      joinGameRoom(res.gameId);
      await fetchState();
    } finally {
      loading.value = false;
    }
  }

  async function joinGame(id: string) {
    loading.value = true;
    try {
      await api.joinGame(id);
      gameId.value = id;
      joinGameRoom(id);
      await fetchState();
    } finally {
      loading.value = false;
    }
  }

  async function fetchState() {
    if (!gameId.value) return;
    const data = await api.getGameState(gameId.value);
    gameState.value = data;
  }

  async function doAction(action: string, body: Record<string, unknown> = {}) {
    error.value = '';
    try {
      await api.gameAction(gameId.value, action, body);
    } catch (e: unknown) {
      error.value = (e as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Errore';
    }
  }

  function handleGameUpdate(payload: { type: string; game: unknown }) {
    gameState.value = payload.game as Record<string, unknown>;
  }

  function leaveGame() {
    gameState.value = null;
    gameId.value = '';
  }

  return {
    gameState, gameId, loading, error,
    status, phase, round, players, cities, activeConflicts, log, hand, draftState,
    createGame, joinGame, fetchState, doAction, handleGameUpdate, leaveGame,
  };
});
