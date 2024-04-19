
import { io, clientSocket, serverSocket, player } from "./setupTests";
import addEventsListeners from "../../events/addEventsListeners";

import { handleCreateLobby } from "../../events/lobby/handlers/createLobby";
import { handleJoinLobby } from "../../events/lobby/handlers/joinLobby";
import { handleLogout } from "../../events/lobby/handlers/logout";
import { handleReady } from "../../events/lobby/handlers/ready";
import { handleStartGameRequest } from "../../events/lobby/handlers/startGameRequest";
import { handleUnready } from "../../events/lobby/handlers/unready";
import { handleWinRoundsNumberResponse } from "../../events/match/handlers/winRoundsNumberResponse";
import { handleSelectCard } from "../../events/round/handlers/selectCard";

import EventsEmitter from "../../events/Emitter";
import { Socket } from "socket.io";
import { players } from "../../global";


jest.mock("../../events/lobby/handlers/createLobby");
jest.mock("../../events/lobby/handlers/joinLobby");
jest.mock("../../events/lobby/handlers/logout");
jest.mock("../../events/lobby/handlers/ready");
jest.mock("../../events/lobby/handlers/startGameRequest");
jest.mock("../../events/lobby/handlers/unready");

jest.mock("../../events/match/handlers/winRoundsNumberResponse")

jest.mock("../../events/round/handlers/selectCard")


function getPlayer(socket: Socket) {
    return {
        playerId: socket.id,
        eventsEmitter: new EventsEmitter(io, socket, players[socket.id]?.lobbyId),
        socket: socket,
        lobby: players[socket.id]
    }
}

describe("Testes de recebimento de mensagem / eventos pelo servidor", () => {

    describe("Lobby events", () => {
        test("create-lobby", (done) => {
            addEventsListeners(io, serverSocket)

            serverSocket.on("create-lobby", (name: string) => {
                expect(handleCreateLobby).toHaveBeenCalledWith(getPlayer(serverSocket), name)
                done()
            })

            clientSocket.emit("create-lobby", "Player1")
        })

        test("join-lobby", (done) => {
            addEventsListeners(io, serverSocket)

            serverSocket.on("join-lobby", (lobbyId: string, name: string) => {
                expect(handleJoinLobby).toHaveBeenCalledWith(getPlayer(serverSocket), lobbyId, name)
                done()
            })

            clientSocket.emit("join-lobby", "Lobby1", "Player1")
        })

        test("logout", (done) => {
            addEventsListeners(io, serverSocket)

            serverSocket.on("logout", () => {
                expect(handleLogout).toHaveBeenCalledWith(getPlayer(serverSocket))
                done()
            })

            clientSocket.emit("logout")
        })

        test("ready", (done) => {
            addEventsListeners(io, serverSocket)

            serverSocket.on("ready", () => {
                expect(handleReady).toHaveBeenCalledWith(getPlayer(serverSocket))
                done()
            })

            clientSocket.emit("ready")
        })

        test("start-game-request", (done) => {
            addEventsListeners(io, serverSocket)

            serverSocket.on("start-game-request", () => {
                expect(handleStartGameRequest).toHaveBeenCalledWith(getPlayer(serverSocket))
                done()
            })

            clientSocket.emit("start-game-request")
        })

        test("unready", (done) => {
            addEventsListeners(io, serverSocket)

            serverSocket.on("unready", () => {
                expect(handleUnready).toHaveBeenCalledWith(getPlayer(serverSocket))
                done()
            })

            clientSocket.emit("unready")
        })
    })

    describe("Game events", () => {

    })

    describe("Match events", () => {
        test("win-rounds-number-response", (done) => {
            addEventsListeners(io, serverSocket)

            serverSocket.on("win-rounds-number-response", (winRoundsNumber: number) => {
                expect(handleWinRoundsNumberResponse).toHaveBeenCalledWith(getPlayer(serverSocket), winRoundsNumber)
                done()
            })

            clientSocket.emit("win-rounds-number-response", 3)
        })
    })

    describe("Round events", () => {
        test("select-card", (done) => {
            addEventsListeners(io, serverSocket)

            serverSocket.on("select-card", (card: number) => {
                expect(handleSelectCard).toHaveBeenCalledWith(getPlayer(serverSocket), card)
                done()
            })

            clientSocket.emit("select-card", 3)
        })
    })
})