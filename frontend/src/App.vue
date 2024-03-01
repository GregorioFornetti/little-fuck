<script setup lang="ts">
  import { io } from "socket.io-client"

  const URL = process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000";

  const socket = io(URL)

  socket.on("message", (msg) => {
    alert(msg)
  })
</script>

<template>
  <div class="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4">
  <div class="shrink-0">

  </div>
  <div>
    <div class="text-xl font-medium text-black">Instalações</div>
    <p class="text-slate-500">Tailwind e Vue instalados com sucesso</p>
  </div>
  </div>
</template>

<style scoped>
</style>
