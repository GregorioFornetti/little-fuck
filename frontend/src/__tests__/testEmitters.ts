

import { clientSocket, serverSocket } from "./setupTests";
import EventsEmitter from "../events/EventsEmitter";

describe("Testes de envio de mensagem / eventos pelo servidor", () => {
    
    describe("Lobby events", () => {
        test("create-lobby", (done) => {
            const eventsEmitter = new EventsEmitter(clientSocket)
            serverSocket.on('create-lobby', (name: string) => {
                expect(name).toBe('Player1')
                done()
            })

            eventsEmitter.lobby.emitCreateLobby('Player1')
        })

        test("join-lobby", (done) => {
            const eventsEmitter = new EventsEmitter(clientSocket)
            serverSocket.on('join-lobby', (lobbyId: string, name: string) => {
                expect(lobbyId).toBe('123')
                expect(name).toBe('Player1')
                done()
            })

            eventsEmitter.lobby.emitJoinLoby('123', 'Player1')
        })

        test("logout", (done) => {
            const eventsEmitter = new EventsEmitter(clientSocket)
            serverSocket.on('logout', () => {
                done()
            })

            eventsEmitter.lobby.emitLogout()
        })

        test("ready", (done) => {
            const eventsEmitter = new EventsEmitter(clientSocket)
            serverSocket.on('ready', () => {
                done()
            })

            eventsEmitter.lobby.emitReady()
        })

        test("unready", (done) => {
            const eventsEmitter = new EventsEmitter(clientSocket)
            serverSocket.on('unready', () => {
                done()
            })

            eventsEmitter.lobby.emitUnready()
        })

        test("start-game-request", (done) => {
            const eventsEmitter = new EventsEmitter(clientSocket)
            serverSocket.on('start-game-request', () => {
                done()
            })
            eventsEmitter.lobby.emitStartGameRequest()
        })
    })

    describe("Game events", () => {

    })

    describe("Match events", () => {
        test("win-rounds-number-response", (done) => {
            const eventsEmitter = new EventsEmitter(clientSocket)
            serverSocket.on('win-rounds-number-response', (winRounds: number) => {
                expect(winRounds).toBe(5)
                done()
            })

            eventsEmitter.match.emitWinRoundsNumberResponse(5)
        })
    })

    describe("Round events", () => {
        test("select-card", (done) => {
            const eventsEmitter = new EventsEmitter(clientSocket)
            serverSocket.on('select-card', (card: number) => {
                expect(card).toBe(1)
                done()
            })

            eventsEmitter.round.emitSelectCard(1)
        })
    })
})