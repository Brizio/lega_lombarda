<template>
  <div class="draft-phase-container">
    <h2>Fase Draft</h2>
    <div class="draft-section">
      <!-- Federico Barbarossa -->
      <div>
        <h3>Federico Barbarossa</h3>
        <div class="cards-row">
          <Card
            v-for="card in draftCards.barbarossa"
            :key="card.city"
            :title="card.city"
            :recruitmentOptions="card.recruitmentOptions"
            :event="card.event"
            :image="card.image"
            @click="onCardPick('barbarossa', card)"
            :class="{ selectable: isSelectable('barbarossa') }"
          >
            <template #image>
              <img
                v-if="card.image"
                :src="card.image"
                alt="card"
                class="card-img"
              />
              <span v-else class="placeholder-icon">🏰</span>
            </template>
          </Card>
        </div>
      </div>
      <!-- Lega Lombarda -->
      <div>
        <h3>Lega Lombarda</h3>
        <div class="cards-row">
          <Card
            v-for="card in draftCards.lega"
            :key="card.city"
            :title="card.city"
            :recruitmentOptions="card.recruitmentOptions"
            :event="card.event"
            :image="card.image"
            @click="onCardPick('lega', card)"
            :class="{ selectable: isSelectable('lega') }"
          >
            <template #image>
              <img
                v-if="card.image"
                :src="card.image"
                alt="card"
                class="card-img"
              />
              <span v-else class="placeholder-icon">🛡️</span>
            </template>
          </Card>
        </div>
      </div>
    </div>
    <div class="draft-info">
      <p v-if="draftPhase === 1">Ogni giocatore sceglie una carta e passa l'altra all'avversario.</p>
      <p v-else-if="draftPhase === 2">Ogni giocatore sceglie una carta e passa le altre due all'avversario.</p>
    </div>
  </div>
</template>

<script>
//import Card from '../components/Card.vue';
import { useGameLogic } from '../composables/useGameLogic';

export default {
  components: { Card },
  props: ['draftCards'],
  setup() {
    const {
      draftPhase,
      draftPickPhase1,
      draftPickPhase2,
      phase,
    } = useGameLogic();

    // Determina se il giocatore può selezionare (draftPhase e phase)
    function isSelectable(player) {
      if (phase.value !== 'draft') return false;
      if (draftPhase.value === 1 && draftCards.value[player].length === 2) return true;
      if (draftPhase.value === 2 && draftCards.value[player].length === 3) return true;
      return false;
    }

    function onCardPick(player, card) {
      if (!isSelectable(player)) return;
      if (draftPhase.value === 1) {
        draftPickPhase1(player, card);
      } else if (draftPhase.value === 2) {
        draftPickPhase2(player, card);
      }
    }

    return {
      draftPhase,
      draftCards: useGameLogic().draftCards,
      phase,
      isSelectable,
      onCardPick,
    };
  },
};
</script>

<style scoped>
.draft-phase-container {
  padding: 32px;
}
.draft-section {
  display: flex;
  justify-content: space-between;
  gap: 48px;
}
.cards-row {
  display: flex;
  gap: 16px;
  margin-top: 12px;
}
.selectable {
  cursor: pointer;
  border: 2px solid #228b22;
  border-radius: 8px;
  box-shadow: 0 0 8px #228b2240;
  transition: box-shadow 0.2s;
}
.card-img {
  width: 80px;
  height: 120px;
  object-fit: cover;
  border-radius: 6px;
}
.placeholder-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  width: 80px;
  height: 120px;
  background: #e0e0e0;
  border-radius: 6px;
}
.draft-info {
  margin-top: 32px;
  text-align: center;
  font-size: 1.1rem;
  color: #444;
}
</style>