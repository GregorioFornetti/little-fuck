import { Timer } from 'easytimer.js';
import type { Socket } from 'socket.io';
import { players } from '../../../global';
import Lobby, { Card, Game } from '../../../interfaces/Lobby';
import { grantPowerupsIfNeeded } from '../../../events/powerup/functions/grantPowerups';
import { handleUsePowerup } from '../../../events/powerup/handlers/usePowerup';
import { handleSelectCard } from '../../../events/round/handlers/selectCard';
import { endMatch } from '../../../events/match/functions/endMatch';

import { clientSocket, createLobby, player } from '../setupTests';

const card = (value: number): Card => ({ value, type: 'common' });
let ME = '';
let OTHER = '';

function makeGame(status: Game['status']): Lobby {
  createLobby();
  const lobby = player.lobby!;
  ME = lobby.players[0].id;
  OTHER = lobby.players[1].id;
  lobby.options = {
    initialHealth: 3,
    playerActionTimeSeconds: 18,
    roundEndTimeSeconds: 10,
    cardType: 'numbered',
    powerups: {
      enabled: ['swap-cards', 'cancel-card', 'reverse-card-strengths', 'random-card', 'hide-card-strength', 'increase-card-strength', 'decrease-card-strength'],
      perGrant: 2,
      grantTiming: 'match'
    }
  };
  lobby.players[0].powerups = ['swap-cards', 'cancel-card', 'reverse-card-strengths', 'random-card', 'hide-card-strength', 'increase-card-strength', 'decrease-card-strength'];
  lobby.players[1].powerups = [];

  // Registra o segundo jogador como um "bot" (socket falso) para poder agir por ele
  players[OTHER] = { socket: { id: OTHER, emit: () => true } as unknown as Socket, lobby };

  lobby.game = {
    playersHealth: { [ME]: 3, [OTHER]: 3 },
    timer: new Timer(),
    matchNumber: 1,
    roundNumber: 1,
    currentPlayerId: ME,
    numRounds: 2,
    deadPlayersIds: [],
    status,
    match: {
      nextPlayerId: ME,
      roundFirstPlayerId: OTHER,
      players: {
        [ME]: { cards: [card(5), card(9)], numWonRounds: 0 },
        [OTHER]: { cards: [card(3), card(14)], numWonRounds: 0 }
      },
      round: status === 'waiting_select_card'
        ? { cards: { onMatch: [], anulledCards: [] }, nextPlayerId: OTHER }
        : undefined
    }
  } as unknown as Game;

  return lobby;
}

describe('grantPowerupsIfNeeded', () => {
  test('dá poderes aleatórios dos tipos ativados, que acumulam entre partidas', () => {
    const lobby = makeGame('waiting_num_win_response');
    lobby.players[0].powerups = ['random-card'];
    lobby.players[1].powerups = [];

    grantPowerupsIfNeeded(lobby, 'match');
    expect(lobby.players[0].powerups).toHaveLength(3); // 1 guardado + 2 novos
    expect(lobby.players[1].powerups).toHaveLength(2);

    grantPowerupsIfNeeded(lobby, 'game'); // momento errado: nada muda
    expect(lobby.players[0].powerups).toHaveLength(3);
  });

  test('sem tipos ativados, nenhum poder é dado', () => {
    const lobby = makeGame('waiting_num_win_response');
    lobby.options!.powerups = { enabled: [], perGrant: 2, grantTiming: 'match' };
    lobby.players[0].powerups = [];
    grantPowerupsIfNeeded(lobby, 'match');
    expect(lobby.players[0].powerups).toEqual([]);
  });
});

describe('handleUsePowerup', () => {
  test('swap-cards troca as mãos durante os palpites e consome o poder', () => {
    const lobby = makeGame('waiting_num_win_response');

    handleUsePowerup(player, { type: 'swap-cards', targetPlayerId: OTHER });

    expect(lobby.game!.match!.players[ME].cards.map((c) => c.value)).toEqual([3, 14]);
    expect(lobby.game!.match!.players[OTHER].cards.map((c) => c.value)).toEqual([5, 9]);
    expect(lobby.players[0].powerups).not.toContain('swap-cards');
  });

  test('swap-cards fora da fase de palpites é rejeitado sem consumir', (done) => {
    const lobby = makeGame('waiting_select_card');
    clientSocket.on('powerup-error', (errorType: string) => {
      expect(errorType).toBe('wrong-phase');
      expect(lobby.players[0].powerups).toContain('swap-cards');
      done();
    });

    handleUsePowerup(player, { type: 'swap-cards', targetPlayerId: OTHER });
  });

  test('increase-card-strength vale +5 para a próxima carta jogada', (done) => {
    const lobby = makeGame('waiting_select_card');
    clientSocket.on('table-update', (cards: { onMatch: { card: Card }[] }) => {
      expect(cards.onMatch[0].card.value).toBe(14); // 9 + 5
      expect(lobby.game!.match!.pendingStrength?.[ME]).toBeUndefined();
      done();
    });

    handleUsePowerup(player, { type: 'increase-card-strength', targetPlayerId: ME });
    expect(lobby.game!.match!.pendingStrength?.[ME]).toBe(5);

    lobby.game!.match!.round!.nextPlayerId = ME;
    handleSelectCard(player, 1); // joga a carta de valor 9
  });

  test('decrease-card-strength registra -5 pendente para o alvo', () => {
    const lobby = makeGame('waiting_num_win_response');

    handleUsePowerup(player, { type: 'decrease-card-strength', targetPlayerId: OTHER });

    expect(lobby.game!.match!.pendingStrength?.[OTHER]).toBe(-5);
    expect(lobby.players[0].powerups).not.toContain('decrease-card-strength');
  });

  test('cancel-card pula a jogada do jogador atual', () => {
    const lobby = makeGame('waiting_select_card');

    handleUsePowerup(player, { type: 'cancel-card' });

    expect(lobby.game!.match!.round!.skippedPlayerIds).toContain(OTHER);
    expect(lobby.game!.match!.round!.nextPlayerId).toBe(ME);
    expect(lobby.game!.match!.players[OTHER].cards).toHaveLength(2); // carta não sai da mão
    expect(lobby.players[0].powerups).not.toContain('cancel-card');
  });

  test('reverse-card-strengths inverte a mesa e as próximas cartas', () => {
    const lobby = makeGame('waiting_select_card');
    lobby.game!.match!.round!.cards = {
      onMatch: [
        { card: card(14), playerId: OTHER },
        { card: card(3), playerId: ME }
      ],
      anulledCards: []
    };
    lobby.game!.match!.round!.nextPlayerId = ME;

    handleUsePowerup(player, { type: 'reverse-card-strengths' });

    expect(lobby.game!.match!.round!.reversed).toBe(true);
    expect(lobby.game!.match!.round!.cards.onMatch.map((rc) => rc.card.value)).toEqual([3, 14]);
  });

  test('hide-card-strength esconde a carta do alvo que está na mesa', () => {
    const lobby = makeGame('waiting_select_card');
    lobby.game!.match!.round!.cards = {
      onMatch: [{ card: card(14), playerId: OTHER }],
      anulledCards: []
    };

    handleUsePowerup(player, { type: 'hide-card-strength', targetPlayerId: OTHER });

    expect(lobby.game!.match!.round!.cards.onMatch[0].hidden).toBe(true);
  });

  test('random-card força o jogador atual a jogar uma carta', () => {
    const lobby = makeGame('waiting_select_card');

    handleUsePowerup(player, { type: 'random-card' });

    expect(lobby.game!.match!.players[OTHER].cards).toHaveLength(1); // jogou uma das duas cartas
    expect(lobby.players[0].powerups).not.toContain('random-card');
  });

  test('peek-card revela uma carta do alvo apenas para quem usou', (done) => {
    const lobby = makeGame('waiting_num_win_response');
    lobby.players[0].powerups = ['peek-card'];
    clientSocket.on('peek-result', (peekedCard: Card, targetPlayerId: string) => {
      expect(targetPlayerId).toBe(OTHER);
      expect([3, 14]).toContain(peekedCard.value);
      expect(lobby.players[0].powerups).not.toContain('peek-card');
      done();
    });

    handleUsePowerup(player, { type: 'peek-card', targetPlayerId: OTHER });
  });

  test('shield é passivo: usar manualmente é rejeitado sem consumir', (done) => {
    const lobby = makeGame('waiting_num_win_response');
    lobby.players[0].powerups = ['shield'];
    clientSocket.on('powerup-error', (errorType: string) => {
      expect(errorType).toBe('wrong-phase');
      expect(lobby.players[0].powerups).toContain('shield');
      done();
    });

    handleUsePowerup(player, { type: 'shield' });
  });

  test('shield bloqueia a perda de vida no fim da partida e é consumido', () => {
    const lobby = makeGame('waiting_select_card');
    lobby.players[0].powerups = ['shield'];
    lobby.game!.match!.players[ME].numWinsNeeded = 2; // errou o palpite: perderia 1 vida
    lobby.game!.match!.players[ME].numWonRounds = 0;
    lobby.game!.match!.players[OTHER].numWinsNeeded = 0;
    lobby.game!.match!.players[OTHER].numWonRounds = 0;

    endMatch(lobby);

    expect(lobby.game!.playersHealth[ME]).toBe(3);
    expect(lobby.players[0].powerups).not.toContain('shield');
    expect(lobby.game!.deadPlayersIds).not.toContain(ME);
  });

  test('sem shield, errar o palpite ainda custa uma vida', () => {
    const lobby = makeGame('waiting_select_card');
    lobby.players[0].powerups = [];
    lobby.game!.match!.players[ME].numWinsNeeded = 2;
    lobby.game!.match!.players[ME].numWonRounds = 0;
    lobby.game!.match!.players[OTHER].numWinsNeeded = 0;
    lobby.game!.match!.players[OTHER].numWonRounds = 0;

    endMatch(lobby);

    expect(lobby.game!.playersHealth[ME]).toBe(2);
  });

  test('usar um poder que não possui é rejeitado', (done) => {
    const lobby = makeGame('waiting_num_win_response');
    lobby.players[0].powerups = [];
    clientSocket.on('powerup-error', (errorType: string) => {
      expect(errorType).toBe('no-powerup');
      done();
    });

    handleUsePowerup(player, { type: 'swap-cards', targetPlayerId: OTHER });
  });
});
