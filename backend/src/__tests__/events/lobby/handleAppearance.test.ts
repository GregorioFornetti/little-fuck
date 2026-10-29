import { APPEARANCE_COLORS, APPEARANCE_EMOTES } from '../../../global';
import { assignFreeAppearance } from '../../../events/lobby/functions/appearance';
import { handleUpdateAppearance } from '../../../events/lobby/handlers/updateAppearance';
import { clientSocket, createLobby, player } from '../setupTests';

describe('appearance', () => {
  test('assignFreeAppearance dá emote e cor diferentes para cada jogador', () => {
    createLobby();
    const lobby = player.lobby!;
    assignFreeAppearance(lobby, lobby.players[0]);
    assignFreeAppearance(lobby, lobby.players[1]);

    expect(lobby.players[0].emote).toBe(APPEARANCE_EMOTES[0]);
    expect(lobby.players[1].emote).toBe(APPEARANCE_EMOTES[1]);
    expect(lobby.players[0].color).toBe(APPEARANCE_COLORS[0]);
    expect(lobby.players[1].color).toBe(APPEARANCE_COLORS[1]);
  });

  test('update-appearance altera a aparência e avisa a sala', (done) => {
    createLobby();
    const lobby = player.lobby!;
    assignFreeAppearance(lobby, lobby.players[0]);
    assignFreeAppearance(lobby, lobby.players[1]);
    clientSocket.on('appearance-update', (playerId: string, emote: string, color: string) => {
      expect(playerId).toBe(player.playerId);
      expect(emote).toBe(APPEARANCE_EMOTES[3]);
      expect(color).toBe(APPEARANCE_COLORS[3]);
      expect(lobby.players[0].emote).toBe(APPEARANCE_EMOTES[3]);
      done();
    });

    handleUpdateAppearance(player, { emote: APPEARANCE_EMOTES[3], color: APPEARANCE_COLORS[3] });
  });

  test('emote já usado por outro jogador é rejeitado sem alterar', (done) => {
    createLobby();
    const lobby = player.lobby!;
    assignFreeAppearance(lobby, lobby.players[0]);
    assignFreeAppearance(lobby, lobby.players[1]);
    clientSocket.on('appearance-error', (errorType: string) => {
      expect(errorType).toBe('emote-taken');
      expect(lobby.players[0].emote).toBe(APPEARANCE_EMOTES[0]);
      done();
    });

    handleUpdateAppearance(player, { emote: APPEARANCE_EMOTES[1], color: APPEARANCE_COLORS[4] });
  });

  test('cor já usada por outro jogador é rejeitada sem alterar', (done) => {
    createLobby();
    const lobby = player.lobby!;
    assignFreeAppearance(lobby, lobby.players[0]);
    assignFreeAppearance(lobby, lobby.players[1]);
    clientSocket.on('appearance-error', (errorType: string) => {
      expect(errorType).toBe('color-taken');
      expect(lobby.players[0].color).toBe(APPEARANCE_COLORS[0]);
      done();
    });

    handleUpdateAppearance(player, { emote: APPEARANCE_EMOTES[4], color: APPEARANCE_COLORS[1] });
  });

  test('emote ou cor fora da lista são rejeitados', (done) => {
    createLobby();
    assignFreeAppearance(player.lobby!, player.lobby!.players[0]);
    clientSocket.on('appearance-error', (errorType: string) => {
      expect(errorType).toBe('invalid-appearance');
      done();
    });

    handleUpdateAppearance(player, { emote: '🚀', color: APPEARANCE_COLORS[2] });
  });

  test('usar o próprio emote e a própria cor de novo é permitido', () => {
    createLobby();
    const lobby = player.lobby!;
    assignFreeAppearance(lobby, lobby.players[0]);
    assignFreeAppearance(lobby, lobby.players[1]);

    handleUpdateAppearance(player, { emote: APPEARANCE_EMOTES[0], color: APPEARANCE_COLORS[0] });

    expect(lobby.players[0].emote).toBe(APPEARANCE_EMOTES[0]);
    expect(lobby.players[0].color).toBe(APPEARANCE_COLORS[0]);
  });
});
