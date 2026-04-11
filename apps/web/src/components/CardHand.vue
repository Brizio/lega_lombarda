<template>
  <div class="card-hand panel">
    <h4>Mano ({{ cards.length }})</h4>
    <div class="cards-grid">
      <div
        v-for="card in cards"
        :key="card"
        class="card-item"
        :class="{ selected: selectedCard === card }"
        @click="selectCard(card)"
      >
        <img :src="`/assets/CarteCittà/${card}.png`" :alt="card" class="card-img" />
        <span class="card-name">{{ card }}</span>
      </div>
    </div>

    <!-- Action buttons when card selected -->
    <div v-if="selectedCard" class="card-actions">
      <span class="selected-label">{{ selectedCard }}</span>
      <button class="primary" @click="playAs('conflitto')">Conflitto</button>
      <button class="primary" @click="playAs('recluta')">Recluta</button>
      <button class="primary" @click="playAs('potere')">Potere</button>
      <button class="secondary" @click="selectedCard = ''">Annulla</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/game';

const game = useGameStore();
const selectedCard = ref('');

const cards = computed(() => game.hand as string[]);

function selectCard(name: string) {
  selectedCard.value = selectedCard.value === name ? '' : name;
}

function playAs(action: string) {
  if (!selectedCard.value) return;
  game.doAction('play-card', { cardName: selectedCard.value, action });
  selectedCard.value = '';
}
</script>

<style scoped lang="scss">
.card-hand {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cards-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.card-item {
  width: 60px;
  cursor: pointer;
  text-align: center;
  border: 2px solid transparent;
  border-radius: 4px;
  padding: 2px;
  transition: border-color 0.2s;

  &.selected { border-color: $accent; }
  &:hover { border-color: $text-muted; }
}

.card-img {
  width: 100%;
  border-radius: 4px;
}

.card-name {
  font-size: 10px;
  color: $text-muted;
}

.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.selected-label {
  font-weight: bold;
  font-size: 13px;
  width: 100%;
}
</style>
