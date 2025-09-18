<template>
  <div class="draft-container">
    <div class="player-section">
      <h2>Federico Barbarossa</h2>
      <div class="cards-row">
        <Card
          v-for="card in barbarossaDraft"
          :key="card.city"
          :title="card.city"
          :image="card.image"
          :class="{ selectable: isBarbarossaTurn }"
          @click="isBarbarossaTurn && selectCard('barbarossa', card)"
        />
      </div>
    </div>
    <div class="player-section">
      <h2>Lega Lombarda</h2>
      <div class="cards-row">
        <Card
          v-for="card in legaDraft"
          :key="card.city"
          :title="card.city"
          :image="card.image"
          :class="{ selectable: isLegaTurn }"
          @click="isLegaTurn && selectCard('lega', card)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import Card from './Card.vue';
import cardsData from '../data/cards.js';

export default {
  components: { Card },
  setup() {
    // Stato
    const barbarossaDraft = ref([]);
    const legaDraft = ref([]);
    const barbarossaHand = ref([]);
    const legaHand = ref([]);
    const draftPhase = ref(1); // 1: 2 carte, 2: 3 carte
    const isBarbarossaTurn = ref(true);
    const isLegaTurn = ref(false);

    // Funzione per pescare carte random
    function drawCards(num) {
      // Shuffle e pesca
      const shuffled = [...cardsData].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, num);
    }

    // Inizio draft
    function startDraft() {
      barbarossaDraft.value = drawCards(draftPhase.value === 1 ? 2 : 3);
      legaDraft.value = drawCards(draftPhase.value === 1 ? 2 : 3);
      isBarbarossaTurn.value = true;
      isLegaTurn.value = false;
    }

    // Selezione carta
    function selectCard(player, card) {
      if (draftPhase.value === 1) {
        if (player === 'barbarossa') {
          barbarossaHand.value.push(card);
          const other = barbarossaDraft.value.find(c => c !== card);
          legaHand.value.push(other);
          isBarbarossaTurn.value = false;
          isLegaTurn.value = true;
        } else {
          legaHand.value.push(card);
          const other = legaDraft.value.find(c => c !== card);
          barbarossaHand.value.push(other);
          // Passa alla seconda fase del draft
          draftPhase.value = 2;
          startDraft();
        }
      } else if (draftPhase.value === 2) {
        if (player === 'barbarossa') {
          barbarossaHand.value.push(card);
          const others = barbarossaDraft.value.filter(c => c !== card);
          legaHand.value.push(...others);
          isBarbarossaTurn.value = false;
          isLegaTurn.value = true;
        } else {
          legaHand.value.push(card);
          const others = legaDraft.value.filter(c => c !== card);
          barbarossaHand.value.push(...others);
          // Draft finito, passa alla fase successiva del gioco
        }
      }
    }

    // Avvia draft all'inizio partita
    startDraft();

    return {
      barbarossaDraft,
      legaDraft,
      isBarbarossaTurn,
      isLegaTurn,
      selectCard,
    };
  },
};
</script>

<style scoped>
.draft-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.player-section {
  flex: 1;
  border-bottom: 2px solid #333;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.cards-row {
  display: flex;
  gap: 20px;
}
.selectable {
  cursor: pointer;
  border: 2px solid #007bff;
}
</style>