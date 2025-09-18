<!-- filepath: src/views/GameView.vue -->
<template>
  <div class="game-root">
    <aside class="sidebar">
      <h3>Fasi partita</h3>
      <ul>
        <li
          v-for="phaseItem in phases"
          :key="phaseItem.key"
          :class="{ active: phase.value === phaseItem.key }"
        >
          {{ phaseItem.label }}
        </li>
      </ul>
    </aside>

    <main class="main-area">
      <!-- Top: Barbarossa (parte alta) -->
      <section class="player-bar top-bar">
        <div class="player-info">
          <div class="player-name">{{ barbarossa.value.name }}</div>
          <div class="counters">
            <div class="counter">Cavalleria: <strong>{{ barbarossa.value.units.cavalleria }}</strong></div>
            <div class="counter">Vescovi: <strong>{{ barbarossa.value.units.vescovi }}</strong></div>
            <div class="counter">Mercanti: <strong>{{ barbarossa.value.units.mercanti }}</strong></div>
            <div class="counter">Riserve Cav.: <strong>{{ barbarossa.value.reserve.cavalleria }}</strong></div>
            <div class="counter">Riserve Vesc.: <strong>{{ barbarossa.value.reserve.vescovi }}</strong></div>
            <div class="counter">Riserve Merc.: <strong>{{ barbarossa.value.reserve.mercanti }}</strong></div>
          </div>
        </div>
        <div class="tokens">
          <div class="token">Round: {{ round.value }}</div>
          <div class="token">Controllo Italia: {{ controlloItalia.value }}</div>
        </div>
      </section>

      <!-- Centro: mappa placeholder -->
      <section class="map-area">
        <div class="map-placeholder">
          <div class="map-inner">
            <!-- Placeholder mappa e marker -->
            <div class="map-marker">🏰 Milano</div>
            <div class="control-token">🔵</div>
          </div>
        </div>
      </section>

      <!-- Bottom: Lega Lombarda (parte bassa) -->
      <section class="player-bar bottom-bar">
        <div class="player-info">
          <div class="player-name">{{ lega.value.name }}</div>
          <div class="counters">
            <div class="counter">Cavalleria: <strong>{{ lega.value.units.cavalleria }}</strong></div>
            <div class="counter">Vescovi: <strong>{{ lega.value.units.vescovi }}</strong></div>
            <div class="counter">Mercanti: <strong>{{ lega.value.units.mercanti }}</strong></div>
            <div class="counter">Riserve Cav.: <strong>{{ lega.value.reserve.cavalleria }}</strong></div>
            <div class="counter">Riserve Vesc.: <strong>{{ lega.value.reserve.vescovi }}</strong></div>
            <div class="counter">Riserve Merc.: <strong>{{ lega.value.reserve.mercanti }}</strong></div>
          </div>
        </div>
        <div class="tokens right-tokens">
          <!-- spazio per altri token se necessario -->
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useGameLogic } from '../composables/useGameLogic.js';

export default {
  setup() {
    const {
      phase,
      barbarossa,
      lega,
      controlloItalia,
      round,
    } = useGameLogic();

    const phases = [
      { key: 'menu', label: 'Menu' },
      { key: 'draft', label: 'Influenza (Draft)' },
      { key: 'initialPlacement', label: 'Piazzamento iniziale' },
      { key: 'showHands', label: 'Mostra mani' },
      { key: 'azioni', label: 'Azioni' },
      { key: 'risoluzione', label: 'Risoluzione' },
    ];

    return {
      phase,
      phases,
      barbarossa,
      lega,
      controlloItalia,
      round,
    };
  },
};
</script>

<style scoped>
.game-root {
  display: flex;
  height: 100vh;
  overflow: hidden;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}

/* Sidebar fasi */
.sidebar {
  width: 240px;
  background: #ffffff;
  border-right: 1px solid #e6e6e6;
  padding: 20px;
  box-sizing: border-box;
  text-align: center;
}
.sidebar h3 {
  margin-bottom: 12px;
  font-size: 1.05rem;
}
.sidebar ul {
  padding: 0;
  margin: 0;
}
.sidebar li {
  list-style: none;
  padding: 10px 8px;
  border-radius: 6px;
  margin: 8px 0;
  color: #333;
}
/* evidenzia la fase corrente in giallo e bold */
.sidebar li.active {
  background: #fff59d;
  font-weight: 700;
  color: #000;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
}

/* Main area / mappa */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #dff4d9; /* verde tenue per mappa */
}

/* player bars */
.player-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  box-sizing: border-box;
  min-height: 80px;
}
.top-bar {
  border-bottom: 1px solid rgba(0,0,0,0.06);
}
.bottom-bar {
  border-top: 1px solid rgba(0,0,0,0.06);
}
.player-name {
  font-weight: 700;
  margin-bottom: 6px;
}
.counters {
  display: flex;
  gap: 14px;
  align-items: center;
  flex-wrap: wrap;
}
.counter {
  background: rgba(255,255,255,0.85);
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.95rem;
}
.counter strong { margin-left: 6px; }

/* map area */
.map-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
}
.map-placeholder {
  width: 95%;
  height: 100%;
  background: linear-gradient(180deg, rgba(34,139,34,0.06), rgba(34,139,34,0.04));
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.map-inner {
  width: 98%;
  height: 95%;
  border: 2px dashed rgba(0,0,0,0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.map-marker {
  position: absolute;
  top: 20%;
  left: 30%;
  background: rgba(255,255,255,0.9);
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.95rem;
}
.control-token {
  position: absolute;
  right: 12%;
  bottom: 18%;
  font-size: 1.6rem;
}
.token {
  background: #fff;
  padding: 6px 10px;
  border-radius: 8px;
  margin-left: 8px;
}
</style>