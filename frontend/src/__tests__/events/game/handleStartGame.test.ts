import "../setupTests";
import { handleStartGame } from "@/events/game/handlers/startGame";
import { Game } from "@/interfaces/Lobby";
import { i18n } from "@/plugins/i18n";

describe('handleStartGame', () => {
  const leaderPlayer = {
    id: '12345',
    name: 'leader player',
    leader: true,
    ready: true
  };
  
  const anotherPlayer = {
    id: '123',
    name: 'John joe',
    leader: false,
    ready: false
  };

  const EXPECTED_INITIAL_HEALTH = 3;
  const EXPECTED_INITIAL_WAIT_TIME = 5;
  const EXPECTED_INITIAL_MATCH_NUMBER = 1;
  const EXPECTED_INITIAL_ROUND_NUMBER = 1;

  test('Deve iniciar um novo jogo', () => {
    const connection = require('@/connection');

    connection.lobby.value = {
      lobbyId: '123',
      players: [leaderPlayer, anotherPlayer]
    };

    handleStartGame();

    const game = connection.lobby.value.game as Game;

    const expectedOutput = {
      currentWaitTime: EXPECTED_INITIAL_WAIT_TIME,
      matchNumber: EXPECTED_INITIAL_MATCH_NUMBER,
      roundNumber: EXPECTED_INITIAL_ROUND_NUMBER,
      playersHealth: {
        123: EXPECTED_INITIAL_HEALTH,
        12345: EXPECTED_INITIAL_HEALTH
      }
    };

    expect(game).toEqual(expectedOutput);
  });

  test('Deve emitir um erro se o jogador atual não estiver em um lobby', () => {
    expect(() => handleStartGame()).toThrow(Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY')));
  });

  test('Deve emitir um erro se um jogo já estiver começado no lobby atual do jogador', () => {
    const connection = require('@/connection');

    const game: Game = {
      currentWaitTime: 1,
      matchNumber: 1,
      roundNumber: 1,
      playersHealth: {},
    }

    connection.lobby.value = {
      lobbyId: '123',
      game: game,
      players: [leaderPlayer, anotherPlayer]
    }

    expect(() => handleStartGame())
      .toThrow(Error(i18n.t('COMMON.ERROR.GAME_ALREADY_STARTED')))
  })
});
