<template>
  <div class="credits-container">
    <h2>Credits</h2>
    <p class="credits-text">
      <!-- Inserisci qui i credits -->
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    </p>
    <button @click="$emit('backToMenu')">Torna al Menu</button>
  </div>
</template>

<style scoped>
.credits-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 32px;
  background: #f9f9f9;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.07);
  text-align: center;
}
.credits-text {
  margin: 24px 0;
  font-size: 1.1rem;
  color: #444;
}
button {
  padding: 10px 28px;
  font-size: 1rem;
  background: #228b22;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
</style>