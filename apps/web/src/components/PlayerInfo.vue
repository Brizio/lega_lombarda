<template>
  <div class="player-info panel">
    <h4>Partita — Round {{ game.round }}</h4>
    <div v-for="p in game.players" :key="(p as any).id" class="player-row">
      <span class="faction-dot" :class="(p as any).faction" />
      <span>{{ (p as any).name }}</span>
      <span class="cities-count">{{ (p as any).controlledCities ?? 0 }} città</span>
    </div>
    <div class="meta">
      <span>Fase: {{ game.phase }}</span>
      <span>Status: {{ game.status }}</span>
    </div>
    <div v-if="game.error" class="error">{{ game.error }}</div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/game';
const game = useGameStore();
</script>

<style scoped lang="scss">
.player-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.faction-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  &.barbarossa { background: $barbarossa-gold; }
  &.lega { background: $lega-green; }
}

.cities-count {
  margin-left: auto;
  font-size: 12px;
  color: $text-muted;
}

.meta {
  display: flex;
  flex-direction: column;
  font-size: 12px;
  color: $text-muted;
  margin-top: 8px;
}

.error {
  color: $accent;
  font-size: 13px;
  margin-top: 4px;
}
</style>
