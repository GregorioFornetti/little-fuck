
<script setup lang="ts">
import { ref } from 'vue';
import HistoricModal from './HistoricModal.vue';
import { eventsHistoryList } from '../globals';
import type { EventLog } from '../globals';

const showHistoricModal = ref(false);
</script>

<template>
  <div class="w-full h-full border-solid border-2 rounded-xl flex flex-col">
    <div class="border-solid border-b-2 text-center font-bold p-2">
      Histórico de eventos
    </div>
    <div class="grow overflow-y-scroll">
      <p
        v-for="(eventLog, index) in eventsHistoryList.slice().reverse()"
        :key="index"
        class="ml-4 mt-2 truncate"
      >
        {{ eventLog.event }}
      </p>
    </div>
    <div class="border-solid border-t-2">
      <button
        class="bg-blue-600 hover:bg-blue-800 text-white font-bold py-1 rounded-b-xl w-full"
        @click="showHistoricModal = true"
      >
        Histórico completo
      </button>
    </div>
  </div>

  <HistoricModal
    title="Histórico de eventos"
    :show="showHistoricModal"
    json-label="Parâmetros"
    :json-list="eventsHistoryList.map((event: EventLog) => event.params)"
    :close-modal="() => showHistoricModal = false"
  />
</template>
