import type { Lobby } from '@/interfaces/Lobby';

export type LobbyPlayer = Lobby['players'][number];

/** Finds the player that belongs to the current socket connection. */
export function findCurrentPlayer(
  players: LobbyPlayer[],
  currentPlayerId: string | undefined
): LobbyPlayer | undefined {
  if (!currentPlayerId) return undefined;
  return players.find((player) => player.id === currentPlayerId);
}

/**
 * Mirrors the backend start-game rule: everyone except the leader must be
 * ready. The leader starts the game instead of readying up.
 */
export function areAllPlayersReady(players: LobbyPlayer[]): boolean {
  return players.length > 0 && players.every((player) => player.leader || player.ready === true);
}

/** Ready progress among the non-leader players, who are the ones that ready up. */
export function readyProgress(players: LobbyPlayer[]): { ready: number; total: number } {
  const nonLeaders = players.filter((player) => !player.leader);
  return {
    ready: nonLeaders.filter((player) => player.ready === true).length,
    total: nonLeaders.length
  };
}
