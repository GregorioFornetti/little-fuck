
import EventsEmitter from "../events/Emitter";
import { clientSocket, serverSocket } from "./setupTests";
import { Socket as ClientSocket } from "socket.io-client";
import { Socket as ServerSocket } from "socket.io";

describe("Testes de envio de mensagem / eventos pelo servidor", () => {
    
    describe("Lobby events", () => {
        test("create-lobby", (done) => {
            serverSocket.on('create-lobby', (name: string) => {
                expect(name).toBe('Player1')
                done()
            })

            EventsEmitter.Lobby.emitCreateLobby('Player1')
        })

        test("join-lobby", (done) => {
            serverSocket.on('join-lobby', (lobbyId: string, name: string) => {
                expect(lobbyId).toBe('123')
                expect(name).toBe('Player1')
                done()
            })

            EventsEmitter.Lobby.emitJoinLoby('123', 'Player1')
        })

        test("logout", (done) => {
            serverSocket.on('logout', () => {
                done()
            })

            EventsEmitter.Lobby.emitLogout()
        })

        test("ready", (done) => {
            serverSocket.on('ready', () => {
                done()
            })

            EventsEmitter.Lobby.emitReady()
        })

        test("unready", (done) => {
            serverSocket.on('unready', () => {
                done()
            })

            EventsEmitter.Lobby.emitUnready()
        })

        test("start-game-request", (done) => {
            serverSocket.on('start-game-request', () => {
                done()
            })
            EventsEmitter.Lobby.emitStartGameRequest()
        })
    })

    describe("Game events", () => {

    })

    describe("Match events", () => {
        test("win-rounds-number-response", (done) => {
            serverSocket.on('win-rounds-number-response', (winRounds: number) => {
                expect(winRounds).toBe(5)
                done()
            })

            EventsEmitter.Match.emitWinRoundsNumberResponse(5)
        })
    })

    describe("Round events", () => {
        test("select-card", (done) => {
            serverSocket.on('select-card', (card: number) => {
                expect(card).toBe(1)
                done()
            })

            EventsEmitter.Round.emitSelectCard(1)
        })
    })
})