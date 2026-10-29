import '../setupTests';
import { handlePowerupsUpdate } from '@/events/powerup/handlers/powerupsUpdate';
import { handlePowerupUsed } from '@/events/powerup/handlers/powerupUsed';
import { handleHandUpdate } from '@/events/powerup/handlers/handUpdate';
import { handlePeekResult } from '@/events/powerup/handlers/peekResult';
import { handleAppearanceUpdate } from '@/events/lobby/handlers/appearanceUpdate';
import { lobby, peekedCard, playerPowerups } from '@/connection';
import type { Lobby } from '@/interfaces/Lobby';

const baseLobby = (): Lobby => ({
  lobbyId: '123',
  players: [
    { id: 'p1', name: 'One', leader: true, ready: false },
    { id: 'p2', name: 'Two', leader: false, ready: true }
  ],
  game: {
    currentWaitTime: 5,
    matchNumber: 1,
    roundNumber: 1,
    playersHealth: { p1: 3, p2: 3 },
    match: {
      numRounds: 2,
      currentPlayerCards: [{ value: 5, type: 'common' }],
      players: {
        p1: { numCards: 2, numWonRounds: 0 },
        p2: { numCards: 2, numWonRounds: 0 }
      },
      round: {
        cards: { onMatch: [], anulledCards: [] },
        nextPlayerId: 'p2'
      }
    }
  }
} as Lobby);

describe('powerup handlers (frontend)', () => {
  test('powerups-update guarda os próprios poderes e as contagens de todos', () => {
    lobby.value = baseLobby();
    playerPowerups.value = [];

    handlePowerupsUpdate(['random-card', 'random-card'], { p1: 2, p2: 5 });

    expect(playerPowerups.value).toEqual(['random-card', 'random-card']);
    expect(lobby.value.players.map((player) => player.powerupCount)).toEqual([2, 5]);
  });

  test('powerup-used de inverter marca a rodada e o de força guarda o modificador pendente', () => {
    lobby.value = baseLobby();

    handlePowerupUsed({ type: 'reverse-card-strengths', userId: 'p2' });
    expect(lobby.value.game?.match?.round?.reversed).toBe(true);

    handlePowerupUsed({ type: 'increase-card-strength', userId: 'p2', targetPlayerId: 'p1', pendingStrengthTotal: 5 });
    expect(lobby.value.game?.match?.pendingStrength?.p1).toBe(5);
  });

  test('peek-result guarda a carta espiada e appearance-update muda emote e cor', () => {
    lobby.value = baseLobby();
    peekedCard.value = null;

    handlePeekResult({ value: 14, type: 'common' }, 'p2');
    expect(peekedCard.value).toEqual({ card: { value: 14, type: 'common' }, targetPlayerId: 'p2' });

    handleAppearanceUpdate('p2', '🐸', '#e63946');
    expect(lobby.value.players[1].emote).toBe('🐸');
    expect(lobby.value.players[1].color).toBe('#e63946');
  });

  test('hand-update troca a mão do jogador atual', () => {
    lobby.value = baseLobby();

    handleHandUpdate([{ value: 9, type: 'common' }, { value: 3, type: 'common' }]);

    expect(lobby.value.game?.match?.currentPlayerCards.map((card) => card.value)).toEqual([9, 3]);
  });
});
