<template>
  <div class="menu-bg">
    <div class="menu-card">
      <header class="menu-header">
        <div class="logo">🏛️</div>
        <h1>Barbarossa</h1>
        <p class="subtitle">Gioco di strategia storica — Lega Lombarda vs Federico</p>
      </header>

      <nav class="menu-nav" aria-label="Menu principale">
        <ul>
          <li v-for="item in menuItems" :key="item.action">
            <button class="menu-btn" @click="onClick(item.action)">
              <span class="icon" v-if="item.action === 'newGame'">🎲</span>
              <span class="icon" v-else-if="item.action === 'reviewGame'">📜</span>
              <span class="icon" v-else-if="item.action === 'credits'">ℹ️</span>
              <span class="icon" v-else-if="item.action === 'exit'">🚪</span>
              <span class="label">{{ item.label }}</span>
            </button>
          </li>
        </ul>
      </nav>

      <footer class="menu-footer">
        <small>Versione di sviluppo — salva spesso</small>
      </footer>
    </div>
  </div>
</template>

<script>
import { useGameLogic } from '../composables/useGameLogic.js';

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
.menu-bg {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #f3f8f3 0%, #eaf6ea 100%);
  padding: 40px 20px;
  box-sizing: border-box;
}
.menu-card {
  width: 720px;
  max-width: calc(100% - 40px);
  background: rgba(255,255,255,0.95);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(34,139,34,0.08);
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  align-items: center;
}
.menu-header { text-align:center; }
.menu-header .logo { font-size:48px; margin-bottom:6px; }
.menu-header h1 { margin:0; font-size:1.9rem; }
.subtitle { color:#597a59; font-size:0.95rem; margin-top:6px; }
.menu-nav ul { list-style:none; padding:0; margin:0; width:100%; display:flex; flex-direction:column; gap:12px; align-items:center; }
.menu-btn {
  width:100%; max-width:520px; display:flex; align-items:center; gap:12px; padding:14px 18px;
  border:none; border-radius:12px; background:linear-gradient(90deg, rgba(34,139,34,0.06), rgba(34,139,34,0.03));
  cursor:pointer; transition:transform .12s, box-shadow .12s; box-shadow:0 6px 12px rgba(0,0,0,0.04); font-size:1.1rem; color:#123812;
}
.menu-btn .icon { font-size:1.4rem; width:30px; text-align:center; }
.menu-btn .label { flex:1; text-align:left; font-weight:600; }
.menu-btn:hover, .menu-btn:focus { transform:translateY(-4px); box-shadow:0 14px 30px rgba(34,139,34,0.10); outline:none; }
.menu-footer { margin-top:6px; color:#6b886b; font-size:0.85rem; }
@media (max-width:600px) { .menu-card { padding:18px; } .menu-header h1 { font-size:1.5rem; } .menu-btn { max-width:100%; padding:12px; font-size:1rem; } }
</style>