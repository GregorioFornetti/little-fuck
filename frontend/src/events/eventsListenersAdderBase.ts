
import type { Socket } from "socket.io-client"


export default class EventsListenersAdderBase {

    private socket: Socket

    constructor(socket: Socket) {
        this.socket = socket
    }

    protected addEventListener(eventName: string, eventHandler: (...args: any[]) => void) {
        this.socket.on(eventName, (...args) => eventHandler(...args))
    }
}

