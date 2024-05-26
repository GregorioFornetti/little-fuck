import '../setupTests';
import Lobby, { Game, Match, Round, RoundCards } from '@/interfaces/Lobby';
import { handleTableUpdate } from '@/events/round/handlers/tableUpdate';
import { i18n } from '@/plugins/i18n';

describe('handleTableUpdate', () => {
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

  const EMPTY_ROUND_CARDS: RoundCards = { anulledCards: [], onMatch: [] };
  const FILLED_ROUND_CARDS: RoundCards = {
    anulledCards: [{
      card: { type: 'common', value: 4 },
      playerId: leaderPlayer.id
    }],
    onMatch: [{
      card: { type: 'common', value: 7 },
      playerId: anotherPlayer.id
    }]
  }

  test('Deve atualizar as informações da mesa', () => {
    const connection = require('@/connection');

    const round: Round = {
      cards: EMPTY_ROUND_CARDS,
      nextPlayerId: leaderPlayer.id
    }

    connection.lobby.value = {
      lobbyId: '123',
      players: [leaderPlayer, anotherPlayer],
      game: {
        match: { round }
      }
    }

    handleTableUpdate(FILLED_ROUND_CARDS, anotherPlayer.id);

    const lobby: Lobby = connection.lobby.value
    
    expect(lobby.game?.match?.round).toEqual<Round>({
      cards: FILLED_ROUND_CARDS,
      nextPlayerId: anotherPlayer.id
    });
  });

  test('Deve emitir um erro se o jogador atual não estiver em um lobby', () => {
    expect(() => handleTableUpdate(EMPTY_ROUND_CARDS, anotherPlayer.id))
      .toThrow(Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY')));
  });

  test('Deve emitir um erro se nenhum jogo estiver começado no lobby atual do jogador', () => {
    const connection = require('@/connection');

    connection.lobby.value = {
      lobbyId: '123',
      players: [anotherPlayer]
    }

    expect(() => handleTableUpdate(EMPTY_ROUND_CARDS, anotherPlayer.id))
      .toThrow(Error(i18n.t('COMMON.ERROR.GAME_NOT_STARTED')))
  })

  test('Deve emitir um erro se nenhuma partida estiver começado no lobby atual do jogador', () => {
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

    expect(() => handleTableUpdate(EMPTY_ROUND_CARDS, anotherPlayer.id))
      .toThrow(Error(i18n.t('COMMON.ERROR.MATCH_NOT_STARTED')));
  });

  
  test('Deve emitir um erro se nenhuma rodada estiver começado no lobby atual do jogador', () => {
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

    expect(() => handleTableUpdate(EMPTY_ROUND_CARDS, anotherPlayer.id))
      .toThrow(Error(i18n.t('COMMON.ERROR.ROUND_NOT_STARTED')));
  });
});
