<script setup lang="ts">
  import { io } from "socket.io-client"
  import { ref } from "vue";
  import HomePage from "./components/pages/HomePage.vue";

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
  <HomePage />
</template>

<style scoped>
</style>
