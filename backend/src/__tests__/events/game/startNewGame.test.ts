
import { player, lobbyClientsSockets, createLobby } from '../setupTests';
import { startNewGame } from '../../../events/game/functions/startNewGame';
import { startNewMatch } from '../../../events/match/functions/startNewMatch';

const emitStartGame = jest.fn();

jest.mock('../../../events/match/functions/startNewMatch.ts', () => ({
  startNewMatch: jest.fn(),
}));
jest.mock('../../../index.ts', () => ({
  io: 'mocked io',
}));
jest.mock('../../../events/functions/createPlayer.ts', () => ({
  createPlayer: jest.fn((_io, _playerId) => {
    return {
      eventsEmitter: {
        Game: {
          emitStartGame: emitStartGame
        }
      }
    };
  })
}));

describe('startNewGame', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('Deve criar o objeto Game corretamente', () => {
    createLobby();

    startNewGame(player.lobby!);

    expect(player.lobby?.game?.matchNumber).toBe(1);
    expect(player.lobby?.game?.roundNumber).toBe(1);
    expect(player.lobby?.game?.currentPlayerId).toBe(player?.lobby?.players[player.lobby.players.length - 1].id);
    expect(player.lobby?.game?.status).toBe('starting_match');
    expect(player.lobby?.game?.deadPlayersIds).toEqual([]);
    expect(player.lobby?.game?.numRounds).toBe(1);
    expect(player.lobby?.game?.playersHealth).toEqual({
      [player.playerId]: 3,
      [lobbyClientsSockets[0].id!]: 3
    });

    // Testing timer
    expect(player.lobby?.game?.timer.getConfig().countdown).toBe(true);
    expect(player.lobby?.game?.timer.getTimeValues().seconds).toBe(5);
    jest.advanceTimersByTime(5000);
    expect(startNewMatch).toHaveBeenCalledWith(player.lobby!);
  });

  test('Deve enviar mensagem de início de jogo para todos os jogadores', () => {
    createLobby();

    startNewGame(player.lobby!);

    expect(emitStartGame).toHaveBeenCalledTimes(1);
  });
});
