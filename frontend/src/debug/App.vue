<script setup lang="ts">
  import { socket, lobby } from "@/connection";
  import { addHandlersForDebugMode } from "@/debug/handlers/addHandlersForDebugMode";

  addHandlersForDebugMode(socket);

  import { ref } from "vue";
  import Spinner from "@/components/Spinner.vue";

  const connectionStatus = ref<"loading" | "connected" | "disconnected">("loading")

  socket.on("connect", () => {
    console.log("connected")
    connectionStatus.value = "connected"
  });

  socket.on("connect_error", (err) => {
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
  <div v-if="connectionStatus === 'connected'">
    <h1>conectou</h1>
  </div>
</template>