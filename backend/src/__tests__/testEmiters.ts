
import EventsEmitter from "../events/Emitter";
import { lobbys, players } from "../global";
import Lobby from "../interfaces/Lobby";
import { io, clientSocket, eventsEmitter, lobbyClientsSockets } from "./setupTests";
import { Socket as ClientSocket } from "socket.io-client";


function joinLobby(clientSockets: ClientSocket[]) {
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

    return new EventsEmitter(io, clientSockets[0], lobby.lobbyId);
}

describe("Testes de envio de mensagem / eventos pelo servidor", () => {
    
    describe("Lobby events", () => {

        test("join-lobby-success", () => {
            clientSocket.on('join-lobby-success', (lobby) => {
                expect(lobby.lobbyId).toBe('1');
                expect(lobby.players).toHaveLength(1);
                expect(lobby.players[0].id).toBe('1');
                expect(lobby.players[0].name).toBe('player1');
                expect(lobby.players[0].leader).toBe(true);
                expect(lobby.players[0].ready).toBe(false);
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

        test("join-lobby-error", () => {
            clientSocket.on('join-lobby-error', (errorType) => {
                expect(errorType).toBe('no-name');
            })

            eventsEmitter.Lobby.emitJoinLobbyError('no-name');
        })

        test("player-join", () => {
            const lobbyEmitter = joinLobby(lobbyClientsSockets);

            lobbyClientsSockets[0].on('player-join', (player) => {
                expect(player.id).toBe('2');
                expect(player.name).toBe('player2');
            })

            lobbyClientsSockets[1].on('player-join', (player) => {
                expect(player.id).toBe('2');
                expect(player.name).toBe('player2');
            })

            lobbyEmitter.Lobby.emitPlayerJoin('2', 'player2');
        })

        test("player-logout", () => {
            const lobbyEmitter = joinLobby(lobbyClientsSockets);

            lobbyClientsSockets[0].on('player-logout', (id) => {
                expect(id).toBe('1');
            })

            lobbyClientsSockets[1].on('player-logout', (id) => {
                expect(id).toBe('1');
            })

            lobbyEmitter.Lobby.emitPlayerLogout('1');
        })

        test("player-logout-error", () => {
            clientSocket.on('player-logout-error', (errorType) => {
                expect(errorType).toBe('not-in-lobby');
            })

            eventsEmitter.Lobby.emitPlayerLogoutError('not-in-lobby');
        })

        test("player-ready", () => {
            const lobbyEmitter = joinLobby(lobbyClientsSockets);

            lobbyClientsSockets[0].on('player-ready', (id) => {
                expect(id).toBe('1');
            })

            lobbyClientsSockets[1].on('player-ready', (id) => {
                expect(id).toBe('1');
            })

            lobbyEmitter.Lobby.emitPlayerReady('1');
        })

        test("player-ready-error", () => {
            clientSocket.on('player-ready-error', (errorType) => {
                expect(errorType).toBe('not-in-lobby');
            })

            eventsEmitter.Lobby.emitPlayerReadyError('not-in-lobby');
        })

        test("player-unready", () => {
            const lobbyEmitter = joinLobby(lobbyClientsSockets);

            lobbyClientsSockets[0].on('player-unready', (id) => {
                expect(id).toBe('1');
            })

            lobbyClientsSockets[1].on('player-unready', (id) => {
                expect(id).toBe('1');
            })

            lobbyEmitter.Lobby.emitPlayerUnready('1');
        })

        test("player-unready-error", () => {
            clientSocket.on('player-unready-error', (errorType) => {
                expect(errorType).toBe('not-in-lobby');
            })

            eventsEmitter.Lobby.emitPlayerUnreadyError('not-in-lobby');
        })

        test("start-game-error", () => {
            clientSocket.on('start-game-error', (errorType) => {
                expect(errorType).toBe('already-in-game');
            })

            eventsEmitter.Lobby.emitStartGameError('already-in-game');
        })

        test("reconnect", () => {
            clientSocket.on('reconnect', (lobby) => {
                expect(lobby.lobbyId).toBe('1');
                expect(lobby.players).toHaveLength(1);
                expect(lobby.players[0].id).toBe('1');
                expect(lobby.players[0].name).toBe('player1');
                expect(lobby.players[0].leader).toBe(true);
                expect(lobby.players[0].ready).toBe(false);
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
        
    })
})