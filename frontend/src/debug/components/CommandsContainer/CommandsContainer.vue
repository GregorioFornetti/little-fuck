<script setup lang="ts">
import { eventsEmitter } from '@/connection';
import { ref } from 'vue';
import CommandBox from './CommandBox.vue';
import CommandsContainerInput from './CommandsContainerInput.vue';

const createLobbyPlayerName = ref('');

const joinLobbyPlayerName = ref('');
const joinLobbyLobbyId = ref('');

const winRoundsNumber = ref(0);

const selectedCardIndex = ref(0);
</script>

<template>
  <div class="flex flex-wrap gap-5 m-auto lg:max-w-screen-lg md:max-w-screen-sm sm:max-w-screen-sm justify-center">
    <!-- join-lobby -->
    <CommandBox
      box-title="Join Lobby"
      btn-text="Join"
      :btn-on-click="() => eventsEmitter.lobby.emitJoinLoby(joinLobbyLobbyId, joinLobbyPlayerName)"
    >
      <CommandsContainerInput
        v-model="joinLobbyPlayerName"
        placeholder="Player name"
        input-type="text"
      />
      <CommandsContainerInput
        v-model="joinLobbyLobbyId"
        placeholder="Lobby id"
        input-type="text"
      />
    </CommandBox>

    <!-- create-lobby -->
    <CommandBox
      box-title="Create Lobby"
      btn-text="Create"
      :btn-on-click="() => eventsEmitter.lobby.emitCreateLobby(createLobbyPlayerName)"
    >
      <CommandsContainerInput
        v-model="createLobbyPlayerName"
        placeholder="Player name"
        input-type="text"
      />
    </CommandBox>

    <!-- win-rounds-number-response -->
    <CommandBox
      box-title="Win Rounds Number"
      btn-text="Send"
      :btn-on-click="() => eventsEmitter.match.emitWinRoundsNumberResponse(winRoundsNumber)"
    >
      <CommandsContainerInput
        v-model="winRoundsNumber"
        placeholder="Number of rounds"
        input-type="number"
      />
    </CommandBox>

    <!-- select-card -->
    <CommandBox
      box-title="Select Card"
      btn-text="Select"
      :btn-on-click="() => eventsEmitter.round.emitSelectCard(selectedCardIndex)"
    >
      <CommandsContainerInput
        v-model="selectedCardIndex"
        placeholder="Card index"
        input-type="number"
      />
    </CommandBox>

    <!-- ready -->
    <CommandBox
      box-title="Ready"
      btn-text="Ready"
      :btn-on-click="() => eventsEmitter.lobby.emitReady()"
    />

    <!-- unready -->
    <CommandBox
      box-title="Unready"
      btn-text="Unready"
      :btn-on-click="() => eventsEmitter.lobby.emitUnready()"
    />

    <!-- start-game -->
    <CommandBox
      box-title="Start Game"
      btn-text="Start"
      :btn-on-click="() => eventsEmitter.lobby.emitStartGameRequest()"
    />

    <!-- logout -->
    <CommandBox
      box-title="Logout"
      btn-text="Logout"
      :btn-on-click="() => eventsEmitter.general.emitLogout()"
    />
  </div>
</template>
