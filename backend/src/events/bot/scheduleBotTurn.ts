import Lobby from '../../interfaces/Lobby';
import { io } from '../..';
import { createPlayer } from '../functions/createPlayer';
import { handleWinRoundsNumberResponse } from '../match/handlers/winRoundsNumberResponse';
import { handleSelectCard } from '../round/handlers/selectCard';
import { chooseBotGuess } from './chooseBotGuess';
import { chooseBotCardIndex } from './chooseBotCardIndex';

/** Tempo (ms) que um bot espera antes de agir, para o jogo não ser instantâneo */
export const BOT_ACTION_DELAY_MS = 1200;

const pendingTurns = new WeakMap<Lobby, Set<string>>();

type BotTurn = { kind: 'guess' | 'card', actorId: string, token: string };

function currentBotTurn(lobby: Lobby): BotTurn | null {
  const game = lobby.game;
  const match = game?.match;
  if (!game || !match) {
    return null;
  }

  if (game.status === 'waiting_num_win_response' && match.nextPlayerId) {
    const actor = lobby.players.find((player) => player.id === match.nextPlayerId);
    if (!actor?.bot) return null;
    const guessesMade = Object.values(match.players).filter((p) => p.numWinsNeeded !== undefined).length;
    return { kind: 'guess', actorId: actor.id, token: `guess:${game.matchNumber}:${actor.id}:${guessesMade}` };
  }

  if (game.status === 'waiting_select_card' && match.round?.nextPlayerId) {
    const actor = lobby.players.find((player) => player.id === match.round?.nextPlayerId);
    if (!actor?.bot) return null;
    const cardsOnTable = match.round.cards.onMatch.length + match.round.cards.anulledCards.length;
    return {
      kind: 'card',
      actorId: actor.id,
      token: `card:${game.matchNumber}:${game.roundNumber}:${actor.id}:${cardsOnTable}`
    };
  }

  return null;
}

/**
 *  Agenda a ação de um bot caso seja a vez dele de palpitar ou jogar uma carta.
 *  Deve ser chamada sempre que um turno pode passar para outro jogador.
 *  A ação só acontece se, após um pequeno atraso, ainda for a vez do mesmo bot
 *  no mesmo turno (nenhum humano ou timer automático agiu antes).
 *
 *  @param lobby informações da sala atual
 */
export function scheduleBotTurn(lobby: Lobby): void {
  const turn = currentBotTurn(lobby);
  if (!turn) {
    return;
  }

  let pending = pendingTurns.get(lobby);
  if (!pending) {
    pending = new Set();
    pendingTurns.set(lobby, pending);
  }
  if (pending.has(turn.token)) {
    return;
  }
  pending.add(turn.token);

  setTimeout(() => {
    pendingTurns.get(lobby)?.delete(turn.token);

    const current = currentBotTurn(lobby);
    if (!current || current.token !== turn.token) {
      return;
    }

    try {
      const player = createPlayer(io, turn.actorId);
      if (turn.kind === 'guess') {
        handleWinRoundsNumberResponse(player, chooseBotGuess(lobby, turn.actorId));
      } else {
        handleSelectCard(player, chooseBotCardIndex(lobby, turn.actorId));
      }
    } catch {
      // O jogo mudou enquanto o bot esperava (ex: sala desfeita). Nada a fazer.
    }

    // A ação do bot pode ter passado o turno para outro bot
    scheduleBotTurn(lobby);
  }, BOT_ACTION_DELAY_MS);
}
