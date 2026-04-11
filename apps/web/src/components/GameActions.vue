<template>
  <div class="game-actions panel">
    <h4>Azioni</h4>

    <!-- Waiting: start game -->
    <template v-if="game.status === 'waiting'">
      <button class="primary" @click="game.doAction('start')">Inizia Partita</button>
    </template>

    <!-- Playing phase actions -->
    <template v-if="game.phase === 'actions'">
      <button class="secondary" @click="game.doAction('end-turn')">Fine Turno</button>
      <button class="secondary" @click="game.doAction('pass-turn')">Passa</button>
    </template>

    <!-- Setup round 1 -->
    <template v-if="game.phase === 'setup'">
      <div class="unit-choice">
        <span>Scegli unità iniziale:</span>
        <button v-for="t in ['cavalry', 'bishop', 'merchant']" :key="t" class="secondary" @click="game.doAction('setup-round1', { unitType: t })">
          {{ t }}
        </button>
      </div>
    </template>

    <!-- Leave -->
    <button class="secondary" @click="handleLeave" style="margin-top: auto">Abbandona</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useGameStore } from '@/stores/game';

const game = useGameStore();
const router = useRouter();

async function handleLeave() {
  await game.doAction('leave');
  game.leaveGame();
  router.push('/');
}
</script>

<style scoped lang="scss">
.game-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.unit-choice {
  display: flex;
  flex-direction: column;
  gap: 4px;
  span { font-size: 13px; color: $text-muted; }
}
</style>
