
<script setup lang="ts">
import { frontendLobbyHistoryList, backendLobbyHistoryList } from '@/debug/globals';

import LobbyContainer from '@/debug/components/LobbyContainer.vue';
import EventsContainer from '@/debug/components/EventsContainer.vue';
import NextEventTimer from '@/debug/components/NextEventTimer.vue';
import CommandsContainer from '@/debug/components/CommandsContainer/CommandsContainer.vue';
</script>

<template>
  <div class="w-full h-screen flex justify-center">
    <div class="max-w-screen-2xl w-full h-full grid grid-cols-5 grid-rows-5 gap-5 p-5">
      <div class="row-span-full col-span-2">
        <LobbyContainer
          modal-title="Frontend Lobby History"
          json-label="Frontend Lobby"
          :json-list="frontendLobbyHistoryList"
        />
      </div>
      <div class="row-span-full col-span-2">
        <LobbyContainer
          modal-title="Backend Lobby History"
          json-label="Backend Lobby"
          :json-list="backendLobbyHistoryList"
        />
      </div>
      <div>
        <NextEventTimer
          :next-event-time="10"
          next-event-name="start-game-request"
        />
      </div>
      <div class="row-span-4">
        <EventsContainer />
      </div>
    </div>
  </div>
  <CommandsContainer />
</template>
