<template>
  <div class="login-page">
    <div class="login-card panel">
      <img src="/assets/Mappa/0_small.png" alt="Barbarossa" class="logo" />
      <h1>Barbarossa</h1>
      <p class="subtitle">Lega Lombarda</p>

      <form @submit.prevent="handleSubmit" class="form">
        <input v-model="username" placeholder="Nome utente" autocomplete="username" required />
        <input v-model="password" type="password" placeholder="Password" autocomplete="current-password" required />
        <button type="submit" class="primary" :disabled="loading">
          {{ isRegister ? 'Registrati' : 'Accedi' }}
        </button>
      </form>

      <div class="actions">
        <button class="secondary" @click="isRegister = !isRegister">
          {{ isRegister ? 'Ho già un account' : 'Crea account' }}
        </button>
        <button class="secondary" @click="handleGuest" :disabled="loading">Entra come ospite</button>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const username = ref('');
const password = ref('');
const isRegister = ref(false);
const loading = ref(false);
const error = ref('');

async function handleSubmit() {
  loading.value = true;
  error.value = '';
  try {
    if (isRegister.value) {
      await auth.doRegister(username.value, password.value);
    } else {
      await auth.doLogin(username.value, password.value);
    }
  } catch (e: unknown) {
    error.value = (e as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Errore di connessione';
  } finally {
    loading.value = false;
  }
}

async function handleGuest() {
  loading.value = true;
  error.value = '';
  try {
    await auth.doGuest();
  } catch {
    error.value = 'Impossibile creare profilo ospite';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped lang="scss">
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.login-card {
  width: 360px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: $gap;
}

.logo {
  width: 100px;
  margin: 0 auto;
}

.subtitle {
  color: $text-muted;
  font-style: italic;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.actions {
  display: flex;
  gap: 8px;
  button { flex: 1; }
}

.error {
  color: $accent;
  font-size: 13px;
}
</style>
