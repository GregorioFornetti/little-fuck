
<script setup lang="ts">
import { ref } from 'vue';
import HistoricModal from './HistoricModal.vue';
import JSONViewer from './JSONViewer.vue';

defineProps<{
  modalTitle: string,
  jsonLabel: string,
  jsonList: any[],
}>();

const showModal = ref(false);
</script>

<template>
  <div class="w-full h-full flex flex-col p-5 border-solid border-2 rounded-xl">
    <span class="font-bold ">{{ jsonLabel }}</span>
    <div class="grow overflow-auto">
      <JSONViewer :json="jsonList.length > 0 ? jsonList[jsonList.length - 1] : {}" />
    </div>

    <button
      class="grow-0 bg-blue-600 hover:bg-blue-800 text-white font-bold py-1 rounded w-40 mt-2"
      @click="showModal = true"
    >
      Abrir histórico
    </button>
  </div>

  <HistoricModal
    :title="modalTitle"
    :show="showModal"
    :json-label="jsonLabel"
    :json-list="jsonList"
    :close-modal="() => showModal = false"
  />
</template>
