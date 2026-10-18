<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import BaseModal from './modal/BaseModal.vue';
import SecundaryModalBtn from './modal/SecundaryModalBtn.vue';

defineProps<{
  show: boolean;
  closeModal: () => void;
}>();

const { t } = useI18n();

const sections = [
  'OBJECTIVE',
  'CARDS',
  'MATCHES',
  'GUESS',
  'ROUNDS',
  'SPECIAL'
] as const;
</script>

<template>
  <BaseModal
    :title="t('HOME.HOW_TO_PLAY')"
    :show="show"
    :close-modal="closeModal"
  >
    <template #body>
      <div class="max-h-[60vh] space-y-5 overflow-y-auto pr-1 text-left">
        <p class="text-base leading-relaxed text-gray-800 dark:text-gray-100">
          {{ t('HOME.HOW_TO_PLAY_CONTENT.INTRO') }}
        </p>
        <section
          v-for="section in sections"
          :key="section"
        >
          <h4 class="mb-1 font-serif text-lg font-bold text-emerald-900 dark:text-emerald-300">
            {{ t(`HOME.HOW_TO_PLAY_CONTENT.${section}_TITLE`) }}
          </h4>
          <p class="leading-relaxed text-gray-700 dark:text-gray-200">
            {{ t(`HOME.HOW_TO_PLAY_CONTENT.${section}`) }}
          </p>
        </section>
      </div>
    </template>

    <template #footer>
      <SecundaryModalBtn @click="closeModal">
        {{ t('HOME.CLOSE') }}
      </SecundaryModalBtn>
    </template>
  </BaseModal>
</template>
