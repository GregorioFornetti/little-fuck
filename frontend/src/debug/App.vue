<script setup lang="ts">
import { socket } from '@/connection';
import { addHandlersForDebugMode } from '@/debug/handlers/addHandlersForDebugMode';

addHandlersForDebugMode(socket);

import { ref } from 'vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import DebugPage from './components/DebugPage.vue';

const connectionStatus = ref<'loading' | 'connected' | 'disconnected'>('loading');

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
  <!-- Connection success -->
  <div v-if="connectionStatus === 'connected'">
    <DebugPage />
  </div>
</template>
