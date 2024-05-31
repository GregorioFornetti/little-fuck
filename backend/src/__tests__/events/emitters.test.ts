
import EventsEmitter from "../../events/Emitter";
import { lobbys, players } from "../../global";
import Lobby, { Card, RoundCards, SpecialMatchCards } from "../../interfaces/Lobby";
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
    players[clientSockets[0].id as string] = { socket: serverSockets[0], lobby: lobby };
    players[clientSockets[1].id as string] = { socket: serverSockets[1], lobby: lobby };
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

            lobbyClientsSockets[0].on('player-join', (id: string, name: string) => {
                expect(id).toBe('2');
                expect(name).toBe('player2');
                if (count.value === 1) {
                    done()
                }
                count.value++
            })

            lobbyClientsSockets[1].on('player-join', (id: string, name: string) => {
                expect(id).toBe('2');
                expect(name).toBe('player2');
                if (count.value === 1) {
                    done()
                }
                count.value++
            })

            lobbyEmitter.Lobby.emitPlayerJoin('2', 'player2');
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

    describe("Match events", () => {
        test("start-match", (done) => {
            const lobbyEmitter = joinLobby(lobbyClientsSockets, lobbyServerSockets);
            let count = { value: 0 }

            lobbyClientsSockets[0].on('start-match', (cards: Card[], firstPlayerId: string) => {
                expect(cards).toHaveLength(2);
                expect(cards[0].type).toBe('common');
                expect(cards[0].value).toBe(1);
                expect(cards[1].type).toBe('common');
                expect(cards[1].value).toBe(2);
                expect(firstPlayerId).toBe(lobbyClientsSockets[0].id as string);
                if (count.value === 1) {
                    done()
                }
                count.value++
            })

            lobbyClientsSockets[1].on('start-match', (cards: Card[], firstPlayerId: string) => {
                expect(cards).toHaveLength(2);
                expect(cards[0].type).toBe('common');
                expect(cards[0].value).toBe(3);
                expect(cards[1].type).toBe('common');
                expect(cards[1].value).toBe(4);
                expect(firstPlayerId).toBe(lobbyClientsSockets[0].id as string);
                if (count.value === 1) {
                    done()
                }
                count.value++
            })
            
            const cards: { [playerId: string]: Card[] }= {}
            cards[lobbyClientsSockets[0].id as string] = [
                {
                    type: 'common',
                    value: 1
                },
                {
                    type: 'common',
                    value: 2
                }
            ]
            cards[lobbyClientsSockets[1].id as string] = [
                {
                    type: 'common',
                    value: 3
                },
                {
                    type: 'common',
                    value: 4
                }
            ]
            lobbyEmitter.Match.emitStartMatch(cards, lobbyClientsSockets[0].id as string);
        })

        test("win-rounds-number-update", (done) => {
            const lobbyEmitter = joinLobby(lobbyClientsSockets, lobbyServerSockets);
            let count = { value: 0 }

            lobbyClientsSockets[0].on('win-rounds-number-update', (numWinMatches: number, nextPlayerId: string) => {
                expect(numWinMatches).toBe(2);
                expect(nextPlayerId).toBe(lobbyClientsSockets[1].id as string);
                if (count.value === 1) {
                    done()
                }
                count.value++
            })

            lobbyClientsSockets[1].on('win-rounds-number-update', (numWinMatches: number, nextPlayerId: string) => {
                expect(numWinMatches).toBe(2);
                expect(nextPlayerId).toBe(lobbyClientsSockets[1].id as string);
                if (count.value === 1) {
                    done()
                }
                count.value++
            })

            lobbyEmitter.Match.emitWinRoundsNumberUpdate(2, lobbyClientsSockets[1].id as string);
        })

        test("win-rounds-number-error", (done) => {
            clientSocket.on('win-rounds-number-error', (errorType: string) => {
                expect(errorType).toBe('not-in-lobby');
                done()
            })

            eventsEmitter.Match.emitWinRoundsNumberError('not-in-lobby');
        })

        test("end-match", (done) => {
            const lobbyEmitter = joinLobby(lobbyClientsSockets, lobbyServerSockets);
            let count = { value: 0 }

            lobbyClientsSockets[0].on('end-match', (healthUpdates: { [playerId: string]: number }) => {
                expect(healthUpdates[lobbyClientsSockets[0].id as string]).toBe(-1);
                expect(healthUpdates[lobbyClientsSockets[1].id as string]).toBe(0);
                if (count.value === 1) {
                    done()
                }
                count.value++
            })

            lobbyClientsSockets[1].on('end-match', (healthUpdates: { [playerId: string]: number }) => {
                expect(healthUpdates[lobbyClientsSockets[0].id as string]).toBe(-1);
                expect(healthUpdates[lobbyClientsSockets[1].id as string]).toBe(0);
                if (count.value === 1) {
                    done()
                }
                count.value++
            })

            const healthUpdates: { [playerId: string]: number } = {}
            healthUpdates[lobbyClientsSockets[0].id as string] = -1
            healthUpdates[lobbyClientsSockets[1].id as string] = 0
            lobbyEmitter.Match.emitEndMatch(healthUpdates);
        })

        test("start-special-match", (done) => {
            const lobbyEmitter = joinLobby(lobbyClientsSockets, lobbyServerSockets);
            let count = { value: 0 }

            lobbyClientsSockets[0].on('start-special-match', (cards: SpecialMatchCards, firstPlayerId: string) => {
                expect(cards.onMatch).toHaveLength(1)
                expect(cards.onMatch[0].card.type).toBe('common')
                expect(cards.onMatch[0].card.value).toBe(2)
                expect(cards.onMatch[0].playerId).toBe(lobbyClientsSockets[1].id as string)
                expect(cards.anulledCards).toHaveLength(0)
                expect(firstPlayerId).toBe(lobbyClientsSockets[0].id as string);
                if (count.value === 1) {
                    done()
                }
                count.value++
            })

            lobbyClientsSockets[1].on('start-special-match', (cards: SpecialMatchCards, firstPlayerId: string) => {
                expect(cards.onMatch).toHaveLength(1)
                expect(cards.onMatch[0].card.type).toBe('common')
                expect(cards.onMatch[0].card.value).toBe(1)
                expect(cards.onMatch[0].playerId).toBe(lobbyClientsSockets[0].id as string)
                expect(cards.anulledCards).toHaveLength(0)
                expect(firstPlayerId).toBe(lobbyClientsSockets[0].id as string);
                if (count.value === 1) {
                    done()
                }
                count.value++
            })
            
            const cards: { [playerId: string]: SpecialMatchCards }= {}
            cards[lobbyClientsSockets[0].id as string] = {
                onMatch: [
                    {
                        card: {
                            type: 'common',
                            value: 2
                        },
                        playerId: lobbyClientsSockets[1].id as string
                    }
                ],
                anulledCards: [

                ]
            }
            cards[lobbyClientsSockets[1].id as string] = {
                onMatch: [
                    {
                        card: {
                            type: 'common',
                            value: 1
                        },
                        playerId: lobbyClientsSockets[0].id as string
                    }
                ],
                anulledCards: [

                ]
            }
            lobbyEmitter.Match.emitStartSpecialMatch(cards, lobbyClientsSockets[0].id as string);
        })
    })

    describe("Round events", () => {
        test("start-round", (done) => {
            const lobbyEmitter = joinLobby(lobbyClientsSockets, lobbyServerSockets);
            let count = { value: 0 }

            lobbyClientsSockets[0].on('start-round', (firstPlayerId: string) => {
                expect(firstPlayerId).toBe(lobbyClientsSockets[0].id as string);
                if (count.value === 1) {
                    done()
                }
                count.value++
            })

            lobbyClientsSockets[1].on('start-round', (firstPlayerId: string) => {
                expect(firstPlayerId).toBe(lobbyClientsSockets[0].id as string);
                if (count.value === 1) {
                    done()
                }
                count.value++
            })

            lobbyEmitter.Round.emitStartRound(lobbyClientsSockets[0].id as string);
        })

        test("table-update", (done) => {
            const lobbyEmitter = joinLobby(lobbyClientsSockets, lobbyServerSockets);
            let count = { value: 0 }

            lobbyClientsSockets[0].on('table-update', (cards: RoundCards, nextPlayerId: string) => {
                expect(cards.onMatch).toHaveLength(2)
                expect(cards.onMatch[0].card.type).toBe('common')
                expect(cards.onMatch[0].card.value).toBe(1)
                expect(cards.onMatch[0].playerId).toBe(lobbyClientsSockets[0].id as string)
                expect(cards.onMatch[1].card.type).toBe('common')
                expect(cards.onMatch[1].card.value).toBe(2)
                expect(cards.onMatch[1].playerId).toBe(lobbyClientsSockets[1].id as string)
                expect(cards.anulledCards).toHaveLength(0)
                expect(nextPlayerId).toBe(lobbyClientsSockets[0].id as string);
                if (count.value === 1) {
                    done()
                }
                count.value++
            })

            lobbyClientsSockets[1].on('table-update', (table: RoundCards, nextPlayerId: string) => {
                expect(table.onMatch).toHaveLength(2)
                expect(table.onMatch[0].card.type).toBe('common')
                expect(table.onMatch[0].card.value).toBe(1)
                expect(table.onMatch[0].playerId).toBe(lobbyClientsSockets[0].id as string)
                expect(table.onMatch[1].card.type).toBe('common')
                expect(table.onMatch[1].card.value).toBe(2)
                expect(table.onMatch[1].playerId).toBe(lobbyClientsSockets[1].id as string)
                expect(table.anulledCards).toHaveLength(0)
                expect(nextPlayerId).toBe(lobbyClientsSockets[0].id as string);
                if (count.value === 1) {
                    done()
                }
                count.value++
            })

            const roundCards: RoundCards = {
                onMatch: [
                    {
                        card: {
                            type: 'common',
                            value: 1
                        },
                        playerId: lobbyClientsSockets[0].id as string
                    },
                    {
                        card: {
                            type: 'common',
                            value: 2
                        },
                        playerId: lobbyClientsSockets[1].id as string
                    }
                ],
                anulledCards: [

                ]
            }
            lobbyEmitter.Round.emitTableUpdate(roundCards, lobbyClientsSockets[0].id as string);
        })

        test("select-card-error", (done) => {
            clientSocket.on('select-card-error', (errorType: string) => {
                expect(errorType).toBe('not-in-lobby');
                done()
            })

            eventsEmitter.Round.emitSelectCardError('not-in-lobby');
        })

        test("end-round", (done) => {
            const lobbyEmitter = joinLobby(lobbyClientsSockets, lobbyServerSockets);
            let count = { value: 0 }

            lobbyClientsSockets[0].on('end-round', (winnerId: string, points: number) => {
                expect(winnerId).toBe(lobbyClientsSockets[0].id as string);
                expect(points).toBe(1);
                if (count.value === 1) {
                    done()
                }
                count.value++
            })

            lobbyClientsSockets[1].on('end-round', (winnerId: string, points: number) => {
                expect(winnerId).toBe(lobbyClientsSockets[0].id as string);
                expect(points).toBe(1);
                if (count.value === 1) {
                    done()
                }
                count.value++
            })

            lobbyEmitter.Round.emitEndRound(lobbyClientsSockets[0].id as string, 1);
        })
    })

    describe("General events", () => {
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

            lobbyEmitter.General.emitPlayerLogout('1');
        })

        test("player-logout-error", (done) => {
            clientSocket.on('player-logout-error', (errorType) => {
                expect(errorType).toBe('not-in-lobby');
                done()
            })

            eventsEmitter.General.emitPlayerLogoutError('not-in-lobby');
        })
    })
})