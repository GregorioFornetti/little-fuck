
import '../setupTests';
import { Game, Match, Round } from '@/interfaces/Lobby';
import { handleEndRound } from '@/events/round/handlers/endRound';
import { i18n } from '@/plugins/i18n';
import { lobby } from '@/connection';

describe('handleEndRound', () => {
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

  const WINNER_ID = leaderPlayer.id;
  const POINTS_EARNED = 1;
  const INITIAL_POINTS = 1;
  const EXPECTED_POINTS = INITIAL_POINTS + POINTS_EARNED;

  test('Deve atualizar as informações da mesa', () => {
    const round: Round = {
      cards: { anulledCards: [], onMatch: [] },
      nextPlayerId: leaderPlayer.id
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
    match.players[WINNER_ID].numWonRounds = INITIAL_POINTS;

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

    handleEndRound(WINNER_ID, POINTS_EARNED);

    expect(lobby.value.game?.match?.round).toBeUndefined();
    expect(lobby.value.game?.match?.players[WINNER_ID].numWonRounds).toBe(EXPECTED_POINTS);
  });

  test('Deve emitir um erro se o jogador atual não estiver em um lobby', () => {
    expect(() => handleEndRound(WINNER_ID, POINTS_EARNED))
      .toThrow(Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY')));
  });

  test('Deve emitir um erro se nenhum jogo estiver começado no lobby atual do jogador', () => {
    lobby.value = {
      lobbyId: '123',
      players: [anotherPlayer]
    };

    expect(() => handleEndRound(WINNER_ID, POINTS_EARNED))
      .toThrow(Error(i18n.t('COMMON.ERROR.GAME_NOT_STARTED')));
  });

  test('Deve emitir um erro se nenhuma partida estiver começado no lobby atual do jogador', () => {
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

    expect(() => handleEndRound(WINNER_ID, POINTS_EARNED))
      .toThrow(Error(i18n.t('COMMON.ERROR.MATCH_NOT_STARTED')));
  });

  test('Deve emitir um erro se nenhuma rodada estiver começado no lobby atual do jogador', () => {
    const match: Match = {
      numRounds: 0,
      currentPlayerCards: [],
      players: {},
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

    expect(() => handleEndRound(WINNER_ID, POINTS_EARNED))
      .toThrow(Error(i18n.t('COMMON.ERROR.ROUND_NOT_STARTED')));
  });
});
