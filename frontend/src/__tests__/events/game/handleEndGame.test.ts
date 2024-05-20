import "../setupTests";
import type { Game } from "@/interfaces/Lobby";
import { handleEndGame } from "@/events/game/handlers/endGame";
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

  test('Deve encerrar um jogo', () => {
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

    handleEndGame([]);

    const lobby = connection.lobby.value;

    expect(lobby.game).toBeUndefined();
  });

  test('Deve emitir um erro se o jogador atual não estiver em um lobby', () => {
    expect(() => handleEndGame([])).toThrow(Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY')));
  });

  test('Deve emitir um erro se nenhum jogo estiver começado no lobby atual do jogador', () => {
    const connection = require('@/connection');

    connection.lobby.value = {
      lobbyId: '123',
      players: [leaderPlayer, anotherPlayer]
    }

    expect(() => handleEndGame([]))
      .toThrow(Error(i18n.t('COMMON.ERROR.GAME_NOT_STARTED')))
  });
});
