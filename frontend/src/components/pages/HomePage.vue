<script setup lang="ts">
import { ref } from 'vue';
import { eventsEmitter, eventsListenersAdder } from '@/connection';
import BaseModal from '../modal/BaseModal.vue';
import PrimaryModalBtn from '../modal/PrimaryModalBtn.vue';
import SecundaryModalBtn from '../modal/SecundaryModalBtn.vue';
import ModalInput from '../modal/ModalInput.vue';

import LoadingSpinner from '../LoadingSpinner.vue';
import type { Lobby } from '@/interfaces/Lobby';

type JoinLobbyErrorType = 'lobby-in-game'|'inexistent-lobby'|'no-name'|'repeated-name'|'player-already-in-lobby'

const createLobbyModalStatus = ref<'closed'|'input'|'loading'|'error'>('closed');
const joinLobbyModalStatus = ref<'closed'|'input'|'loading'|'error'>('closed');

const createLobbyName = ref('');
const joinLobbyCode = ref('');
const joinLobbyName = ref('');
const errorType = ref<JoinLobbyErrorType>('inexistent-lobby');

const errorMessageMap: Record<JoinLobbyErrorType, string> = {
  'lobby-in-game': 'A sala já está em jogo',
  'inexistent-lobby': 'A sala não existe',
  'no-name': 'Digite um nome',
  'repeated-name': 'Nome já em uso',
  'player-already-in-lobby': 'Você já está em uma sala'
};

const openCreateLobbyModal = () => {
  createLobbyModalStatus.value = 'input';
};

const openJoinLobbyModal = () => {
  joinLobbyModalStatus.value = 'input';
};

const closeCreateLobbyModal = () => {
  createLobbyModalStatus.value = 'closed';
  createLobbyName.value = '';
};

const closeJoinLobbyModal = () => {
  joinLobbyModalStatus.value = 'closed';
  joinLobbyCode.value = '';
  joinLobbyName.value = '';
};

const createLobby = () => {
  eventsEmitter.lobby.emitCreateLobby(createLobbyName.value);
  createLobbyModalStatus.value = 'loading';
};

eventsListenersAdder.lobby.joinLobbySuccess((_lobby: Lobby) => {
  closeJoinLobbyModal();
  closeCreateLobbyModal();
  console.log('join-lobby-success');
});

eventsListenersAdder.lobby.joinLobbyError((errorTypeParam: JoinLobbyErrorType) => {
  if (joinLobbyModalStatus.value === 'loading') {
    joinLobbyModalStatus.value = 'error';
  } else if (createLobbyModalStatus.value === 'loading') {
    createLobbyModalStatus.value = 'error';
  }

  errorType.value = errorTypeParam;
});
</script>

<template>
  <div class="w-screen h-screen flex justify-center items-center">
    <div class="p-12 flex flex-col gap-y-10">
      <button
        class="text-white bg-sky-500/100 hover:bg-blue-600 py-3 rounded-3xl px-10"
        @click="openCreateLobbyModal"
      >
        Criar uma sala
      </button>
      <button
        class="text-white bg-sky-500/100 hover:bg-blue-600 py-3 rounded-3xl px-10"
        @click="openJoinLobbyModal"
      >
        Entrar em uma sala
      </button>
    </div>
  </div>

  <!-- CreateLobbyModal -->
  <BaseModal
    title="Criar uma sala"
    :show="createLobbyModalStatus !== 'closed'"
    :close-modal="createLobbyModalStatus !== 'loading' ? closeCreateLobbyModal : undefined"
  >
    <template #body>
      <!-- input -->
      <div v-if="createLobbyModalStatus === 'input'">
        <ModalInput
          v-model="createLobbyName"
          label="Nome do jogador"
        />
      </div>
      <!-- waiting response -->
      <div
        v-if="createLobbyModalStatus === 'loading'"
        class="flex items-center justify-center"
      >
        <LoadingSpinner :size="50" />
      </div>
      <!-- error -->
      <div v-if="createLobbyModalStatus === 'error'">
        <p class="text-center">
          {{ errorMessageMap[errorType] }}
        </p>
      </div>
    </template>

    <template #footer>
      <!-- input -->
      <div v-if="createLobbyModalStatus === 'input'">
        <PrimaryModalBtn @click="createLobby">
          Criar sala
        </PrimaryModalBtn>
        <SecundaryModalBtn @click="closeCreateLobbyModal">
          Fechar
        </SecundaryModalBtn>
      </div>
      <!-- waiting response -->
      <div v-if="createLobbyModalStatus === 'loading'" />
      <!-- error -->
      <div v-if="createLobbyModalStatus === 'error'">
        <PrimaryModalBtn @click="openCreateLobbyModal">
          Voltar
        </PrimaryModalBtn>
        <SecundaryModalBtn @click="closeCreateLobbyModal">
          Fechar
        </SecundaryModalBtn>
      </div>
    </template>
  </BaseModal>

  <!-- JoinLobbyModal -->
  <BaseModal
    title="Entrar em uma sala"
    :show="joinLobbyModalStatus !== 'closed'"
    :close-modal="joinLobbyModalStatus !== 'loading' ? closeJoinLobbyModal : undefined"
  >
    <template #body>
      <!-- input -->
      <div
        v-if="joinLobbyModalStatus === 'input'"
        class="flex gap-y-5 flex-col"
      >
        <ModalInput
          v-model="joinLobbyCode"
          label="Código da sala"
        />
        <ModalInput
          v-model="joinLobbyName"
          label="Nome do jogador"
        />
      </div>
      <!-- waiting response -->
      <div
        v-if="joinLobbyModalStatus === 'loading'"
        class="flex items-center justify-center"
      >
        <LoadingSpinner :size="50" />
      </div>
      <!-- error -->
      <div v-if="joinLobbyModalStatus === 'error'">
        <p class="text-center">
          {{ errorMessageMap[errorType] }}
        </p>
      </div>
    </template>

    <template #footer>
      <!-- input -->
      <div v-if="joinLobbyModalStatus === 'input'">
        <PrimaryModalBtn @click="closeJoinLobbyModal">
          Entrar na sala
        </PrimaryModalBtn>
        <SecundaryModalBtn @click="closeJoinLobbyModal">
          Fechar
        </SecundaryModalBtn>
      </div>
      <!-- waiting response -->
      <div v-if="joinLobbyModalStatus === 'loading'" />
      <!-- error -->
      <div v-if="joinLobbyModalStatus === 'error'">
        <PrimaryModalBtn @click="openJoinLobbyModal">
          Voltar
        </PrimaryModalBtn>
        <SecundaryModalBtn @click="closeJoinLobbyModal">
          Fechar
        </SecundaryModalBtn>
      </div>
    </template>
  </BaseModal>
</template>
