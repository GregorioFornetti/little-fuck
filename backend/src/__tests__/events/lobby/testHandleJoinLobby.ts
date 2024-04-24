
import { lobbys, players } from "../../../global";
import { handleJoinLobby } from "../../../events/lobby/handlers/joinLobby";
import Lobby from "../../../interfaces/Lobby";
import Player from "../../../interfaces/Player";

import { clientSocket, player, io, lobbyClientsSockets, lobbyServerSockets, serverSocket } from "../setupTests";
import EventsEmitter from "../../../events/Emitter";
import { Socket } from "socket.io";


function createLobby(player: Player) {
  lobbys['123'] = {
    lobbyId: '123',
    players: [
      {
        id: player.playerId,
        name: 'player1',
        leader: true,
        ready: false,
      }
    ]
  }
  players[player.playerId] = lobbys['123'];
}


describe("handleJoinLobby", () => {

  test("Tentar entrar em sala inexistente deve emitir erro", (done) => {
    createLobby(player);
    const joinPlayer: Player = {
      playerId: lobbyServerSockets[0].id as string,
      socket: lobbyServerSockets[0],
      eventsEmitter: new EventsEmitter(io, lobbyServerSockets[0])
    }

    clientSocket.on('join-lobby-error', (errorType: string) => {
      expect(errorType).toBe('inexistent-lobby');
      expect(lobbys['123']).toBe({ lobbyId: '123', players: [{ id: player.playerId, name: 'player1', leader: true, ready: false }] });
      expect(players[player.playerId]).toBe(lobbys['123']);
      expect(players[joinPlayer.playerId]).toBeUndefined();
      done();
    })

    handleJoinLobby(joinPlayer, '456', 'player2');
  });

  test("Tentar entrar em uma sala com jogo em andamento deve emitir erro", (done) => {
    createLobby(player);
    const joinPlayer: Player = {
      playerId: lobbyServerSockets[0].id as string,
      socket: lobbyServerSockets[0],
      eventsEmitter: new EventsEmitter(io, lobbyServerSockets[0])
    }

    clientSocket.on('join-lobby-error', (errorType: string) => {
      expect(errorType).toBe('lobby-in-game');
      expect(lobbys['123']).toBe({ lobbyId: '123', players: [{ id: player.playerId, name: 'player1', leader: true, ready: false }] });
      expect(players[player.playerId]).toBe(lobbys['123']);
      expect(players[joinPlayer.playerId]).toBeUndefined();
      done();
    })

    lobbys['123'].game = {  // Adicionando um jogo em andamento (game precisa ser definido para que o lobby seja considerado em jogo)
      playersHealth: {},
      currentWaitTime: 0,
      matchNumber: 0,
      roundNumber: 0
    }
    handleJoinLobby(joinPlayer, '123', 'player2');
  });

  test("Nome vazio deve emitir erro", (done) => {
    createLobby(player);
    const joinPlayer: Player = {
      playerId: lobbyServerSockets[0].id as string,
      socket: lobbyServerSockets[0],
      eventsEmitter: new EventsEmitter(io, lobbyServerSockets[0])
    }

    clientSocket.on('join-lobby-error', (errorType: string) => {
      expect(errorType).toBe('no-name');
      expect(lobbys['123']).toBe({ lobbyId: '123', players: [{ id: player.playerId, name: 'player1', leader: true, ready: false }] });
      expect(players[player.playerId]).toBe(lobbys['123']);
      expect(players[joinPlayer.playerId]).toBeUndefined();
      done();
    })

    handleJoinLobby(joinPlayer, '123', '');
  });

  test("Nome apenas com espaços deve emitir erro", (done) => {
    createLobby(player);
    const joinPlayer: Player = {
      playerId: lobbyServerSockets[0].id as string,
      socket: lobbyServerSockets[0],
      eventsEmitter: new EventsEmitter(io, lobbyServerSockets[0])
    }

    clientSocket.on('join-lobby-error', (errorType: string) => {
      expect(errorType).toBe('no-name');
      expect(lobbys['123']).toBe({ lobbyId: '123', players: [{ id: player.playerId, name: 'player1', leader: true, ready: false }] });
      expect(players[player.playerId]).toBe(lobbys['123']);
      expect(players[joinPlayer.playerId]).toBeUndefined();
      done();
    })

    handleJoinLobby(joinPlayer, '123', '       ');
  });

  test("Nome repetido deve emitir erro", (done) => {
    createLobby(player);
    const joinPlayer: Player = {
      playerId: lobbyServerSockets[0].id as string,
      socket: lobbyServerSockets[0],
      eventsEmitter: new EventsEmitter(io, lobbyServerSockets[0])
    }

    clientSocket.on('join-lobby-error', (errorType: string) => {
      expect(errorType).toBe('repeated-name');
      expect(lobbys['123']).toBe({ lobbyId: '123', players: [{ id: player.playerId, name: 'player1', leader: true, ready: false }] });
      expect(players[player.playerId]).toBe(lobbys['123']);
      expect(players[joinPlayer.playerId]).toBeUndefined();
      done();
    })

    handleJoinLobby(joinPlayer, '123', 'player1');
  });

  test("Tentar entrar em lobby com jogador já em outro lobby deve emitir erro", (done) => {
    clientSocket.on('join-lobby-error', (errorType: string) => {
      expect(errorType).toBe('player-already-in-lobby');
      expect(lobbys['123']).toBe({ lobbyId: '123', players: [{ id: player.playerId, name: 'player1', leader: true, ready: false }] });
      expect(players[player.playerId]).toBe(lobbys['123']);
      done();
    })

    handleJoinLobby(player, '123', 'player2');
  });

  describe("Entrar em lobby de forma válida", () => {
    const addPlayerToLobby = (player: Player, socket: Socket, name: string) => {
      createLobby(player)
      const joinPlayer: Player = {
        playerId: socket.id as string,
        socket: socket,
        eventsEmitter: new EventsEmitter(io, socket)
      }
      handleJoinLobby(joinPlayer, '123', name);
    }


    describe("Com um jogador entrando no lobby", () => {

      test("Deve emitir sucesso ao cliente que entrou no lobby", (done) => {
        addPlayerToLobby(player, lobbyServerSockets[0], 'player2');

        lobbyClientsSockets[0].on('join-lobby-success', (lobby: Lobby) => {
          expect(lobby).toBe(lobbys['123']);
          done();
        })
      })

      test("Deve cadastrar o jogador no lobby", () => {
        addPlayerToLobby(player, lobbyServerSockets[0], 'player2');

        expect(lobbys['123'].players).toHaveLength(2);
        expect(lobbys['123'].players[1].id).toBe(lobbyServerSockets[0].id);
        expect(lobbys['123'].players[1].name).toBe('player2');
        expect(lobbys['123'].players[1].leader).toBe(false);
        expect(lobbys['123'].players[1].ready).toBe(false);
      })

      test("Deve cadastar o lobby no jogador", () => {
        addPlayerToLobby(player, lobbyServerSockets[0], 'player2');

        expect(players[lobbyServerSockets[0].id]).toBe(lobbys['123']);
      })

      test("Deve emitir para todos os jogadores do lobby que um novo jogador entrou", (done) => {
        let count = { value: 0 }
        addPlayerToLobby(player, lobbyServerSockets[0], 'player2');

        const handler = (id: string, name: string) => {
          expect(id).toBe(lobbyServerSockets[0].id);
          expect(name).toBe('player2');
          if (count.value === 1) {
              done()
          }
          count.value++
        }

        clientSocket.on('player-join', handler)
        lobbyClientsSockets[1].on('player-join', handler)
      })
    })

    
    describe("Com dois jogadores entrando no lobby", () => {
      test("Deve emitir sucesso aos clientes que entraram no lobby", (done) => {
        addPlayerToLobby(player, lobbyServerSockets[0], 'player2');
        addPlayerToLobby(player, lobbyServerSockets[1], 'player3');

        lobbyClientsSockets[0].on('join-lobby-success', (lobby: Lobby) => {
          expect(lobby).toBe({ lobbyId: '123', players: [{ id: player.playerId, name: 'player1', leader: true, ready: false }] });
          expect(players[player.playerId]).toBe(lobbys['123']);
        })

        lobbyClientsSockets[1].on('join-lobby-success', (lobby: Lobby) => {
          expect(lobby).toBe({ lobbyId: '123', players: [{ id: player.playerId, name: 'player1', leader: true, ready: false }, { id: lobbyServerSockets[0].id, name: 'player2', leader: false, ready: false }]});
          done();
        })
      })

      test("Deve cadastrar os jogadores no lobby", () => {
        addPlayerToLobby(player, lobbyServerSockets[0], 'player2');
        addPlayerToLobby(player, lobbyServerSockets[1], 'player3');

        expect(lobbys['123'].players).toHaveLength(3);
        expect(lobbys['123'].players[1].id).toBe(lobbyServerSockets[0].id);
        expect(lobbys['123'].players[1].name).toBe('player2');
        expect(lobbys['123'].players[1].leader).toBe(false);
        expect(lobbys['123'].players[1].ready).toBe(false);

        expect(lobbys['123'].players[2].id).toBe(lobbyServerSockets[1].id);
        expect(lobbys['123'].players[2].name).toBe('player3');
        expect(lobbys['123'].players[2].leader).toBe(false);
        expect(lobbys['123'].players[2].ready).toBe(false);
      })

      test("Deve cadastar o lobby nos jogadores", () => {
        addPlayerToLobby(player, lobbyServerSockets[0], 'player2');
        addPlayerToLobby(player, lobbyServerSockets[1], 'player3');

        expect(players[lobbyServerSockets[0].id]).toBe(lobbys['123']);
        expect(players[lobbyServerSockets[1].id]).toBe(lobbys['123']);
      })

      test("Deve emitir para todos os jogadores do lobby que novos jogadores entraram", (done) => {
        let count = { value: 0 }
        addPlayerToLobby(player, lobbyServerSockets[0], 'player2');

        const handler = (id: string, name: string) => {
          expect(id).toBe(lobbyServerSockets[0].id);
          expect(name).toBe('player2');
          if (count.value === 1) {
              done()
          }
          count.value++
        }

        clientSocket.on('player-join', handler)
        lobbyClientsSockets[0].on('player-join', handler)

        count.value = 0

        addPlayerToLobby(player, lobbyServerSockets[1], 'player3');

        const handler2 = (id: string, name: string) => {
          expect(id).toBe(lobbyServerSockets[1].id);
          expect(name).toBe('player3');
          if (count.value === 2) {
              done()
          }
          count.value++
        }

        clientSocket.removeAllListeners()
        lobbyClientsSockets[0].removeAllListeners()

        clientSocket.on('player-join', handler2)
        lobbyClientsSockets[0].on('player-join', handler2)
        lobbyClientsSockets[1].on('player-join', handler2)
      })
    })
  })
});