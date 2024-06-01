
import { clientSocket, player, io, eventsEmitter } from "../setupTests";
import i18n from "../../../plugins/i18n"
import { players } from "../../../global";
import { createPlayer } from "../../../events/functions/createPlayer"

import EventsEmitter from "../../../events/Emitter";
import Lobby from "../../../interfaces/Lobby";

jest.mock("../../../events/Emitter.ts")

describe("createPlayer", () => {

    beforeEach(() => {
        (EventsEmitter as jest.Mock).mockClear();
    });

    
    test("Deve lançar erro se o jogador não for encontrado", () => {
        expect(() => createPlayer(io, "")).toThrow(new Error(i18n.t("COMMON.ERROR.PLAYER_NOT_FOUND")))
    })

    test("Deve criar um objeto Player corretamente caso o jogador não esteja em um lobby", () => {
        players[player.playerId] = {
            socket: player.socket,
            lobby: undefined
        }
        const newPlayer = createPlayer(io, player.playerId)

        expect(newPlayer.playerId).toBe(player.playerId)
        expect(EventsEmitter).toHaveBeenCalledWith(io, player.socket, undefined)
        expect(newPlayer.eventsEmitter).toBeInstanceOf(EventsEmitter)
        expect(newPlayer.socket).toBe(player.socket)
        expect(newPlayer.io).toBe(io)
        expect(newPlayer.lobby).toBeUndefined()
    })

    test("Deve criar um objeto Player corretamente caso o jogador esteja em um lobby", () => {
        const lobby: Lobby = {
            lobbyId: "12345",
            players: []
        }
        players[player.playerId] = {
            socket: player.socket,
            lobby: lobby
        }

        const newPlayer = createPlayer(io, player.playerId)

        expect(newPlayer.playerId).toBe(player.playerId)
        expect(EventsEmitter).toHaveBeenCalledWith(io, player.socket, lobby.lobbyId)
        expect(newPlayer.eventsEmitter).toBeInstanceOf(EventsEmitter)
        expect(newPlayer.socket).toBe(player.socket)
        expect(newPlayer.io).toBe(io)
        expect(newPlayer.lobby).toBe(lobby)
    })
})