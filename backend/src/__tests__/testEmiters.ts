
import EventsEmitter from "../events/Emitter";
import { lobbys, players } from "../global";
import Lobby from "../interfaces/Lobby";
import { io, clientSocket, eventsEmitter, lobbyClientsSockets, lobbyServerSockets } from "./setupTests";
import { Socket as ClientSocket } from "socket.io-client";
import { Socket as ServerSocket } from "socket.io";


function joinLobby(clientSockets: ClientSocket[], serverSockets: ServerSocket[]) {
    const lobby: Lobby = {
        lobbyId: '1',
        players: [
            {
                id: clientSockets[0].id as string,
                name: 'player1',
                leader: true,
                ready: false
            },
            {
                id: clientSockets[1].id as string,
                name: 'player2',
                leader: false,
                ready: false
            }
        ]
    }
    lobbys[lobby.lobbyId] = lobby;
    players[clientSockets[0].id as string] = lobby;
    players[clientSockets[1].id as string] = lobby;
    serverSockets[0].leave(lobby.lobbyId)
    serverSockets[1].leave(lobby.lobbyId)
    serverSockets[0].join(lobby.lobbyId);
    serverSockets[1].join(lobby.lobbyId);


    return new EventsEmitter(io, clientSockets[0], lobby.lobbyId);
}



describe("Testes de envio de mensagem / eventos pelo servidor", () => {
    
    describe("Lobby events", () => {

        test("join-lobby-success", (done) => {
            clientSocket.on('join-lobby-success', (lobby) => {
                expect(lobby.lobbyId).toBe('1');
                expect(lobby.players).toHaveLength(1);
                expect(lobby.players[0].id).toBe('1');
                expect(lobby.players[0].name).toBe('player1');
                expect(lobby.players[0].leader).toBe(true);
                expect(lobby.players[0].ready).toBe(false);
                done()
            })

            eventsEmitter.Lobby.emitJoinLobbySuccess({
                lobbyId: '1',
                players: [
                    {
                        id: '1',
                        name: 'player1',
                        leader: true,
                        ready: false
                    }
                ]
            })
        })

        test("join-lobby-error", (done) => {
            clientSocket.on('join-lobby-error', (errorType) => {
                expect(errorType).toBe('no-name');
                done()
            })

            eventsEmitter.Lobby.emitJoinLobbyError('no-name');
        })

        test("player-join", (done) => {
            const lobbyEmitter = joinLobby(lobbyClientsSockets, lobbyServerSockets);
            let count = { value: 0 }

            lobbyClientsSockets[0].on('player-join', (player) => {
                expect(player.id).toBe('2');
                expect(player.name).toBe('player2');
                if (count.value === 1) {
                    done()
                }
                count.value++
            })

            lobbyClientsSockets[1].on('player-join', (player) => {
                expect(player.id).toBe('2');
                expect(player.name).toBe('player2');
                if (count.value === 1) {
                    done()
                }
                count.value++
            })

            lobbyEmitter.Lobby.emitPlayerJoin('2', 'player2');
        })

        test("player-logout", (done) => {
            const lobbyEmitter = joinLobby(lobbyClientsSockets, lobbyServerSockets);
            let count = { value: 0 }

            lobbyClientsSockets[0].on('player-logout', (id) => {
                expect(id).toBe('1');
                if (count.value === 1) {
                    done()
                }
                count.value++
            })

            lobbyClientsSockets[1].on('player-logout', (id) => {
                expect(id).toBe('1');
                if (count.value === 1) {
                    done()
                }
                count.value++
            })

            lobbyEmitter.Lobby.emitPlayerLogout('1');
        })

        test("player-logout-error", (done) => {
            clientSocket.on('player-logout-error', (errorType) => {
                expect(errorType).toBe('not-in-lobby');
                done()
            })

            eventsEmitter.Lobby.emitPlayerLogoutError('not-in-lobby');
        })

        test("player-ready", (done) => {
            const lobbyEmitter = joinLobby(lobbyClientsSockets, lobbyServerSockets);
            let count = { value: 0 }

            lobbyClientsSockets[0].on('player-ready', (id) => {
                expect(id).toBe('1');
                if (count.value === 1) {
                    done()
                }
                count.value++
            })

            lobbyClientsSockets[1].on('player-ready', (id) => {
                expect(id).toBe('1');
                if (count.value === 1) {
                    done()
                }
                count.value++
            })

            lobbyEmitter.Lobby.emitPlayerReady('1');
        })

        test("player-ready-error", (done) => {
            clientSocket.on('player-ready-error', (errorType) => {
                expect(errorType).toBe('not-in-lobby');
                done()
            })

            eventsEmitter.Lobby.emitPlayerReadyError('not-in-lobby');
        })

        test("player-unready", (done) => {
            const lobbyEmitter = joinLobby(lobbyClientsSockets, lobbyServerSockets);
            let count = { value: 0 }

            lobbyClientsSockets[0].on('player-unready', (id) => {
                expect(id).toBe('1');
                if (count.value === 1) {
                    done()
                }
                count.value++
            })

            lobbyClientsSockets[1].on('player-unready', (id) => {
                expect(id).toBe('1');
                if (count.value === 1) {
                    done()
                }
                count.value++
            })

            lobbyEmitter.Lobby.emitPlayerUnready('1');
        })

        test("player-unready-error", (done) => {
            clientSocket.on('player-unready-error', (errorType) => {
                expect(errorType).toBe('not-in-lobby');
                done()
            })

            eventsEmitter.Lobby.emitPlayerUnreadyError('not-in-lobby');
        })

        test("start-game-error", (done) => {
            clientSocket.on('start-game-error', (errorType) => {
                expect(errorType).toBe('already-in-game');
                done()
            })

            eventsEmitter.Lobby.emitStartGameError('already-in-game');
        })

        test("reconnect", (done) => {
            clientSocket.on('reconnect', (lobby) => {
                expect(lobby.lobbyId).toBe('1');
                expect(lobby.players).toHaveLength(1);
                expect(lobby.players[0].id).toBe('1');
                expect(lobby.players[0].name).toBe('player1');
                expect(lobby.players[0].leader).toBe(true);
                expect(lobby.players[0].ready).toBe(false);
                done()
            })
    
            eventsEmitter.Lobby.emitReconnect({
                lobbyId: '1',
                players: [
                    {
                        id: '1',
                        name: 'player1',
                        leader: true,
                        ready: false
                    }
                ]
            })
        })
    })

    describe("Game events", () => {
        test("start-game", (done) => {
            const lobbyEmitter = joinLobby(lobbyClientsSockets, lobbyServerSockets);
            let count = { value: 0 }

            lobbyClientsSockets[0].on('start-game', (a) => {
                if (count.value === 1) {
                    done()
                }
                count.value++
            })

            lobbyClientsSockets[1].on('start-game', (a) => {
                if (count.value === 1) {
                    done()
                }
                count.value++
            })

            lobbyEmitter.Game.emitStartGame();
        })

        test("end-game", (done) => {
            const lobbyEmitter = joinLobby(lobbyClientsSockets, lobbyServerSockets);
            let count = { value: 0 }

            lobbyClientsSockets[0].on('end-game', (playersRanks) => {
                expect(playersRanks).toHaveLength(2);
                expect(playersRanks[0]).toBe('1');
                expect(playersRanks[1]).toBe('2');
                if (count.value === 1) {
                    done()
                }
                count.value++
            })

            lobbyClientsSockets[1].on('end-game', (playersRanks) => {
                expect(playersRanks).toHaveLength(2);
                expect(playersRanks[0]).toBe('1');
                expect(playersRanks[1]).toBe('2');
                if (count.value === 1) {
                    done()
                }
                count.value++
            })

            lobbyEmitter.Game.emitEndGame(['1', '2']);
        })
    })
})