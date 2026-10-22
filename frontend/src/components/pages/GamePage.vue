<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { eventsEmitter, lobby, playerId } from '@/connection';
import AppHeader from '../AppHeader.vue';
import PlayingCard from '../PlayingCard.vue';
import RoundTable from '../RoundTable.vue';
import { findCurrentPlayer } from './lobbyReady';
import {
  getCountdownKey,
  getLobbyOptions,
  getCountdownSeconds,
  getForbiddenGuess,
  getGamePhase,
  getTurnPlayerId,
  isSpecialMatch
} from './gameState';
import type { RoundCard } from '@/interfaces/Lobby';

const { t } = useI18n();

const game = computed(() => lobby.value?.game);
const match = computed(() => game.value?.match);
const phase = computed(() => getGamePhase(game.value));
const special = computed(() => isSpecialMatch(match.value));

const currentPlayer = computed(() =>
  lobby.value ? findCurrentPlayer(lobby.value.players, playerId) : undefined
);
const turnPlayerId = computed(() => getTurnPlayerId(game.value));
const turnPlayerName = computed(() =>
  lobby.value?.players.find((player) => player.id === turnPlayerId.value)?.name ?? ''
);
const isMyTurn = computed(
  () => currentPlayer.value !== undefined && turnPlayerId.value === currentPlayer.value.id
);

// Countdown to the next automatic action.
// The backend does not send the remaining time.
// The window restarts locally whenever the game state shows the backend restarted its timer.
const lastRound = computed(() => game.value?.lastRound);
const lastRoundWinnerName = computed(() =>
  lastRound.value ? playerName(lastRound.value.winnerId) : ''
);

const now = ref(Date.now());
const deadline = ref(Date.now());
const windowSeconds = ref(
  getCountdownSeconds(phase.value, turnPlayerId.value, lastRound.value !== undefined, getLobbyOptions(lobby.value))
);
const countdownKey = computed(() => getCountdownKey(game.value));

watch(countdownKey, () => {
  windowSeconds.value = getCountdownSeconds(phase.value, turnPlayerId.value, lastRound.value !== undefined, getLobbyOptions(lobby.value));
  now.value = Date.now();
  deadline.value = now.value + windowSeconds.value * 1000;
}, { immediate: true });

const secondsLeft = computed(() =>
  Math.max(0, Math.ceil((deadline.value - now.value) / 1000))
);
const progressPercent = computed(() =>
  Math.max(0, Math.min(100, ((deadline.value - now.value) / (windowSeconds.value * 1000)) * 100))
);

// Frame-rate updates so the progress bar drains smoothly.
// The deadline is timestamp-based, so the countdown stays correct even if frames are dropped.
let animationFrame: number | undefined;
const tick = () => {
  now.value = Date.now();
  animationFrame = requestAnimationFrame(tick);
};
onMounted(() => {
  animationFrame = requestAnimationFrame(tick);
});
onBeforeUnmount(() => {
  if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
});

const guessOptions = computed(() =>
  match.value ? Array.from({ length: match.value.numRounds + 1 }, (_, n) => n) : []
);
const forbiddenGuess = computed(() =>
  match.value ? getForbiddenGuess(match.value, currentPlayer.value?.id) : null
);

const playerName = (playerId: string) =>
  lobby.value?.players.find((player) => player.id === playerId)?.name ?? playerId;

const healthOf = (playerId: string) => game.value?.playersHealth[playerId] ?? 0;
const hearts = (playerId: string) => '♥'.repeat(Math.max(0, healthOf(playerId)));

const tableCards = computed<RoundCard[]>(() => match.value?.round?.cards.onMatch ?? []);

const makeGuess = (numWins: number) => {
  if (!isMyTurn.value || phase.value !== 'guessing' || numWins === forbiddenGuess.value) return;
  eventsEmitter.match.emitWinRoundsNumberResponse(numWins);
};

const playCard = (cardIndex: number) => {
  if (!isMyTurn.value || phase.value !== 'round' || special.value) return;
  eventsEmitter.round.emitSelectCard(cardIndex);
};
</script>

<template>
  <div
    v-if="lobby && game"
    class="card-table flex min-h-screen w-screen flex-col text-white"
  >
    <AppHeader />

    <main class="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-8 sm:px-6">
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <h1 class="font-serif text-3xl font-bold">
          {{ t('GAME.MATCH', { n: game.matchNumber }) }}
        </h1>
        <p
          v-if="match"
          class="text-emerald-100/80"
        >
          {{ t('GAME.ROUND', { n: game.roundNumber }) }} · {{ match.numRounds }}
          {{ t('GAME.CARDS_LABEL') }}
        </p>
      </div>
      <p
        v-if="special"
        class="mt-1 font-semibold text-amber-300"
      >
        {{ t('GAME.SPECIAL_MATCH') }}
      </p>

      <!-- Countdown to the next automatic action -->
      <div class="mt-4">
        <p
          role="timer"
          class="text-sm font-semibold"
          :class="isMyTurn ? 'text-amber-300' : 'text-emerald-100/80'"
        >
          {{ t('GAME.TIME_REMAINING', { seconds: secondsLeft }) }}
        </p>
        <div
          role="progressbar"
          :aria-valuenow="secondsLeft"
          aria-valuemin="0"
          :aria-valuemax="windowSeconds"
          :aria-label="t('GAME.TIME_REMAINING', { seconds: secondsLeft })"
          class="mt-1 h-2 overflow-hidden rounded-full bg-white/15"
        >
          <div
            class="h-full rounded-full"
            :class="secondsLeft <= 5 ? 'bg-red-400' : 'bg-amber-400'"
            :style="{ width: `${progressPercent}%` }"
          />
        </div>
      </div>

      <!-- Players -->
      <section class="mt-6">
        <ul class="grid gap-3 sm:grid-cols-2">
          <li
            v-for="player in lobby.players"
            :key="player.id"
            class="rounded-lg bg-black/25 px-4 py-3"
            :class="[
              turnPlayerId === player.id ? 'ring-2 ring-amber-300' : '',
              healthOf(player.id) <= 0 ? 'opacity-50' : ''
            ]"
          >
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-semibold">{{ player.name }}</span>
              <span
                v-if="player.id === currentPlayer?.id"
                class="rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold text-emerald-100"
              >
                {{ t('LOBBY.YOU') }}
              </span>
              <span
                v-if="player.leader"
                class="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-emerald-950"
              >
                {{ t('LOBBY.LEADER') }}
              </span>
              <span
                v-if="healthOf(player.id) <= 0"
                class="rounded-full bg-red-900/60 px-2 py-0.5 text-xs font-semibold text-red-200"
              >
                {{ t('GAME.ELIMINATED') }}
              </span>
            </div>
            <p class="mt-1 text-sm">
              <span class="text-red-400">{{ hearts(player.id) }}</span>
              <span class="ml-1 text-emerald-100/80">{{ healthOf(player.id) }} {{ t('GAME.LIVES') }}</span>
            </p>
            <p
              v-if="match?.players[player.id]"
              class="mt-1 text-sm text-emerald-100/80"
            >
              {{ t('GAME.GUESS_LABEL') }}:
              {{ match.players[player.id].numWinsNeeded ?? t('GAME.GUESS_PENDING') }}
              · {{ t('GAME.WON_LABEL') }}: {{ match.players[player.id].numWonRounds }}
              · {{ t('GAME.CARDS_LABEL') }}: {{ match.players[player.id].numCards }}
            </p>
          </li>
        </ul>
      </section>

      <!-- Waiting for the next match (final table of the last round stays visible) -->
      <section
        v-if="phase === 'waiting-match'"
        class="mt-8"
      >
        <div v-if="lastRound">
          <h2 class="font-serif text-xl font-bold">
            {{ t('GAME.LAST_ROUND') }}
          </h2>
          <p class="mt-1 font-semibold text-amber-300">
            {{ lastRound.points > 0
              ? t('GAME.ROUND_WINNER', { name: lastRoundWinnerName })
              : t('GAME.ROUND_TIE') }}
          </p>
          <RoundTable
            :cards="lastRound.cards"
            :winner-id="lastRound.points > 0 ? lastRound.winnerId : undefined"
          />
        </div>
        <p
          role="status"
          class="mt-4 rounded-lg bg-black/25 px-4 py-3 font-semibold text-emerald-200"
        >
          {{ t('GAME.WAITING_MATCH') }}
        </p>
      </section>

      <!-- Guessing -->
      <section
        v-else-if="phase === 'guessing'"
        class="mt-8 rounded-lg bg-black/25 p-4"
      >
        <h2 class="font-serif text-xl font-bold">
          {{ t('GAME.GUESS_TITLE') }}
        </h2>
        <template v-if="isMyTurn">
          <p class="mt-1 text-emerald-100/80">
            {{ t('GAME.GUESS_PROMPT') }}
          </p>
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              v-for="n in guessOptions"
              :key="n"
              type="button"
              :disabled="n === forbiddenGuess"
              class="h-12 w-12 rounded-full bg-amber-400 font-serif text-lg font-bold text-emerald-950 hover:bg-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-200/60 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/40"
              @click="makeGuess(n)"
            >
              {{ n }}
            </button>
          </div>
          <p
            v-if="forbiddenGuess !== null"
            class="mt-3 text-sm text-amber-200"
          >
            {{ t('GAME.FORBIDDEN_GUESS', { n: forbiddenGuess }) }}
          </p>
        </template>
        <p
          v-else
          class="mt-1 text-emerald-100/80"
        >
          {{ t('GAME.WAITING_GUESS', { name: turnPlayerName }) }}
        </p>
      </section>

      <!-- Between rounds: show the final table and who won before the next round -->
      <section
        v-else-if="phase === 'transition'"
        class="mt-8"
      >
        <template v-if="lastRound">
          <h2 class="font-serif text-xl font-bold">
            {{ t('GAME.LAST_ROUND') }}
          </h2>
          <p class="mt-1 font-semibold text-amber-300">
            {{ lastRound.points > 0
              ? t('GAME.ROUND_WINNER', { name: lastRoundWinnerName })
              : t('GAME.ROUND_TIE') }}
          </p>
          <RoundTable
            :cards="lastRound.cards"
            :winner-id="lastRound.points > 0 ? lastRound.winnerId : undefined"
          />
          <p
            role="status"
            class="mt-4 text-emerald-100/80"
          >
            {{ t('GAME.WAITING_ROUND') }}
          </p>
        </template>
        <p
          v-else
          role="status"
          class="rounded-lg bg-black/25 px-4 py-3 font-semibold text-emerald-200"
        >
          {{ t('GAME.WAITING_ROUND') }}
        </p>
      </section>

      <!-- Round: table and hand -->
      <template v-else-if="phase === 'round'">
        <section class="mt-8">
          <h2 class="font-serif text-xl font-bold">
            {{ special ? t('GAME.OTHERS_CARDS') : t('GAME.TABLE') }}
          </h2>
          <RoundTable
            v-if="match?.round"
            :cards="match.round.cards"
          />
        </section>

        <section class="mt-8">
          <h2 class="font-serif text-xl font-bold">
            {{ t('GAME.YOUR_HAND') }}
          </h2>
          <p
            v-if="isMyTurn && !special"
            class="mt-1 font-semibold text-amber-300"
          >
            {{ t('GAME.PLAY_CARD_PROMPT') }}
          </p>
          <p
            v-else-if="!special"
            class="mt-1 text-emerald-100/80"
          >
            {{ t('GAME.WAITING_PLAY', { name: turnPlayerName }) }}
          </p>

          <div
            v-if="special"
            class="mt-3 flex items-center gap-3"
          >
            <div class="flex h-24 w-16 shrink-0 items-center justify-center rounded-md bg-emerald-900 font-serif text-2xl font-bold text-emerald-100 shadow-lg ring-1 ring-white/30">
              ?
            </div>
            <p class="text-emerald-100/80">
              {{ t('GAME.YOUR_CARD_HIDDEN') }}
            </p>
          </div>
          <div
            v-else
            class="mt-3 flex flex-wrap gap-3"
          >
            <PlayingCard
              v-for="(card, index) in match?.currentPlayerCards ?? []"
              :key="index"
              :value="card.value"
              :label="card.label"
              :suit="card.suit"
              interactive
              :disabled="!isMyTurn"
              @click="playCard(index)"
            />
          </div>
        </section>
      </template>

      <!-- Hand while guessing (normal match: look at your cards before guessing) -->
      <section
        v-if="phase === 'guessing' && !special && (match?.currentPlayerCards.length ?? 0) > 0"
        class="mt-8"
      >
        <h2 class="font-serif text-xl font-bold">
          {{ t('GAME.YOUR_HAND') }}
        </h2>
        <div class="mt-3 flex flex-wrap gap-3">
          <PlayingCard
            v-for="(card, index) in match?.currentPlayerCards ?? []"
            :key="index"
            :value="card.value"
              :label="card.label"
              :suit="card.suit"
          />
        </div>
      </section>
      <section
        v-if="phase === 'guessing' && special"
        class="mt-8"
      >
        <h2 class="font-serif text-xl font-bold">
          {{ t('GAME.OTHERS_CARDS') }}
        </h2>
        <div class="mt-3 flex flex-wrap gap-4">
          <div
            v-for="roundCard in tableCards"
            :key="roundCard.playerId"
            class="flex flex-col items-center gap-1"
          >
            <PlayingCard
           :value="roundCard.card.value"
            :label="roundCard.card.label"
            :suit="roundCard.card.suit"
          />
            <span class="max-w-16 truncate text-xs text-emerald-100/80">{{ playerName(roundCard.playerId) }}</span>
          </div>
        </div>
        <p class="mt-3 text-emerald-100/80">
          {{ t('GAME.YOUR_CARD_HIDDEN') }}
        </p>
      </section>
    </main>
  </div>
</template>
