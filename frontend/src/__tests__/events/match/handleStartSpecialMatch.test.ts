import '../setupTests';
import Lobby, { Game, Match, SpecialMatchCards } from '@/interfaces/Lobby';
import { handleStartSpecialMatch } from '@/events/match/handlers/startSpecialMatch';
import { i18n } from '@/plugins/i18n';

describe('handleStartSpecialMatch', () => {
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

  const EMPTY_SPECIAL_MATCH_CARDS: SpecialMatchCards = { anulledCards: [], onMatch: [] };

  const EXPECTED_NUM_ROUNDS = 1;
  const EXPECTED_PLAYER_NUM_CARDS = 1;
  const EXPECTED_PLAYER_NUM_WON_ROUNDS = 0;

  test('Deve iniciar uma nova partida especial', () => {
    const connection = require('@/connection');

    const game: Game = {
      currentWaitTime: 1,
      matchNumber: 1,
      roundNumber: 1,
      playersHealth: {}
    }

    connection.lobby.value = {
      lobbyId: '123',
      players: [leaderPlayer, anotherPlayer],
      game
    }

    handleStartSpecialMatch(EMPTY_SPECIAL_MATCH_CARDS, anotherPlayer.id);

    const lobby: Lobby = connection.lobby.value
    
    expect(lobby.game?.match).toEqual<Match>({
      nextPlayerId: anotherPlayer.id,
      numRounds: EXPECTED_NUM_ROUNDS,
      currentPlayerCards: [],
      players: {
        [leaderPlayer.id]: {
          numCards: EXPECTED_PLAYER_NUM_CARDS,
          numWonRounds: EXPECTED_PLAYER_NUM_WON_ROUNDS
        },
        [anotherPlayer.id]: {
          numCards: EXPECTED_PLAYER_NUM_CARDS,
          numWonRounds: EXPECTED_PLAYER_NUM_WON_ROUNDS
        }
      },
      round: {
        cards: EMPTY_SPECIAL_MATCH_CARDS
      }
    });
  });

  test('Deve emitir um erro se o jogador atual não estiver em um lobby', () => {
    expect(() => handleStartSpecialMatch(EMPTY_SPECIAL_MATCH_CARDS, anotherPlayer.id))
      .toThrow(Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY')));
  });

  test('Deve emitir um erro se nenhum jogo estiver começado no lobby atual do jogador', () => {
    const connection = require('@/connection');

    connection.lobby.value = {
      lobbyId: '123',
      players: [anotherPlayer]
    }

    expect(() => handleStartSpecialMatch(EMPTY_SPECIAL_MATCH_CARDS, anotherPlayer.id))
      .toThrow(Error(i18n.t('COMMON.ERROR.GAME_NOT_STARTED')))
  })

  test('Deve emitir um erro se uma partida já estiver começado no lobby atual do jogador', () => {
    const connection = require('@/connection');

    const match: Match = {
      numRounds: 0,
      currentPlayerCards: [],
      players: {},
    }

    const game: Game = {
      currentWaitTime: 1,
      matchNumber: 1,
      roundNumber: 1,
      playersHealth: {},
      match
    }

    connection.lobby.value = {
      lobbyId: '123',
      game: game,
      players: [anotherPlayer]
    }

    expect(() => handleStartSpecialMatch(EMPTY_SPECIAL_MATCH_CARDS, anotherPlayer.id))
      .toThrow(Error(i18n.t('COMMON.ERROR.MATCH_ALREADY_STARTED')));
  });
});
