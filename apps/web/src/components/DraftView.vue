<template>
  <div class="draft-view panel">
    <h4>Draft — Step {{ draftStep }}</h4>
    <p class="hint" v-if="draftStep === 1">Scegli 1 carta da tenere, 1 da passare</p>
    <p class="hint" v-else>Scegli 1 carta da tenere, 2 da scartare</p>

    <div class="draft-cards">
      <div
        v-for="card in availableCards"
        :key="card"
        class="draft-card"
        :class="{ kept: kept.includes(card), passed: passed.includes(card) }"
        @click="toggleCard(card)"
      >
        <img :src="`/assets/CarteCittà/${card}.png`" :alt="card" class="card-img" />
        <span class="card-label">{{ card }}</span>
        <span v-if="kept.includes(card)" class="tag keep-tag">TENGO</span>
        <span v-if="passed.includes(card)" class="tag pass-tag">PASSO</span>
      </div>
    </div>

    <button class="primary" :disabled="!canConfirm" @click="confirmDraft">Conferma</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/game';

const game = useGameStore();

const kept = ref<string[]>([]);
const passed = ref<string[]>([]);

const draftStep = computed(() => (game.draftState as any)?.step ?? 1);
const availableCards = computed(() => (game.draftState as any)?.availableCards ?? []);

const keepCount = computed(() => (draftStep.value === 1 ? 1 : 1));
const passCount = computed(() => (draftStep.value === 1 ? 1 : 2));

const canConfirm = computed(() => kept.value.length === keepCount.value && passed.value.length === passCount.value);

function toggleCard(card: string) {
  // Remove from both arrays first
  kept.value = kept.value.filter((c) => c !== card);
  passed.value = passed.value.filter((c) => c !== card);

  // Try to add to kept
  if (kept.value.length < keepCount.value) {
    kept.value.push(card);
  } else if (passed.value.length < passCount.value) {
    passed.value.push(card);
  }
}

function confirmDraft() {
  game.doAction('draft', { kept: kept.value, passed: passed.value });
  kept.value = [];
  passed.value = [];
}
</script>

<style scoped lang="scss">
.draft-view {
  display: flex;
  flex-direction: column;
  gap: $gap;
}

.hint {
  font-size: 13px;
  color: $text-muted;
}

.draft-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.draft-card {
  width: 70px;
  text-align: center;
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 6px;
  padding: 4px;
  position: relative;

  &.kept { border-color: $success; }
  &.passed { border-color: $warning; }
}

.card-img {
  width: 100%;
  border-radius: 4px;
}

.card-label {
  font-size: 11px;
  display: block;
}

.tag {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 8px;
  font-weight: bold;
  padding: 1px 4px;
  border-radius: 3px;
}

.keep-tag { background: $success; color: #000; }
.pass-tag { background: $warning; color: #000; }
</style>
