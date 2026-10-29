import Timer from 'easytimer.js';
import Player from '../../../interfaces/Player';
import Lobby, { PowerupType } from '../../../interfaces/Lobby';
import { PLAYER_ACTION_TIME_SECONDS } from '../../../global';
import { createPlayer } from '../../functions/createPlayer';
import { getNextPlayerId } from '../../functions/getNextPlayerId';
import { generateInternalServerError } from '../../general/functions/generateInternalServerError';
import { endRound } from '../../round/functions/endRound';
import { generateAutomaticSelectCard } from '../../round/functions/generateAutomaticSelectCard';
import { scheduleBotTurn } from '../../bot/scheduleBotTurn';
import { ALL_POWERUP_TYPES, emitPowerupsUpdate, POWERUP_STRENGTH_DELTA } from '../functions/grantPowerups';
import { handleSelectCard } from '../../round/handlers/selectCard';

export interface UsePowerupPayload {
  type: PowerupType,
  targetPlayerId?: string
}

const STRENGTH_POWERUPS: PowerupType[] = ['increase-card-strength', 'decrease-card-strength'];

/**
 *  Evento enviado por um jogador para usar um dos seus poderes guardados.
 *  O poder é consumido apenas se o uso for válido (fase e alvo corretos).
 *  Em caso de sucesso, todos recebem `powerup-used` e os poderes guardados
 *  são atualizados pelo evento `powerups-update`.
 *
 *  @param player Objeto contendo informações do jogador que acaba de chamar o evento
 *  @param payload tipo do poder e, quando necessário, o id do jogador alvo
 */
export function handleUsePowerup(player: Player, payload: UsePowerupPayload) {
  const lobby = player.lobby;
  const fail = (type: 'no-powerup'|'invalid-target'|'wrong-phase'|'not-in-lobby'|'not-in-game'|'not-in-match') =>
    player.eventsEmitter.Powerup.emitPowerupError(type);

  if (!lobby) return fail('not-in-lobby');
  if (!lobby.game) return fail('not-in-game');
  const match = lobby.game.match;
  if (!match) return fail('not-in-match');

  const type = payload?.type;
  if (!ALL_POWERUP_TYPES.includes(type)) return fail('no-powerup');

  const me = lobby.players.find((lobbyPlayer) => lobbyPlayer.id === player.playerId);
  const myPowerups = me?.powerups ?? [];
  if (!myPowerups.includes(type)) return fail('no-powerup');

  const inMatch = (id?: string): id is string => id !== undefined && match.players[id] !== undefined;
  const isGuessing = lobby.game.status === 'waiting_num_win_response';
  const isRound = lobby.game.status === 'waiting_select_card' && match.round !== undefined;

  const consume = () => {
    if (me) {
      const index = myPowerups.indexOf(type);
      me.powerups = [...myPowerups.slice(0, index), ...myPowerups.slice(index + 1)];
    }
  };
  const used = (targetPlayerId?: string, pendingStrengthTotal?: number) => {
    player.eventsEmitter.Powerup.emitPowerupUsed({ type, userId: player.playerId, targetPlayerId, pendingStrengthTotal });
    emitPowerupsUpdate(lobby);
  };

  try {
    switch (type) {
      case 'swap-cards': {
        if (!isGuessing) return fail('wrong-phase');
        const targetId = payload.targetPlayerId;
        if (!inMatch(targetId) || targetId === player.playerId) return fail('invalid-target');
        const mine = match.players[player.playerId].cards;
        match.players[player.playerId].cards = match.players[targetId].cards;
        match.players[targetId].cards = mine;
        consume();
        createPlayer(player.io, player.playerId).eventsEmitter.Powerup.emitHandUpdate(match.players[player.playerId].cards);
        createPlayer(player.io, targetId).eventsEmitter.Powerup.emitHandUpdate(match.players[targetId].cards);
        used(targetId);
        return;
      }
      case 'cancel-card': {
        if (!isRound) return fail('wrong-phase');
        const currentId = match.round!.nextPlayerId;
        if (!currentId || currentId === player.playerId) return fail('invalid-target');
        consume();
        lobby.game.timer.stop();
        match.round!.skippedPlayerIds = [...(match.round!.skippedPlayerIds ?? []), currentId];
        const nextPlayerId = getNextPlayerId(currentId, lobby);
        if (nextPlayerId === match.roundFirstPlayerId) {
          match.round!.nextPlayerId = undefined;
          player.eventsEmitter.Round.emitTableUpdate(match.round!.cards, undefined);
          endRound(lobby);
        } else {
          match.round!.nextPlayerId = nextPlayerId;
          lobby.game.timer = new Timer();
          lobby.game.timer.start({ countdown: true, startValues: { seconds: lobby.options?.playerActionTimeSeconds ?? PLAYER_ACTION_TIME_SECONDS } });
          lobby.game.timer.addEventListener('targetAchieved', () => {
            generateAutomaticSelectCard(lobby);
          });
          player.eventsEmitter.Round.emitTableUpdate(match.round!.cards, nextPlayerId);
          scheduleBotTurn(lobby);
        }
        used(currentId);
        return;
      }
      case 'reverse-card-strengths': {
        if (!isRound) return fail('wrong-phase');
        if (match.round!.reversed) return fail('wrong-phase');
        consume();
        match.round!.reversed = true;
        // As cartas na mesa passam a valer ao contrário: a mais fraca fica na frente
        match.round!.cards.onMatch = [...match.round!.cards.onMatch].reverse();
        player.eventsEmitter.Round.emitTableUpdate(match.round!.cards, match.round!.nextPlayerId);
        used();
        return;
      }
      case 'random-card': {
        if (!isRound) return fail('wrong-phase');
        const currentId = match.round!.nextPlayerId;
        if (!currentId || !inMatch(currentId)) return fail('invalid-target');
        const hand = match.players[currentId].cards;
        if (hand.length === 0) return fail('invalid-target');
        consume();
        used(currentId);
        handleSelectCard(createPlayer(player.io, currentId), Math.floor(Math.random() * hand.length));
        return;
      }
      case 'hide-card-strength': {
        if (!isRound) return fail('wrong-phase');
        const targetId = payload.targetPlayerId;
        if (!inMatch(targetId)) return fail('invalid-target');
        const tableCard = [...match.round!.cards.onMatch, ...match.round!.cards.anulledCards]
          .find((roundCard) => roundCard.playerId === targetId);
        if (!tableCard) return fail('invalid-target');
        consume();
        tableCard.hidden = true;
        player.eventsEmitter.Round.emitTableUpdate(match.round!.cards, match.round!.nextPlayerId);
        used(targetId);
        return;
      }
      case 'peek-card': {
        if (!isGuessing && !isRound) return fail('wrong-phase');
        // Na partida especial todos já veem as cartas dos outros jogadores.
        if (lobby.game.numRounds === 1) return fail('wrong-phase');
        const targetId = payload.targetPlayerId;
        if (!inMatch(targetId) || targetId === player.playerId) return fail('invalid-target');
        const targetHand = match.players[targetId].cards;
        if (targetHand.length === 0) return fail('invalid-target');
        const peekedCard = targetHand[Math.floor(Math.random() * targetHand.length)];
        consume();
        player.eventsEmitter.Powerup.emitPeekResult(peekedCard, targetId);
        used(targetId);
        return;
      }
      case 'shield': {
        // O escudo é passivo: ele é consumido automaticamente quando o jogador
        // perderia uma vida no fim da partida, sem precisar ser ativado.
        return fail('wrong-phase');
      }
      case 'increase-card-strength':
      case 'decrease-card-strength': {
        if (!isGuessing && !isRound) return fail('wrong-phase');
        const targetId = payload.targetPlayerId;
        if (!inMatch(targetId)) return fail('invalid-target');
        consume();
        const delta = type === 'increase-card-strength' ? POWERUP_STRENGTH_DELTA : -POWERUP_STRENGTH_DELTA;
        match.pendingStrength = { ...(match.pendingStrength ?? {}) };
        match.pendingStrength[targetId] = (match.pendingStrength[targetId] ?? 0) + delta;
        used(targetId, match.pendingStrength[targetId]);
        return;
      }
      default:
        return fail('no-powerup');
    }
  } catch (error) {
    generateInternalServerError(lobby, error as Error);
  }
}
