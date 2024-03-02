<script setup lang="ts">
  import { io } from "socket.io-client"

  const rootUrl: string = process.env.NODE_ENV === 'development' ?
                        'localhost:3000' :
                         window.location.host
  const socket = io(
    rootUrl, {
      autoConnect: false,
      path: `${import.meta.env.VITE_SERVER_PATH || ''}/socket.io/`
    }
  )
  socket.connect()

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
