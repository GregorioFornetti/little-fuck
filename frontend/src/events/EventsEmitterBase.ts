
import type { Socket } from "socket.io-client"
import "../global"


export default class EventsEmitterBase {

    protected socket: Socket

    constructor(socket: Socket) {
        this.socket = socket
    }
}

