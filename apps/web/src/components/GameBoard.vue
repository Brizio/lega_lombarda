<template>
  <div class="game-board" ref="containerEl">
    <canvas ref="canvasEl" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useGameStore } from '@/stores/game';
import { MapRenderer } from '@/pixi/MapRenderer';

const game = useGameStore();
const containerEl = ref<HTMLElement | null>(null);
const canvasEl = ref<HTMLCanvasElement | null>(null);

let renderer: MapRenderer | null = null;

onMounted(async () => {
  if (!containerEl.value || !canvasEl.value) return;
  renderer = new MapRenderer(canvasEl.value, containerEl.value);
  await renderer.init();
  if (game.gameState) renderer.update(game.gameState);
});

watch(
  () => game.gameState,
  (state) => {
    if (state && renderer) renderer.update(state);
  },
  { deep: true },
);

onUnmounted(() => {
  renderer?.destroy();
});
</script>

<style scoped lang="scss">
.game-board {
  width: 100%;
  height: 100%;
  background: #0a0a1a;

  canvas {
    width: 100%;
    height: 100%;
    display: block;
  }
}
</style>
