<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { eventsEmitter, eventsListenersAdder, lobby } from '@/connection';
import type { GameOptions } from '@/interfaces/Lobby';
import BaseModal from './modal/BaseModal.vue';
import SecundaryModalBtn from './modal/SecundaryModalBtn.vue';
import { getLobbyOptions } from './pages/gameState';

const props = defineProps<{
  show: boolean;
  isLeader: boolean;
  closeModal: () => void;
}>();

const { t } = useI18n();

type OptionsErrorType = 'not-leader' | 'already-in-game' | 'not-in-lobby' | 'invalid-options';

const errorType = ref<OptionsErrorType | null>(null);

const errorMessage = computed(() => {
  if (!errorType.value) return '';
  const messages: Record<OptionsErrorType, string> = {
    'not-leader': t('OPTIONS.ERROR_NOT_LEADER'),
    'already-in-game': t('OPTIONS.ERROR_ALREADY_IN_GAME'),
    'invalid-options': t('OPTIONS.INVALID'),
    'not-in-lobby': t('OPTIONS.ERROR_GENERIC')
  };
  return messages[errorType.value];
});

const options = computed<GameOptions>(() => getLobbyOptions(lobby.value));

const withCurrent = (choices: number[], current: number) =>
  [...new Set([...choices, current])].sort((a, b) => a - b);

const livesChoices = computed(() =>
  withCurrent(Array.from({ length: 10 }, (_, i) => i + 1), options.value.initialHealth)
);
const actionTimeChoices = computed(() =>
  withCurrent([10, 15, 18, 20, 25, 30, 40, 60], options.value.playerActionTimeSeconds)
);
const roundEndChoices = computed(() =>
  withCurrent([3, 5, 10, 15, 20, 30], options.value.roundEndTimeSeconds)
);

const updateOptions = (patch: Partial<GameOptions>) => {
  if (!props.isLeader) return;
  errorType.value = null;
  eventsEmitter.lobby.emitUpdateOptions({ ...options.value, ...patch });
};

const onLivesChange = (event: Event) => {
  updateOptions({ initialHealth: Number((event.target as HTMLSelectElement).value) });
};
const onActionTimeChange = (event: Event) => {
  updateOptions({ playerActionTimeSeconds: Number((event.target as HTMLSelectElement).value) });
};
const onRoundEndChange = (event: Event) => {
  updateOptions({ roundEndTimeSeconds: Number((event.target as HTMLSelectElement).value) });
};
const onCardTypeChange = (event: Event) => {
  updateOptions({ cardType: (event.target as HTMLSelectElement).value as GameOptions['cardType'] });
};

eventsListenersAdder.lobby.optionsError((type: OptionsErrorType) => {
  errorType.value = type;
});

onBeforeUnmount(() => {
  errorType.value = null;
});
</script>

<template>
  <BaseModal
    :title="t('OPTIONS.TITLE')"
    :show="show"
    :close-modal="closeModal"
  >
    <template #body>
      <div class="space-y-4 text-left">
        <p
          v-if="!isLeader"
          class="rounded bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-900 dark:bg-amber-900/40 dark:text-amber-200"
        >
          {{ t('OPTIONS.LEADER_ONLY') }}
        </p>

        <label class="block">
          <span class="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-200">
            {{ t('OPTIONS.INITIAL_LIVES') }}
          </span>
          <select
            :value="options.initialHealth"
            :disabled="!isLeader"
            class="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            @change="onLivesChange"
          >
            <option
              v-for="value in livesChoices"
              :key="value"
              :value="value"
            >
              {{ value }}
            </option>
          </select>
        </label>

        <label class="block">
          <span class="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-200">
            {{ t('OPTIONS.ACTION_TIME') }}
          </span>
          <select
            :value="options.playerActionTimeSeconds"
            :disabled="!isLeader"
            class="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            @change="onActionTimeChange"
          >
            <option
              v-for="value in actionTimeChoices"
              :key="value"
              :value="value"
            >
              {{ value }}s
            </option>
          </select>
        </label>

        <label class="block">
          <span class="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-200">
            {{ t('OPTIONS.ROUND_END_TIME') }}
          </span>
          <select
            :value="options.roundEndTimeSeconds"
            :disabled="!isLeader"
            class="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            @change="onRoundEndChange"
          >
            <option
              v-for="value in roundEndChoices"
              :key="value"
              :value="value"
            >
              {{ value }}s
            </option>
          </select>
        </label>

        <label class="block">
          <span class="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-200">
            {{ t('OPTIONS.CARD_TYPE') }}
          </span>
          <select
            :value="options.cardType"
            :disabled="!isLeader"
            class="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            @change="onCardTypeChange"
          >
            <option value="numbered">
              {{ t('OPTIONS.CARD_TYPE_NUMBERED') }}
            </option>
            <option value="manilha-velha">
              {{ t('OPTIONS.CARD_TYPE_MANILHA_VELHA') }}
            </option>
          </select>
          <span class="mt-1 block text-sm text-gray-500 dark:text-gray-400">
            {{ t('OPTIONS.CARD_TYPE_MANILHA_VELHA_DESC') }}
          </span>
        </label>

        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ t('OPTIONS.APPLIES_BEFORE_START') }}
        </p>
        <p
          v-if="errorType"
          role="alert"
          class="text-center font-semibold text-red-600 dark:text-red-400"
        >
          {{ errorMessage }}
        </p>
      </div>
    </template>

    <template #footer>
      <SecundaryModalBtn @click="closeModal">
        {{ t('OPTIONS.CLOSE') }}
      </SecundaryModalBtn>
    </template>
  </BaseModal>
</template>
