
import '../setupTests';
import { Game, Match, Round } from '@/interfaces/Lobby';
import { handleStartRound } from '@/events/round/handlers/startRound';
import { i18n } from '@/plugins/i18n';
import { lobby } from '@/connection';

describe('handleStartRound', () => {
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

  test('Deve atualizar as informações da rodada', () => {

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
          numRounds: 1
        }
      }
    };

    handleStartRound(anotherPlayer.id);

    expect(lobby.value.game?.match?.round).toEqual<Round>({
      cards: {
        anulledCards: [],
        onMatch: []
      },
      nextPlayerId: anotherPlayer.id
    });
  });

  test('Deve emitir um erro se o jogador atual não estiver em um lobby', () => {
    expect(() => handleStartRound(anotherPlayer.id))
      .toThrow(Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY')));
  });

  test('Deve emitir um erro se nenhum jogo estiver começado no lobby atual do jogador', () => {
    lobby.value = {
      lobbyId: '123',
      players: [anotherPlayer]
    };

    expect(() => handleStartRound(anotherPlayer.id))
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

    expect(() => handleStartRound(anotherPlayer.id))
      .toThrow(Error(i18n.t('COMMON.ERROR.MATCH_NOT_STARTED')));
  });

  test('Deve emitir um erro se uma rodada estiver começado no lobby atual do jogador', () => {
    const round: Round = {
      cards: {
        anulledCards: [],
        onMatch: []
      },
      nextPlayerId: anotherPlayer.id
    };

    const match: Match = {
      numRounds: 0,
      currentPlayerCards: [],
      players: {},
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

    expect(() => handleStartRound(anotherPlayer.id))
      .toThrow(Error(i18n.t('COMMON.ERROR.ROUND_ALREADY_STARTED')));
  });
});
