import '../setupTests';
import Lobby, { Game, Match } from '@/interfaces/Lobby';
import { handleEndMatch } from '@/events/match/handlers/endMatch';
import { i18n } from '@/plugins/i18n';

describe('handleEndMatch', () => {
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

  const INITIAL_HEALTH = 10;
  const NEGATIVE_HEALTH_MOD = -2;
  const POSITIVE_HEALTH_MOD = 5;

  test('Deve encerrar uma partida e atualizar a vida dos participantes corretamente', () => {
    const connection = require('@/connection');

    const match: Match = {
      numRounds: 0,
      currentPlayerCards: [],
      players: {}
    }

    const game: Game = {
      currentWaitTime: 1,
      matchNumber: 1,
      roundNumber: 1,
      playersHealth: {
        [leaderPlayer.id]: INITIAL_HEALTH,
        [anotherPlayer.id]: INITIAL_HEALTH
      },
      match
    }

    connection.lobby.value = {
      lobbyId: '123',
      game: game,
      players: [leaderPlayer, anotherPlayer]
    }

    const playersHealthUpdate = {
      [leaderPlayer.id]: NEGATIVE_HEALTH_MOD, 
      [anotherPlayer.id]: POSITIVE_HEALTH_MOD
    }

    handleEndMatch(playersHealthUpdate);

    const lobby: Lobby = connection.lobby.value;
    const playersHealth = lobby.game?.playersHealth;

    expect(playersHealth).toEqual({
      [leaderPlayer.id]: INITIAL_HEALTH + NEGATIVE_HEALTH_MOD,
      [anotherPlayer.id]: INITIAL_HEALTH + POSITIVE_HEALTH_MOD
    })
  });

  test('Deve emitir um erro se o jogador atual não estiver em um lobby', () => {
    expect(() => handleEndMatch({}))
      .toThrow(Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY')));
  });

  
  test('Deve emitir um erro se nenhum jogo estiver começado no lobby atual do jogador', () => {
    const connection = require('@/connection');

    connection.lobby.value = {
      lobbyId: '123',
      players: [anotherPlayer]
    }

    expect(() => handleEndMatch({}))
      .toThrow(Error(i18n.t('COMMON.ERROR.GAME_NOT_STARTED')))
  });

  test('Deve emitir um erro se nenhuma partida estiver sido iniciada no lobby atual do jogador', () => {
    const connection = require('@/connection');

    const game: Game = {
      currentWaitTime: 1,
      matchNumber: 1,
      roundNumber: 1,
      playersHealth: {}
    }

    connection.lobby.value = {
      lobbyId: '123',
      game: game,
      players: [anotherPlayer]
    }

    expect(() => handleEndMatch({}))
      .toThrow(Error(i18n.t('COMMON.ERROR.MATCH_NOT_STARTED')));
  });
});
