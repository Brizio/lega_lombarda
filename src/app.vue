<!-- src/App.vue -->
<template>
  <MainView
    v-if="phase === 'menu'"
    :menuItems="menuItems"
  />
  <CreditsView
    v-else-if="phase === 'credits'"
    @backToMenu="backToMenu"
  />
  <DraftPhaseView
    v-else-if="phase === 'draft'"
    :draftCards="draftCards"
  />
  <GameView
    v-else-if="phase === 'game'"
  />
</template>

<script>
import MainView from './views/MainView.vue';
import CreditsView from './views/CreditsView.vue';
import DraftPhaseView from './views/DraftPhaseView.vue';
import GameView from './views/GameView.vue';
import { defineComponent } from 'vue';
import { useGameLogic } from './composables/useGameLogic.js';

export default defineComponent({
  components: {
    MainView,
    CreditsView,
    DraftPhaseView,
    GameView,
  },
  setup() {
    const { phase, draftCards } = useGameLogic();

    const menuItems = [
      { label: 'Nuova Partita', action: 'newGame' },
      { label: 'Rivedi Partita', action: 'reviewGame' },
      { label: 'Credits', action: 'credits' },
      { label: 'Esci', action: 'exit' },
    ];

    function backToMenu() {
      phase.value = 'menu';
    }

    return {
      phase,
      menuItems,
      backToMenu,
      draftCards,
    };
  },
});
</script>

<style>
/* ...existing global styles... */
</style>
