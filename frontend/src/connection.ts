
import { io } from "socket.io-client"
import { ref } from "vue";
import EventsEmitter from "./events/EventsEmitter";
import EventsListenersAdder from "./events/EventsListenersAdder";
import type Lobby from "./interfaces/Lobby";
import addDefaultEventsListeners from "./events/addDefaultEventsListeners";

const rootUrl: string = process.env.NODE_ENV === 'development' ?
                        'localhost:3000' :
                         window.location.host
const socket = io(
    rootUrl, {
        autoConnect: false,
        path: `${import.meta.env.VITE_SERVER_PATH || ''}/socket.io/`
    }
)
socket.connect()

const eventsEmitter = new EventsEmitter(socket)
const eventsListenersAdder = new EventsListenersAdder(socket)
const lobby = ref<Lobby|null>(null)

addDefaultEventsListeners(socket)

export { socket, eventsEmitter, eventsListenersAdder, lobby }