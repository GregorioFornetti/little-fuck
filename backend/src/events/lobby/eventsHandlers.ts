
import { handleCreateLobby } from "./handlers/createLobby"
import { handleJoinLobby } from "./handlers/joinLobby"
import { handleLogout } from "./handlers/logout"
import { handleReady } from "./handlers/ready"
import { handleStartGameRequest } from "./handlers/startGameRequest"
import { handleUnready } from "./handlers/unready"


export default {
    'create-lobby': handleCreateLobby,
    'join-lobby': handleJoinLobby,
    'logout': handleLogout,
    'ready': handleReady,
    'start-game-request': handleStartGameRequest,
    'unready': handleUnready
}