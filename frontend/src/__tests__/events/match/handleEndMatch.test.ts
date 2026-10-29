
import '../setupTests';
import { Game, Match } from '@/interfaces/Lobby';
import { handleEndMatch } from '@/events/match/handlers/endMatch';
import { i18n } from '@/plugins/i18n';
import { lobby } from '@/connection';

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
    const match: Match = {
      numRounds: 0,
      currentPlayerCards: [],
      players: {}
    };

    const game: Game = {
      currentWaitTime: 1,
      matchNumber: 1,
      roundNumber: 1,
      playersHealth: {
        [leaderPlayer.id]: INITIAL_HEALTH,
        [anotherPlayer.id]: INITIAL_HEALTH
      },
      match
    };

    lobby.value = {
      lobbyId: '123',
      game: game,
      players: [leaderPlayer, anotherPlayer]
    };

    const playersHealthUpdate = {
      [leaderPlayer.id]: NEGATIVE_HEALTH_MOD,
      [anotherPlayer.id]: POSITIVE_HEALTH_MOD
    };

    handleEndMatch(playersHealthUpdate);

    const playersHealth = lobby.value.game?.playersHealth;

    expect(playersHealth).toEqual({
      [leaderPlayer.id]: INITIAL_HEALTH + NEGATIVE_HEALTH_MOD,
      [anotherPlayer.id]: INITIAL_HEALTH + POSITIVE_HEALTH_MOD
    });
  });

  test('Deve guardar o resumo da partida e registrá-la no histórico', () => {
    const match: Match = {
      numRounds: 2,
      currentPlayerCards: [],
      players: {
        [leaderPlayer.id]: { numCards: 0, numWonRounds: 1, numWinsNeeded: 1 },
        [anotherPlayer.id]: { numCards: 0, numWonRounds: 2, numWinsNeeded: 0 }
      }
    };

    const game: Game = {
      currentWaitTime: 1,
      matchNumber: 3,
      roundNumber: 1,
      playersHealth: {
        [leaderPlayer.id]: INITIAL_HEALTH,
        [anotherPlayer.id]: INITIAL_HEALTH
      },
      match,
      currentRoundWinners: [
        { winnerId: anotherPlayer.id, points: 1 },
        { winnerId: leaderPlayer.id, points: 1 }
      ]
    };

    lobby.value = {
      lobbyId: '123',
      game: game,
      players: [leaderPlayer, anotherPlayer]
    };

    handleEndMatch({
      [leaderPlayer.id]: 0,
      [anotherPlayer.id]: NEGATIVE_HEALTH_MOD
    });

    const expectedRows = [
      { playerId: leaderPlayer.id, guessed: 1, won: 1, healthDelta: 0 },
      { playerId: anotherPlayer.id, guessed: 0, won: 2, healthDelta: NEGATIVE_HEALTH_MOD }
    ];
    expect(lobby.value.game?.lastMatchSummary).toEqual(expectedRows);
    expect(lobby.value.game?.history).toEqual([
      {
        matchNumber: 3,
        rows: expectedRows,
        roundWinners: [
          { winnerId: anotherPlayer.id, points: 1 },
          { winnerId: leaderPlayer.id, points: 1 }
        ],
        rounds: []
      }
    ]);
    expect(lobby.value.game?.currentRoundWinners).toEqual([]);
  });

  test('Deve emitir um erro se o jogador atual não estiver em um lobby', () => {
    expect(() => handleEndMatch({}))
      .toThrow(Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY')));
  });

  test('Deve emitir um erro se nenhum jogo estiver começado no lobby atual do jogador', () => {
    lobby.value = {
      lobbyId: '123',
      players: [anotherPlayer]
    };

    expect(() => handleEndMatch({}))
      .toThrow(Error(i18n.t('COMMON.ERROR.GAME_NOT_STARTED')));
  });

  test('Deve emitir um erro se nenhuma partida estiver sido iniciada no lobby atual do jogador', () => {
    const game: Game = {
      currentWaitTime: 1,
      matchNumber: 1,
      roundNumber: 1,
      playersHealth: {}
    };

    lobby.value = {
      lobbyId: '123',
      game: game,
      players: [anotherPlayer]
    };

    expect(() => handleEndMatch({}))
      .toThrow(Error(i18n.t('COMMON.ERROR.MATCH_NOT_STARTED')));
  });
});
