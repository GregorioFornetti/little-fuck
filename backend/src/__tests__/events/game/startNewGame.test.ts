
import { player, lobbyClientsSockets, createLobby } from '../setupTests';
import i18n from '../../../plugins/i18n';
import { startNewGame } from '../../../events/game/functions/startNewGame';
import { startNewMatch } from '../../../events/match/functions/startNewMatch';

jest.mock('../../../events/match/functions/startNewMatch.ts');

describe('startNewGame', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('Deve criar o objeto Game corretamente', () => {
    createLobby();

    startNewGame(player);

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
    expect(startNewMatch).toHaveBeenCalledWith(player);
  });

  test('Deve enviar mensagem de incio de jogo para todos os jogadores', () => {
    createLobby();

    const emitSpy = jest.spyOn(player.eventsEmitter.Game, 'emitStartGame');

    startNewGame(player);

    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  test('Deve lançar uma exceção caso o jogador não esteja em um lobby', () => {
    expect(() => startNewGame(player)).toThrow(new Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY')));
  });
});
