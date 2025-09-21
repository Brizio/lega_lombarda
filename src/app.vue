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
/* import MainView from './views/MainView.vue';
import CreditsView from './views/CreditsView.vue';
import DraftPhaseView from './views/DraftPhaseView.vue';
import GameView from './views/GameView.vue';
import { defineComponent } from 'vue';
import { useGameLogic } from './composables/useGameLogic.js';

export default defineComponent({
  components: {
    CreditsView,
    DraftPhaseView,
    GameView,
    MainView
  },
  setup() {
    phase.value = 'menu';
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
}); */
import { useGameLogic } from './composables/useGameLogic.js';

export default {
  props: ['menuItems'],
  setup(props) {
    const { startGame, phase } = useGameLogic();

    function onClick(action) {
      switch (action) {
        case 'newGame':
          startGame();
          phase.value = 'draft'; // Passa alla fase draft
          break;
        case 'reviewGame':
          phase.value = 'menu'; // Torna al menu
          break;
        case 'credits':
          phase.value = 'credits'; // Mostra i credits
          break;
        case 'exit':
          window.close(); // Esci dall'app
          break;
      }
    }

    return { onClick };
  },
};
</script>


<style scoped>
.menu-container {
  background: #228b22;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: center;
}

.menu-list li {
  font-size: 2rem;
  color: #fff;
  margin: 20px 0;
  cursor: pointer;
  font-weight: normal;
  transition: font-weight 0.2s;
}

.menu-list li.selected {
  font-weight: bold;
}

.credits-container {
  background: #228b22;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.credits-text {
  color: #fff;
  font-size: 1.2rem;
  max-width: 600px;
  text-align: center;
  margin-bottom: 30px;
}

.mazzo {
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  gap: 10px;
  padding: 10px;
}

.carta {
  width: 100px;
  border: 2px solid transparent;
  transition: border 0.2s, transform 0.2s;
  cursor: pointer;
}

.carta:hover {
  border: 2px solid #007bff;
  transform: scale(1.1);
}
</style>