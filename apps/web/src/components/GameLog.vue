<template>
  <div class="game-log panel">
    <h4>Log</h4>
    <div class="log-entries" ref="logEl">
      <div v-for="(entry, i) in game.log" :key="i" class="log-entry">{{ entry }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { useGameStore } from '@/stores/game';

const game = useGameStore();
const logEl = ref<HTMLElement | null>(null);

watch(
  () => game.log.length,
  async () => {
    await nextTick();
    if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight;
  },
);
</script>

<style scoped lang="scss">
.game-log {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.log-entries {
  flex: 1;
  overflow-y: auto;
  font-size: 12px;
  color: $text-muted;
}

.log-entry {
  padding: 2px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
</style>
