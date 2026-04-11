<template>
  <div class="game-page">
    <!-- Left sidebar: player info + actions -->
    <aside class="sidebar left-sidebar">
      <PlayerInfo />
      <GameActions />
    </aside>

    <!-- Center: map / board -->
    <main class="board-area">
      <GameBoard />
    </main>

    <!-- Right sidebar: hand + log -->
    <aside class="sidebar right-sidebar">
      <DraftView v-if="game.status === 'draft'" />
      <CardHand v-else />
      <GameLog />
    </aside>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useGameStore } from '@/stores/game';
import { joinGameRoom } from '@/services/socket';
import PlayerInfo from '@/components/PlayerInfo.vue';
import GameActions from '@/components/GameActions.vue';
import GameBoard from '@/components/GameBoard.vue';
import DraftView from '@/components/DraftView.vue';
import CardHand from '@/components/CardHand.vue';
import GameLog from '@/components/GameLog.vue';

const route = useRoute();
const game = useGameStore();

onMounted(async () => {
  const id = route.params.id as string;
  game.gameId = id;
  joinGameRoom(id);
  await game.fetchState();
});

onUnmounted(() => {
  game.leaveGame();
});
</script>

<style scoped lang="scss">
.game-page {
  height: 100%;
  display: grid;
  grid-template-columns: $sidebar-width 1fr $sidebar-width;
  gap: 4px;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: $gap;
  padding: $gap;
  overflow-y: auto;
}

.board-area {
  position: relative;
  overflow: hidden;
}
</style>
