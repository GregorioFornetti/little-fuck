import {
  areAllPlayersReady,
  findCurrentPlayer,
  readyProgress,
  type LobbyPlayer
} from '@/components/pages/lobbyReady';

const leader: LobbyPlayer = { id: '1', name: 'Leader', leader: true, ready: false };
const readyPlayer: LobbyPlayer = { id: '2', name: 'Ready', leader: false, ready: true };
const unreadyPlayer: LobbyPlayer = { id: '3', name: 'Unready', leader: false, ready: false };

describe('lobbyReady', () => {
  test('the leader not being ready does not block starting', () => {
    expect(areAllPlayersReady([leader, readyPlayer])).toBe(true);
  });

  test('a non-leader who is not ready blocks starting', () => {
    expect(areAllPlayersReady([leader, readyPlayer, unreadyPlayer])).toBe(false);
    expect(areAllPlayersReady([leader, unreadyPlayer])).toBe(false);
  });

  test('an empty lobby cannot start', () => {
    expect(areAllPlayersReady([])).toBe(false);
  });

  test('ready progress only counts non-leader players', () => {
    expect(readyProgress([leader, readyPlayer, unreadyPlayer])).toEqual({ ready: 1, total: 2 });
    expect(readyProgress([leader])).toEqual({ ready: 0, total: 0 });
  });

  test('finds the current player by socket id', () => {
    const players = [leader, readyPlayer, unreadyPlayer];
    expect(findCurrentPlayer(players, '2')).toEqual(readyPlayer);
    expect(findCurrentPlayer(players, 'unknown')).toBeUndefined();
    expect(findCurrentPlayer(players, undefined)).toBeUndefined();
  });
});
