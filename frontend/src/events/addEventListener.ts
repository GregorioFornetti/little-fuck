
import "../global"
import type Player from "@/interfaces/Player"

export default function (eventName: string, eventHandler: (player: Player, ...args: any[]) => void) {
    globalThis.player.socket.on(eventName, (...args) => eventHandler(globalThis.player, ...args))
}