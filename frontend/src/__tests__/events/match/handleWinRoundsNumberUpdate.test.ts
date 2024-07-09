
import '../setupTests';
import { Game, Match, Round } from '@/interfaces/Lobby';
import { handleWinRoundsNumberUpdate } from '@/events/match/handlers/winRoundsNumberUpdate';
import { i18n } from '@/plugins/i18n';
import { lobby } from '@/connection';

describe('handleWinRoundsNumberUpdate', () => {
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

  const EXPECTED_PLAYER_NUM_WONS_ROUNDS = 1;
  const EXPECTED_NEXT_PLAYER_ID = anotherPlayer.id;

  test('Deve atual', () => {
    const match: Match = {
      players: {
        [leaderPlayer.id]: {
          numCards: 2,
          numWonRounds: 0
        },
        [anotherPlayer.id]: {
          numCards: 2,
          numWonRounds: 0
        }
      },
      nextPlayerId: leaderPlayer.id,
      currentPlayerCards: [],
      numRounds: 1
    };

    const game: Game = {
      currentWaitTime: 1,
      matchNumber: 1,
      roundNumber: 1,
      playersHealth: {},
      match
    };

    lobby.value = {
      lobbyId: '123',
      players: [leaderPlayer, anotherPlayer],
      game
    };

    handleWinRoundsNumberUpdate(EXPECTED_PLAYER_NUM_WONS_ROUNDS, EXPECTED_NEXT_PLAYER_ID);

    expect(lobby.value.game?.match?.players[leaderPlayer.id].numWinsNeeded).toEqual(EXPECTED_PLAYER_NUM_WONS_ROUNDS);
    expect(lobby.value.game?.match?.nextPlayerId).toEqual(EXPECTED_NEXT_PLAYER_ID);
  });

  test('Deve emitir um erro se o jogador atual não estiver em um lobby', () => {
    expect(() => handleWinRoundsNumberUpdate(EXPECTED_PLAYER_NUM_WONS_ROUNDS, EXPECTED_NEXT_PLAYER_ID))
      .toThrow(Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY')));
  });

  test('Deve emitir um erro se nenhum jogo estiver começado no lobby atual do jogador', () => {
    lobby.value = {
      lobbyId: '123',
      players: [anotherPlayer]
    };

    expect(() => handleWinRoundsNumberUpdate(EXPECTED_PLAYER_NUM_WONS_ROUNDS, EXPECTED_NEXT_PLAYER_ID))
      .toThrow(Error(i18n.t('COMMON.ERROR.GAME_NOT_STARTED')));
  });

  test('Deve emitir um erro se não estiver com uma partida em andamento', () => {
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

    expect(() => handleWinRoundsNumberUpdate(EXPECTED_PLAYER_NUM_WONS_ROUNDS, EXPECTED_NEXT_PLAYER_ID))
      .toThrow(Error(i18n.t('COMMON.ERROR.MATCH_NOT_STARTED')));
  });

  test('Deve emitir um erro se estiver com uma rodada em andamento', () => {
    const round: Round = {
      cards: {
        onMatch: [],
        anulledCards: []
      }
    };

    const match: Match = {
      players: {
        [leaderPlayer.id]: {
          numCards: 2,
          numWonRounds: 0
        },
        [anotherPlayer.id]: {
          numCards: 2,
          numWonRounds: 0
        }
      },
      nextPlayerId: leaderPlayer.id,
      currentPlayerCards: [],
      numRounds: 1,
      round
    };

    const game: Game = {
      currentWaitTime: 1,
      matchNumber: 1,
      roundNumber: 1,
      playersHealth: {},
      match
    };

    lobby.value = {
      lobbyId: '123',
      game: game,
      players: [anotherPlayer]
    };

    expect(() => handleWinRoundsNumberUpdate(EXPECTED_PLAYER_NUM_WONS_ROUNDS, EXPECTED_NEXT_PLAYER_ID))
      .toThrow(Error(i18n.t('COMMON.ERROR.ROUND_ALREADY_STARTED')));
  });

  test('Deve emitir um erro se não tiver um `nextPlayerId` definido na partida', () => {
    const match: Match = {
      players: {
        [leaderPlayer.id]: {
          numCards: 2,
          numWonRounds: 0
        },
        [anotherPlayer.id]: {
          numCards: 2,
          numWonRounds: 0
        }
      },
      nextPlayerId: undefined,
      currentPlayerCards: [],
      numRounds: 1
    };

    const game: Game = {
      currentWaitTime: 1,
      matchNumber: 1,
      roundNumber: 1,
      playersHealth: {},
      match
    };

    lobby.value = {
      lobbyId: '123',
      game: game,
      players: [anotherPlayer]
    };

    expect(() => handleWinRoundsNumberUpdate(EXPECTED_PLAYER_NUM_WONS_ROUNDS, EXPECTED_NEXT_PLAYER_ID))
      .toThrow(Error(i18n.t('COMMON.ERROR.NO_MATCH_NEXT_PLAYER')));
  });
});
