
import '../setupTests';
import { Card, Game, Match } from '@/interfaces/Lobby';
import { handleStartMatch } from '@/events/match/handlers/startMatch';
import { i18n } from '@/plugins/i18n';
import { lobby } from '@/connection';

describe('handleStartMatch', () => {
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

  test('Deve iniciar uma nova partida', () => {
    const game: Game = {
      currentWaitTime: 1,
      matchNumber: 1,
      roundNumber: 1,
      playersHealth: {}
    };

    lobby.value = {
      lobbyId: '123',
      players: [leaderPlayer, anotherPlayer],
      game
    };

    const cards: Card[] = [
      { type: 'common', value: 3 },
      { type: 'common', value: 5 },
      { type: 'common', value: 9 }
    ];

    handleStartMatch(cards, anotherPlayer.id);

    expect(lobby.value.game?.match).toEqual<Match>({
      nextPlayerId: anotherPlayer.id,
      numRounds: cards.length,
      currentPlayerCards: cards,
      players: {
        [leaderPlayer.id]: {
          numCards: cards.length,
          numWonRounds: 0
        },
        [anotherPlayer.id]: {
          numCards: cards.length,
          numWonRounds: 0
        }
      }
    });
  });

  test('Deve iniciar uma nova partida com somente uma carta', () => {
    const game: Game = {
      currentWaitTime: 1,
      matchNumber: 1,
      roundNumber: 1,
      playersHealth: {}
    };

    lobby.value = {
      lobbyId: '123',
      players: [leaderPlayer, anotherPlayer],
      game
    };

    const cards: Card[] = [
      { type: 'common', value: 1 }
    ];

    handleStartMatch(cards, leaderPlayer.id);

    expect(lobby.value.game?.match).toEqual<Match>({
      nextPlayerId: leaderPlayer.id,
      numRounds: cards.length,
      currentPlayerCards: cards,
      players: {
        [leaderPlayer.id]: {
          numCards: cards.length,
          numWonRounds: 0
        },
        [anotherPlayer.id]: {
          numCards: cards.length,
          numWonRounds: 0
        }
      }
    });
  });

  test('Deve emitir um erro se o jogador atual não estiver em um lobby', () => {
    expect(() => handleStartMatch([], '123'))
      .toThrow(Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY')));
  });

  test('Deve emitir um erro se nenhum jogo estiver começado no lobby atual do jogador', () => {
    lobby.value = {
      lobbyId: '123',
      players: [anotherPlayer]
    };

    expect(() => handleStartMatch([], '123'))
      .toThrow(Error(i18n.t('COMMON.ERROR.GAME_NOT_STARTED')));
  });

  test('Deve emitir um erro se uma partida já estiver começado no lobby atual do jogador', () => {
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

    expect(() => handleStartMatch([], '123'))
      .toThrow(Error(i18n.t('COMMON.ERROR.MATCH_ALREADY_STARTED')));
  });
});
