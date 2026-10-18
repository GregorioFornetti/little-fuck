import type { Server } from 'socket.io';
import { players } from '../../../global';
import {
  cancelOfflineRemoval,
  scheduleOfflineRemoval
} from '../../../events/general/functions/offlineRemoval';
import { handleLogout } from '../../../events/general/handlers/logout';

jest.mock('../../../events/general/handlers/logout', () => ({
  handleLogout: jest.fn()
}));
jest.mock('../../../events/functions/createPlayer', () => ({
  createPlayer: jest.fn((_io: unknown, playerId: string) => ({ playerId }))
}));

const io = {} as Server;

describe('offlineRemoval', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    for (const key of Object.keys(players)) delete players[key];
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const addOfflinePlayer = (id: string, withLobby = true) => {
    players[id] = {
      socket: { connected: false } as never,
      lobby: withLobby ? ({ lobbyId: 'lobby-1' } as never) : undefined,
      offlineSince: Date.now()
    };
  };

  test('remove o jogador da sala após ficar offline pelo tempo limite', () => {
    addOfflinePlayer('p1');
    scheduleOfflineRemoval(io, 'p1', 1000);

    jest.advanceTimersByTime(999);
    expect(handleLogout).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(handleLogout).toHaveBeenCalledTimes(1);
    expect(players['p1']).toBeUndefined();
  });

  test('não remove se a remoção for cancelada (jogador reconectou)', () => {
    addOfflinePlayer('p1');
    scheduleOfflineRemoval(io, 'p1', 1000);
    cancelOfflineRemoval('p1');

    jest.advanceTimersByTime(5000);
    expect(handleLogout).not.toHaveBeenCalled();
    expect(players['p1']).toBeDefined();
  });

  test('não remove se o socket já estiver conectado de novo', () => {
    addOfflinePlayer('p1');
    players['p1'].socket = { connected: true } as never;
    scheduleOfflineRemoval(io, 'p1', 1000);

    jest.advanceTimersByTime(5000);
    expect(handleLogout).not.toHaveBeenCalled();
    expect(players['p1']).toBeDefined();
  });

  test('jogador sem sala apenas some do servidor após o limite', () => {
    addOfflinePlayer('p1', false);
    scheduleOfflineRemoval(io, 'p1', 1000);

    jest.advanceTimersByTime(1000);
    expect(handleLogout).not.toHaveBeenCalled();
    expect(players['p1']).toBeUndefined();
  });
});
