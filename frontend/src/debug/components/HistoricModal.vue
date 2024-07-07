
<script setup lang="ts">
import { ref } from 'vue';
import BaseModal from '@/components/modal/BaseModal.vue';
import { eventsHistoryList } from '../globals';
import JSONViewer from './JSONViewer.vue';

defineProps<{
  title: string,
  show: boolean,
  jsonLabel: string,
  jsonList: object[],
  closeModal?: () => void,
}>();

const index = ref(0);
</script>

<template>
  <BaseModal
    :show="show"
    :title="title"
    :close-modal="closeModal"
  >
    <template #body>
      <label class="text-white font-bold">Nome do evento: </label>
      <span class="text-white">{{ eventsHistoryList.length > 0 ? eventsHistoryList[index].event : "" }} </span>
      <br>
      <span class="text-white font-bold">{{ jsonLabel }}: </span>
      <div class="h-96 !mt-0">
        <JSONViewer :json="jsonList.length > 0 ? jsonList[index] : {}" />
      </div>
    </template>
    <template #footer>
      <div class="flex justify-between w-full">
        <button
          class="bg-blue-600 hover:bg-blue-800 text-white font-bold py-1 rounded w-40 disabled:opacity-50 disabled:hover:bg-blue-600"
          :disabled="index === 0"
          @click="index = Math.max(0, index - 1)"
        >
          Anterior
        </button>
        <div>
          <input
            v-model="index"
            class="bg-neutral-800 text-white font-bold py-1 rounded w-40 text-right w-14"
            type="number"
            :min="0"
            :max="Math.max(0, eventsHistoryList.length - 1)"
          >
          <span class="text-white"> / {{ Math.max(0, eventsHistoryList.length - 1) }}</span>
        </div>
        <button
          class="bg-blue-600 hover:bg-blue-800 text-white font-bold py-1 rounded w-40 disabled:opacity-50 disabled:hover:bg-blue-600"
          :disabled="index === Math.max(0, eventsHistoryList.length - 1)"
          @click="index = Math.min(Math.max(0, eventsHistoryList.length - 1), index + 1)"
        >
          Próximo
        </button>
      </div>
    </template>
  </BaseModal>
</template>
