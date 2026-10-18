<script setup lang="ts">
import { lobby, socket } from './connection';
import { ref } from 'vue';

import HomePage from './components/pages/HomePage.vue';
import LobbyPage from './components/pages/LobbyPage.vue';
import GamePage from './components/pages/GamePage.vue';
import EndGamePage from './components/pages/EndGamePage.vue';
import LoadingSpinner from './components/LoadingSpinner.vue';

const connectionStatus = ref < 'loading' | 'connected' | 'disconnected' > ('loading');

socket.on('connect', () => {
  console.log('connected');
  connectionStatus.value = 'connected';
});

socket.on('connect_error', (err) => {
  console.log(`connect_error due to ${err.message}`);
  connectionStatus.value = 'disconnected';
});

</script>

<template>
  <!-- Connecting -->
  <div
    v-if="connectionStatus === 'loading'"
    class="h-screen v-screen flex justify-center items-center"
  >
    <LoadingSpinner :size="70" />
  </div>
  <!-- Connection error -->
  <div
    v-if="connectionStatus === 'disconnected'"
    class="h-screen v-screen flex justify-center items-center"
  >
    <h1>Não foi possível se conectar ao servidor.<br>Tente novamente mais tarde</h1>
  </div>
  <!-- Game over: final ranking -->
  <EndGamePage v-if="connectionStatus === 'connected' && lobby?.gameRanking" />
  <!-- In a game -->
  <GamePage v-else-if="connectionStatus === 'connected' && lobby?.game" />
  <!-- In a lobby -->
  <LobbyPage v-else-if="connectionStatus === 'connected' && lobby" />
  <!-- Connection success -->
  <HomePage v-else-if="connectionStatus === 'connected'" />
</template>

<style scoped>
</style>
