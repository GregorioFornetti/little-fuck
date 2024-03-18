<script setup lang="ts">
  import "./global.ts"
  import { io } from "socket.io-client"
  import { ref } from "vue";

  import HomePage from "./components/pages/HomePage.vue";
  import Spinner from "./components/Spinner.vue";

  const connectionStatus = ref<"loading" | "connected" | "disconnected">("loading")

  const rootUrl: string = process.env.NODE_ENV === 'development' ?
                        'localhost:3000' :
                         window.location.host
  globalThis.socket = io(
    rootUrl, {
      autoConnect: false,
      path: `${import.meta.env.VITE_SERVER_PATH || ''}/socket.io/`
    }
  )
  globalThis.socket.connect()

  globalThis.socket.on("connect", () => {
    console.log("connected")
    connectionStatus.value = "connected"
  });

  globalThis.socket.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
    connectionStatus.value = "disconnected"
  });
</script>

<template>
  <!-- Connecting -->
  <div class="h-screen v-screen flex justify-center items-center" v-if="connectionStatus === 'loading'">
    <Spinner :size="70" />
  </div>
  <!-- Connection error -->
  <div class="h-screen v-screen flex justify-center items-center" v-if="connectionStatus === 'disconnected'">
    <h1>Não foi possível se conectar ao servidor.<br>Tente novamente mais tarde</h1>
  </div>
  <!-- Connection success -->
  <HomePage v-if="connectionStatus === 'connected'" />
</template>

<style scoped>
</style>
