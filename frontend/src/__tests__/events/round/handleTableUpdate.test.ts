
import '../setupTests';
import { Game, Match, Round, RoundCards } from '@/interfaces/Lobby';
import { handleTableUpdate } from '@/events/round/handlers/tableUpdate';
import { i18n } from '@/plugins/i18n';
import { lobby } from '@/connection';

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
  };

  test('Deve atualizar as informações da mesa', () => {
    const round: Round = {
      cards: EMPTY_ROUND_CARDS,
      nextPlayerId: leaderPlayer.id
    };

    lobby.value = {
      lobbyId: '123',
      players: [leaderPlayer, anotherPlayer],
      game: {
        playersHealth: {},
        currentWaitTime: 1,
        matchNumber: 1,
        roundNumber: 1,
        match: {
          players: {},
          currentPlayerCards: [],
          numRounds: 1,
          round: round
        }
      }
    };

    handleTableUpdate(FILLED_ROUND_CARDS, anotherPlayer.id);

    expect(lobby.value.game?.match?.round).toEqual<Round>({
      cards: FILLED_ROUND_CARDS,
      nextPlayerId: anotherPlayer.id
    });
  });

  test('Deve emitir um erro se o jogador atual não estiver em um lobby', () => {
    expect(() => handleTableUpdate(EMPTY_ROUND_CARDS, anotherPlayer.id))
      .toThrow(Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY')));
  });

  test('Deve emitir um erro se nenhum jogo estiver começado no lobby atual do jogador', () => {
    lobby.value = {
      lobbyId: '123',
      players: [anotherPlayer]
    };

    expect(() => handleTableUpdate(EMPTY_ROUND_CARDS, anotherPlayer.id))
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

    expect(() => handleTableUpdate(EMPTY_ROUND_CARDS, anotherPlayer.id))
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

    expect(() => handleTableUpdate(EMPTY_ROUND_CARDS, anotherPlayer.id))
      .toThrow(Error(i18n.t('COMMON.ERROR.ROUND_NOT_STARTED')));
  });
});
