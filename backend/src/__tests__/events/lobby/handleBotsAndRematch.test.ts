import { players } from '../../../global';
import { handleAddBot } from '../../../events/lobby/handlers/addBot';
import { handleRemoveBot } from '../../../events/lobby/handlers/removeBot';
import { handleRematchRequest } from '../../../events/lobby/handlers/rematchRequest';

import { clientSocket, createLobby, player } from '../setupTests';

describe('bots e revanche na sala', () => {
  test('líder pode adicionar um bot, que já entra pronto e registrado como jogador', (done) => {
    clientSocket.on('bot-added', (bot: { id: string, name: string, bot?: boolean, ready?: boolean }) => {
      expect(bot.bot).toBe(true);
      expect(bot.ready).toBe(true);
      expect(bot.name).toMatch(/^Bot \d+$/);
      expect(player.lobby?.players).toContainEqual(expect.objectContaining({ id: bot.id, bot: true }));
      expect(players[bot.id]?.lobby).toBe(player.lobby);
      done();
    });

    createLobby();
    handleAddBot(player);
  });

  test('bots recebem nomes sequenciais sem repetição', () => {
    createLobby();
    handleAddBot(player);
    handleAddBot(player);

    const names = player.lobby!.players.filter((p) => p.bot).map((p) => p.name);
    expect(names).toEqual(['Bot 1', 'Bot 2']);
  });

  test('jogador que não é líder não pode adicionar bot', (done) => {
    clientSocket.on('bot-error', (errorType: string) => {
      expect(errorType).toBe('not-leader');
      expect(player.lobby?.players.some((p) => p.bot)).toBe(false);
      done();
    });

    createLobby();
    player.lobby!.players[0].leader = false;
    player.lobby!.players[1].leader = true;
    handleAddBot(player);
  });

  test('líder pode remover um bot, mas não um jogador humano', (done) => {
    let removed = false;
    clientSocket.on('bot-removed', (botId: string) => {
      removed = true;
      expect(player.lobby?.players.some((p) => p.id === botId)).toBe(false);
      expect(players[botId]).toBeUndefined();
    });
    clientSocket.on('bot-error', (errorType: string) => {
      expect(errorType).toBe('bot-not-found');
      expect(removed).toBe(true);
      done();
    });

    createLobby();
    handleAddBot(player);
    const botId = player.lobby!.players.find((p) => p.bot)!.id;
    handleRemoveBot(player, botId);
    handleRemoveBot(player, player.lobby!.players[1].id);
  });

  test('líder pode pedir revanche: todos voltam não prontos, bots continuam prontos', (done) => {
    clientSocket.on('rematch', () => {
      const byId = Object.fromEntries(player.lobby!.players.map((p) => [p.id, p]));
      expect(byId[player.playerId].ready).toBe(false);
      expect(Object.values(byId).find((p) => p.bot)?.ready).toBe(true);
      done();
    });

    createLobby();
    handleAddBot(player);
    player.lobby!.players[1].ready = true;
    handleRematchRequest(player);
  });

  test('revanche durante um jogo é rejeitada', (done) => {
    clientSocket.on('rematch-error', (errorType: string) => {
      expect(errorType).toBe('already-in-game');
      done();
    });

    createLobby();
    player.lobby!.game = {} as never;
    handleRematchRequest(player);
  });
});
