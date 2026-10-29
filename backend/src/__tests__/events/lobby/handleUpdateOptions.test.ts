import { lobbys, players } from '../../../global';
import { handleUpdateOptions } from '../../../events/lobby/handlers/updateOptions';
import Player from '../../../interfaces/Player';
import { Timer } from 'easytimer.js';

import { clientSocket, createLobby as createLobbyBase, player } from '../setupTests';

function createLobby(leader = true) {
  createLobbyBase();
  player.lobby!.options = { initialHealth: 3, playerActionTimeSeconds: 18, roundEndTimeSeconds: 10, cardType: 'numbered' };
  if (!leader) {
    player.lobby!.players[0].leader = false;
    player.lobby!.players[1].leader = true;
  }
}

const validOptions = { initialHealth: 5, playerActionTimeSeconds: 20, roundEndTimeSeconds: 15, cardType: 'manilha-velha' as const };

describe('handleUpdateOptions', () => {
  test('líder pode alterar as opções antes do jogo e todos recebem a atualização', (done) => {
    clientSocket.on('options-update', (options: unknown) => {
      expect(options).toEqual(validOptions);
      expect(player.lobby?.options).toEqual(validOptions);
      done();
    });

    createLobby();
    handleUpdateOptions(player, validOptions);
  });

  test('líder pode escolher o tipo de cartas manilha nova', (done) => {
    clientSocket.on('options-update', (options: unknown) => {
      expect(options).toEqual({ ...validOptions, cardType: 'manilha-nova' });
      done();
    });

    createLobby();
    handleUpdateOptions(player, { ...validOptions, cardType: 'manilha-nova' });
  });

  test('líder pode escolher o tipo de cartas manilha paraguaia', (done) => {
    clientSocket.on('options-update', (options: unknown) => {
      expect(options).toEqual({ ...validOptions, cardType: 'manilha-paraguaia' });
      done();
    });

    createLobby();
    handleUpdateOptions(player, { ...validOptions, cardType: 'manilha-paraguaia' });
  });

  test('jogador que não é líder não pode alterar as opções', (done) => {
    clientSocket.on('options-error', (errorType: string) => {
      expect(errorType).toBe('not-leader');
      expect(player.lobby?.options?.initialHealth).toBe(3);
      done();
    });

    createLobby(false);
    handleUpdateOptions(player, validOptions);
  });

  test('não pode alterar as opções com o jogo em andamento', (done) => {
    clientSocket.on('options-error', (errorType: string) => {
      expect(errorType).toBe('already-in-game');
      done();
    });

    createLobby();
    player.lobby!.game = {
      matchNumber: 1,
      roundNumber: 1,
      currentPlayerId: player.playerId,
      status: 'starting_match',
      deadPlayersIds: [],
      numRounds: 0,
      playersHealth: {},
      timer: new Timer()
    };
    handleUpdateOptions(player, validOptions);
  });

  test('opções inválidas são rejeitadas', (done) => {
    let errors = 0;
    clientSocket.on('options-error', (errorType: string) => {
      expect(errorType).toBe('invalid-options');
      errors++;
      if (errors === 4) done();
    });

    createLobby();
    handleUpdateOptions(player, { ...validOptions, initialHealth: 0 });
    handleUpdateOptions(player, { ...validOptions, playerActionTimeSeconds: 61 });
    handleUpdateOptions(player, { ...validOptions, roundEndTimeSeconds: 2.5 });
    handleUpdateOptions(player, { ...validOptions, cardType: 'truco' as never });
  });

  test('líder pode personalizar as cartas numeradas e cartas inválidas são rejeitadas', (done) => {
    let errors = 0;
    clientSocket.on('options-update', (options: unknown) => {
      expect(options).toEqual({ ...validOptions, customCards: [1, 2, 999] });
    });
    clientSocket.on('options-error', (errorType: string) => {
      expect(errorType).toBe('invalid-options');
      errors++;
      if (errors === 3) done();
    });

    createLobby();
    handleUpdateOptions(player, { ...validOptions, customCards: [1, 2, 999] });
    handleUpdateOptions(player, { ...validOptions, customCards: [] });
    handleUpdateOptions(player, { ...validOptions, customCards: [0] });
    handleUpdateOptions(player, { ...validOptions, customCards: [1000] });
  });
  test('líder pode escolher o tema da mesa e temas inválidos são rejeitados', (done) => {
    let errors = 0;
    clientSocket.on('options-update', (options: unknown) => {
      expect(options).toEqual({ ...validOptions, theme: 'wine' });
    });
    clientSocket.on('options-error', (errorType: string) => {
      expect(errorType).toBe('invalid-options');
      errors++;
      if (errors === 1) done();
    });

    createLobby();
    handleUpdateOptions(player, { ...validOptions, theme: 'wine' });
    handleUpdateOptions(player, { ...validOptions, theme: 'neon' as never });
  });
  test('líder pode escolher o verso das cartas e versos inválidos são rejeitados', (done) => {
    let errors = 0;
    clientSocket.on('options-update', (options: unknown) => {
      expect(options).toEqual({ ...validOptions, cardBack: 'stripes' });
    });
    clientSocket.on('options-error', (errorType: string) => {
      expect(errorType).toBe('invalid-options');
      errors++;
      if (errors === 1) done();
    });

    createLobby();
    handleUpdateOptions(player, { ...validOptions, cardBack: 'stripes' });
    handleUpdateOptions(player, { ...validOptions, cardBack: 'xadrez' as never });
  });
  test('jogador fora de uma sala recebe erro', (done) => {
    clientSocket.on('options-error', (errorType: string) => {
      expect(errorType).toBe('not-in-lobby');
      done();
    });

    player.lobby = undefined;
    handleUpdateOptions(player, validOptions);
  });
});
