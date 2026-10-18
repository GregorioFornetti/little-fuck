<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { eventsEmitter, eventsListenersAdder } from '@/connection';
import BaseModal from '../modal/BaseModal.vue';
import PrimaryModalBtn from '../modal/PrimaryModalBtn.vue';
import SecundaryModalBtn from '../modal/SecundaryModalBtn.vue';
import ModalInput from '../modal/ModalInput.vue';
import AppHeader from '../AppHeader.vue';
import HowToPlayModal from '../HowToPlayModal.vue';

import LoadingSpinner from '../LoadingSpinner.vue';
import type { Lobby } from '@/interfaces/Lobby';

type JoinLobbyErrorType = 'lobby-in-game'|'inexistent-lobby'|'no-name'|'repeated-name'|'player-already-in-lobby'

const { t } = useI18n();

const createLobbyModalStatus = ref<'closed'|'input'|'loading'|'error'>('closed');
const joinLobbyModalStatus = ref<'closed'|'input'|'loading'|'error'>('closed');
const howToPlayModalStatus = ref<'closed'|'open'>('closed');

const createLobbyName = ref('');
const joinLobbyCode = ref('');
const joinLobbyName = ref('');
const errorType = ref<JoinLobbyErrorType>('inexistent-lobby');

const errorMessageKeyMap: Record<JoinLobbyErrorType, string> = {
  'lobby-in-game': 'HOME.ERRORS.LOBBY_IN_GAME',
  'inexistent-lobby': 'HOME.ERRORS.INEXISTENT_LOBBY',
  'no-name': 'HOME.ERRORS.NO_NAME',
  'repeated-name': 'HOME.ERRORS.REPEATED_NAME',
  'player-already-in-lobby': 'HOME.ERRORS.PLAYER_ALREADY_IN_LOBBY'
};

const errorMessage = computed(() => t(errorMessageKeyMap[errorType.value]));

const openCreateLobbyModal = () => {
  createLobbyModalStatus.value = 'input';
};

const openJoinLobbyModal = () => {
  joinLobbyModalStatus.value = 'input';
};

const openHowToPlayModal = () => {
  howToPlayModalStatus.value = 'open';
};

const closeHowToPlayModal = () => {
  howToPlayModalStatus.value = 'closed';
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

const joinLobby = () => {
  eventsEmitter.lobby.emitJoinLoby(joinLobbyCode.value, joinLobbyName.value);
  joinLobbyModalStatus.value = 'loading';
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
  <div class="card-table flex min-h-screen w-screen flex-col text-white">
    <AppHeader />

    <main class="flex flex-1 items-center justify-center px-4 py-10">
      <div class="flex w-full max-w-sm flex-col items-center">
        <div
          aria-hidden="true"
          class="mb-8 flex gap-3"
        >
          <span
            v-for="card in ['16', '12', '7', '1']"
            :key="card"
            class="flex h-24 w-16 items-center justify-center rounded-md bg-white font-serif text-2xl font-bold shadow-lg"
            :class="card === '16' ? 'text-red-700' : 'text-gray-900'"
          >
            {{ card }}
          </span>
        </div>

        <nav class="flex w-full flex-col gap-4">
          <button
            type="button"
            class="w-full rounded-full bg-amber-400 px-10 py-3 font-serif text-lg font-bold text-emerald-950 shadow hover:bg-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-200/60"
            @click="openCreateLobbyModal"
          >
            {{ t('HOME.CREATE_GAME') }}
          </button>
          <button
            type="button"
            class="w-full rounded-full bg-white px-10 py-3 font-serif text-lg font-bold text-emerald-900 shadow hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-white/40"
            @click="openJoinLobbyModal"
          >
            {{ t('HOME.JOIN_GAME') }}
          </button>
          <button
            type="button"
            class="w-full rounded-full border-2 border-white/70 px-10 py-3 font-serif text-lg font-bold text-white hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-white/30"
            @click="openHowToPlayModal"
          >
            {{ t('HOME.HOW_TO_PLAY') }}
          </button>
        </nav>
      </div>
    </main>
  </div>

  <HowToPlayModal
    :show="howToPlayModalStatus === 'open'"
    :close-modal="closeHowToPlayModal"
  />

  <!-- CreateLobbyModal -->
  <BaseModal
    :title="t('HOME.CREATE_ROOM')"
    :show="createLobbyModalStatus !== 'closed'"
    :close-modal="createLobbyModalStatus !== 'loading' ? closeCreateLobbyModal : undefined"
  >
    <template #body>
      <!-- input -->
      <div v-if="createLobbyModalStatus === 'input'">
        <ModalInput
          v-model="createLobbyName"
          :label="t('HOME.PLAYER_NAME')"
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
          {{ errorMessage }}
        </p>
      </div>
    </template>

    <template #footer>
      <!-- input -->
      <div v-if="createLobbyModalStatus === 'input'">
        <PrimaryModalBtn @click="createLobby">
          {{ t('HOME.CREATE') }}
        </PrimaryModalBtn>
        <SecundaryModalBtn @click="closeCreateLobbyModal">
          {{ t('HOME.CLOSE') }}
        </SecundaryModalBtn>
      </div>
      <!-- waiting response -->
      <div v-if="createLobbyModalStatus === 'loading'" />
      <!-- error -->
      <div v-if="createLobbyModalStatus === 'error'">
        <PrimaryModalBtn @click="openCreateLobbyModal">
          {{ t('HOME.BACK') }}
        </PrimaryModalBtn>
        <SecundaryModalBtn @click="closeCreateLobbyModal">
          {{ t('HOME.CLOSE') }}
        </SecundaryModalBtn>
      </div>
    </template>
  </BaseModal>

  <!-- JoinLobbyModal -->
  <BaseModal
    :title="t('HOME.JOIN_ROOM')"
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
          :label="t('HOME.ROOM_CODE')"
        />
        <ModalInput
          v-model="joinLobbyName"
          :label="t('HOME.PLAYER_NAME')"
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
          {{ errorMessage }}
        </p>
      </div>
    </template>

    <template #footer>
      <!-- input -->
      <div v-if="joinLobbyModalStatus === 'input'">
        <PrimaryModalBtn @click="joinLobby">
          {{ t('HOME.JOIN') }}
        </PrimaryModalBtn>
        <SecundaryModalBtn @click="closeJoinLobbyModal">
          {{ t('HOME.CLOSE') }}
        </SecundaryModalBtn>
      </div>
      <!-- waiting response -->
      <div v-if="joinLobbyModalStatus === 'loading'" />
      <!-- error -->
      <div v-if="joinLobbyModalStatus === 'error'">
        <PrimaryModalBtn @click="openJoinLobbyModal">
          {{ t('HOME.BACK') }}
        </PrimaryModalBtn>
        <SecundaryModalBtn @click="closeJoinLobbyModal">
          {{ t('HOME.CLOSE') }}
        </SecundaryModalBtn>
      </div>
    </template>
  </BaseModal>
</template>

<style scoped>
.card-table {
  background:
    radial-gradient(ellipse 90% 70% at 50% 42%, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 55%),
    radial-gradient(ellipse at center, #22784a 0%, #175e36 48%, #0d3d22 78%, #082a17 100%);
  box-shadow: inset 0 0 180px rgba(0, 0, 0, 0.55);
}
</style>
