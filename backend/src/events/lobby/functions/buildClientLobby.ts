import Lobby, { Card, RoundCards } from '../../../interfaces/Lobby';
import { insertCard } from '../../round/functions/insertCard';

/**
 * Visão do lobby no formato esperado pelo frontend (ver `docs/events.md`, evento `reconnect`).
 * Diferente do formato interno do backend (que possui timers e as cartas de todos os jogadores),
 * aqui cada jogador recebe apenas as suas próprias cartas e contadores simples.
 */
export interface ClientLobby {
  lobbyId: string,
  players: Lobby['players'],
  game?: {
    playersHealth: { [playerId: string]: number },
    currentWaitTime: number,
    matchNumber: number,
    roundNumber: number,
    match?: {
      players: {
        [playerId: string]: {
          numCards: number,
          numWonRounds: number,
          numWinsNeeded?: number
        }
      },
      currentPlayerCards: Card[],
      numRounds: number,
      nextPlayerId?: string,
      round?: {
        cards: RoundCards,
        nextPlayerId?: string
      }
    }
  }
}

/**
 * Monta a visão do lobby para um jogador específico, usada quando ele reconecta.
 * Na partida especial, o jogador volta a ver apenas as cartas dos outros jogadores.
 *
 * @param lobby lobby interno do backend
 * @param playerId id do jogador que está reconectando
 */
export function buildClientLobby(lobby: Lobby, playerId: string): ClientLobby {
  const clientLobby: ClientLobby = {
    lobbyId: lobby.lobbyId,
    players: lobby.players.map((player) => ({ ...player }))
  };

  const game = lobby.game;
  if (!game) {
    return clientLobby;
  }

  clientLobby.game = {
    playersHealth: { ...game.playersHealth },
    currentWaitTime: game.timer?.getTimeValues?.().seconds ?? 5,
    matchNumber: game.matchNumber,
    roundNumber: game.roundNumber
  };

  const match = game.match;
  if (!match) {
    return clientLobby;
  }

  const isSpecialMatch = game.numRounds === 1;

  let roundCards = match.round?.cards;
  if (isSpecialMatch && !roundCards) {
    // Na partida especial ainda não há rodada no backend.
    // Reconstrói as cartas dos outros jogadores (ordenadas da mais forte para a mais fraca).
    roundCards = { onMatch: [], anulledCards: [] };
    for (const otherPlayerId in match.players) {
      if (otherPlayerId === playerId) continue;
      roundCards = insertCard(roundCards, {
        card: match.players[otherPlayerId].cards[0],
        playerId: otherPlayerId
      });
    }
  }

  const players: { [playerId: string]: { numCards: number, numWonRounds: number, numWinsNeeded?: number } } = {};
  for (const matchPlayerId in match.players) {
    players[matchPlayerId] = {
      numCards: match.players[matchPlayerId].cards.length,
      numWonRounds: match.players[matchPlayerId].numWonRounds,
      numWinsNeeded: match.players[matchPlayerId].numWinsNeeded
    };
  }

  clientLobby.game.match = {
    players,
    currentPlayerCards: isSpecialMatch ? [] : [...(match.players[playerId]?.cards ?? [])],
    numRounds: game.numRounds,
    nextPlayerId: match.nextPlayerId,
    round: roundCards
      ? { cards: roundCards, nextPlayerId: match.round?.nextPlayerId }
      : undefined
  };

  return clientLobby;
}
