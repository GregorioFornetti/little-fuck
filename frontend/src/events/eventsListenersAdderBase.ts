
import type { Socket } from "socket.io-client"
import "../global"
import type Player from "../interfaces/Player"


export default class EventsListenersAdderBase {

    private socket: Socket

    constructor(socket: Socket) {
        this.socket = socket
    }

    protected addEventListener(eventName: string, eventHandler: (player: Player, ...args: any[]) => void) {
        this.socket.on(eventName, (...args) => eventHandler(globalThis.player, ...args))
    }
}

