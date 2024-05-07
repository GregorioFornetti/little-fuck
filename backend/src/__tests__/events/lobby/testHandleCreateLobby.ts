
import { lobbys, players } from "../../../global";
import { handleCreateLobby } from "../../../events/lobby/handlers/createLobby";
import Lobby from "../../../interfaces/Lobby";

import { clientSocket, player, io } from "../setupTests";


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

  test("Criar lobby com jogador já em outro lobby deve emitir erro", (done) => {

    // A primeira vez chamando handleCreateLobby deve ser bem sucedida
    clientSocket.on('join-lobby-success', (lobby: Lobby) => {
      player.lobby = lobby;
      handleCreateLobby(player, 'player1');
    })

    // A segunda vez chamando handleCreateLobby deve emitir erro
    clientSocket.on('join-lobby-error', (errorType: string) => {
      expect(errorType).toBe('player-already-in-lobby');
      player.lobby = undefined;
      done();
    })

    handleCreateLobby(player, 'player1');
  });

  describe("Criar lobby com nome válido", () => {
    test("Lobby deve ser criado com as informações corretas", (done) => {
      clientSocket.on('join-lobby-success', (lobby: Lobby) => {
        // Verifica se as informações do lobby foram enviadas corretamente para o jogador
        expect(lobby.lobbyId).toBeDefined();
        expect(lobby.players).toHaveLength(1);
        expect(lobby.players[0].id).toBe(player.playerId);
        expect(lobby.players[0].name).toBe('player1');
        expect(lobby.players[0].leader).toBe(true);
        expect(lobby.players[0].ready).toBe(false);
        expect(lobby.game).toBeUndefined();
        done();
      })
      
      handleCreateLobby(player, 'player1');
    })

    test("As informações do lobby foram salvas corretamente no servidor", (done) => {
      clientSocket.on('join-lobby-success', (lobby: Lobby) => {
        // Verifica se as informações do lobby foram salvas corretamente no servidor
        expect(lobbys[lobby.lobbyId]).toEqual(lobby);
        expect(players[player.playerId]).toEqual(lobby);
        done();
      })
  
      handleCreateLobby(player, 'player1');
    })
  })
});