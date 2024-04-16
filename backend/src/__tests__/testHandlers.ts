
import { io, clientSocket, serverSocket, player } from "./setupTests";
import addEventsListeners from "../events/addEventsListeners";
import { handleCreateLobby } from "../events/lobby/handlers/createLobby";
import EventsEmitter from "../events/Emitter";
import { Socket } from "socket.io";
import { players } from "../global";

jest.mock("../events/lobby/handlers/createLobby");

function getPlayer(socket: Socket) {
    return {
        playerId: socket.id,
        eventsEmitter: new EventsEmitter(io, socket, players[socket.id]?.lobbyId),
        socket: socket,
        lobby: players[socket.id]
    }
}

describe("Testes de envio de mensagem / eventos pelo servidor", () => {

    describe("Lobby events", () => {
        test("create-lobby", (done) => {
            addEventsListeners(io, serverSocket)

            serverSocket.on("create-lobby", (name: string) => {
                expect(handleCreateLobby).toHaveBeenCalledWith(getPlayer(serverSocket), name)
                done()
            })

            clientSocket.emit("create-lobby", "Player1")
        })
    })

    describe("Game events", () => {

    })

    describe("Match events", () => {

    })

    describe("Round events", () => {
        
    })
})