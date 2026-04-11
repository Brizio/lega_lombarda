<template>
  <div class="lobby-page">
    <header class="topbar">
      <h2>Lobby — Barbarossa</h2>
      <div class="user-info">
        <span>{{ auth.username }}</span>
        <button class="secondary" @click="auth.logout()">Esci</button>
      </div>
    </header>

    <div class="lobby-content">
      <div class="panel create-section">
        <h3>Nuova Partita</h3>
        <div class="create-row">
          <input v-model="newGameName" placeholder="Nome partita (opzionale)" />
          <button class="primary" @click="handleCreate" :disabled="game.loading">Crea</button>
        </div>
      </div>

      <div class="panel games-section">
        <h3>Partite Disponibili</h3>
        <button class="secondary" @click="loadGames" style="margin-bottom: 8px">Aggiorna</button>

        <div v-if="games.length === 0" class="empty">Nessuna partita in attesa</div>

        <div v-for="g in games" :key="g.id" class="game-row" @click="handleJoin(g.id)">
          <div>
            <strong>{{ g.id.slice(0, 8) }}</strong>
            <span class="badge">{{ g.players.length }}/2</span>
          </div>
          <div class="players-list">
            <span v-for="p in g.players" :key="p.id" class="player-tag">{{ p.name }} ({{ p.faction }})</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useGameStore } from '@/stores/game';
import * as api from '@/services/api';

const auth = useAuthStore();
const game = useGameStore();
const router = useRouter();

const newGameName = ref('');
const games = ref<Array<{ id: string; players: Array<{ id: string; name: string; faction: string }>; status: string }>>([]);

async function loadGames() {
  games.value = await api.getAvailableGames();
}

async function handleCreate() {
  await game.createGame(newGameName.value || undefined);
  if (game.gameId) router.push(`/game/${game.gameId}`);
}

async function handleJoin(id: string) {
  await game.joinGame(id);
  router.push(`/game/${id}`);
}

onMounted(loadGames);
</script>

<style scoped lang="scss">
.lobby-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $gap;
  background: $bg-card;
  height: $topbar-height;
}

.user-info {
  display: flex;
  align-items: center;
  gap: $gap;
}

.lobby-content {
  flex: 1;
  padding: $gap;
  display: flex;
  flex-direction: column;
  gap: $gap;
  max-width: 700px;
  margin: 0 auto;
  width: 100%;
}

.create-row {
  display: flex;
  gap: 8px;
  input { flex: 1; }
}

.game-row {
  padding: 10px;
  border: 1px solid $text-muted;
  border-radius: $border-radius;
  cursor: pointer;
  margin-bottom: 6px;
  &:hover { background: $bg-panel; }
}

.badge {
  margin-left: 8px;
  background: $accent;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.player-tag {
  font-size: 13px;
  color: $text-muted;
  margin-right: 8px;
}

.empty {
  color: $text-muted;
  text-align: center;
  padding: 20px;
}
</style>
