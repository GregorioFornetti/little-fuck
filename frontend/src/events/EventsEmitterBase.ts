
import type { Socket } from "socket.io-client"

export default class EventsEmitterBase {

    protected socket: Socket

    constructor(socket: Socket) {
        this.socket = socket
    }
}

