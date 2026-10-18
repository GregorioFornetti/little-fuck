import '../setupTests';
import { lobby } from '@/connection';
import { handleJoinLobbySuccess } from '@/events/lobby/handlers/joinLobbySuccess';
import { handleStartGame } from '@/events/game/handlers/startGame';
import { handleStartSpecialMatch } from '@/events/match/handlers/startSpecialMatch';
import { handleWinRoundsNumberUpdate } from '@/events/match/handlers/winRoundsNumberUpdate';
import { getGamePhase, getTurnPlayerId } from '@/components/pages/gameState';

describe('special match guessing chain', () => {
  test('both players can guess, in turn, during the special match', () => {
    const players = [
      { id: 'p1', name: 'One', leader: true, ready: false },
      { id: 'p2', name: 'Two', leader: false, ready: true }
    ];

    handleJoinLobbySuccess({ lobbyId: 'x', players });
    handleStartGame();
    // Special match: p2 guesses first; each sees only the other's card.
    handleStartSpecialMatch(
      {
        onMatch: [{ card: { type: 'common', value: 11 }, playerId: 'p1' }],
        anulledCards: []
      },
      'p2'
    );

    expect(getGamePhase(lobby.value?.game)).toBe('guessing');
    expect(getTurnPlayerId(lobby.value?.game)).toBe('p2');

    // p2 guesses; the turn must advance to p1 instead of throwing.
    handleWinRoundsNumberUpdate(0, 'p1');
    expect(lobby.value?.game?.match?.players.p2.numWinsNeeded).toBe(0);
    expect(getGamePhase(lobby.value?.game)).toBe('guessing');
    expect(getTurnPlayerId(lobby.value?.game)).toBe('p1');

    // p1 guesses last; guessing ends.
    handleWinRoundsNumberUpdate(1, undefined);
    expect(lobby.value?.game?.match?.players.p1.numWinsNeeded).toBe(1);
    expect(lobby.value?.game?.match?.nextPlayerId).toBeUndefined();
  });
});
