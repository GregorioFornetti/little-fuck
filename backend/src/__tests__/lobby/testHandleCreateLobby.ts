
import { lobbys, players } from "../../global";
import { handleCreateLobby } from "../../events/lobby/eventsHandlers";
import Lobby from "../../interfaces/Lobby";

import { clientSocket, player } from "../setupTests";


describe("handleCreateLobby", () => {

  test("Nome vazio deve emitir erro", (done) => {
    clientSocket.on('join-lobby-error', (errorType: string) => {
      expect(errorType).toBe('no-name');
      expect(lobbys).toEqual({});
      expect(players).toEqual({});
      done();
    })

    handleCreateLobby(player, '');
  });

  test("Nome apenas com espaços deve emitir erro", (done) => {
    clientSocket.on('join-lobby-error', (errorType: string) => {
      expect(errorType).toBe('no-name');
      expect(lobbys).toEqual({});
      expect(players).toEqual({});
      done();
    })

    handleCreateLobby(player, '       ');
  });

  test("Criar lobby com nome válido", (done) => {
    clientSocket.on('join-lobby-success', (lobby: Lobby) => {
      // Verifica se as informações do lobby foram enviadas corretamente para o jogador
      expect(lobby.lobbyId).toBeDefined();
      expect(lobby.players).toHaveLength(1);
      expect(lobby.players[0].id).toBe(player.playerId);
      expect(lobby.players[0].name).toBe('player1');
      expect(lobby.players[0].leader).toBe(true);
      expect(lobby.players[0].ready).toBe(false);
      expect(lobby.game).toBeUndefined();

      // Verifica se as informações do lobby foram salvas corretamente no servidor
      expect(lobbys[lobby.lobbyId]).toEqual(lobby);
      expect(players[player.playerId]).toEqual(lobby);

      done();
    })

    handleCreateLobby(player, 'player1');
  });

  test("Criar lobby com jogador já em outro lobby deve emitir erro", (done) => {

    // A primeira vez chamando handleCreateLobby deve ser bem sucedida
    clientSocket.on('join-lobby-success', (lobby: Lobby) => {
      player.lobby = lobby;
      handleCreateLobby(player, 'player1');
    })

    // A segunda vez chamando handleCreateLobby deve emitir erro
    clientSocket.on('join-lobby-error', (errorType: string) => {
      expect(errorType).toBe('player-already-in-lobby');
      done();
    })

    handleCreateLobby(player, 'player1');
  });
});