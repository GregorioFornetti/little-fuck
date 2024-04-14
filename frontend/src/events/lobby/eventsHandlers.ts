
import { handleJoinLobbyError } from "./handlers/joinLobbyError";
import { handleJoinLobbySuccess } from "./handlers/joinLobbySuccess";
import { handlePlayerJoin } from "./handlers/playerJoin";
import { handlePlayerLogout } from "./handlers/playerLogout";
import { handlePlayerLogoutError } from "./handlers/playerLogoutError";
import { handlePlayerReady } from "./handlers/playerReady";
import { handlePlayerReadyError } from "./handlers/playerReadyError";
import { handlePlayerUnready } from "./handlers/playerUnready";
import { handlePlayerUnreadyError } from "./handlers/playerUnreadyError";
import { handleReconnect } from "./handlers/reconnect";
import { handleStartGameError } from "./handlers/startGameError";


export default {
    'join-lobby-success': handleJoinLobbySuccess,
    'join-lobby-error': handleJoinLobbyError,
    'player-join': handlePlayerJoin,
    'player-logout': handlePlayerLogout,
    'player-logout-error': handlePlayerLogoutError,
    'player-ready': handlePlayerReady,
    'player-ready-error': handlePlayerReadyError,
    'player-unready': handlePlayerUnready,
    'player-unready-error': handlePlayerUnreadyError,
    'start-game-error': handleStartGameError,
    'reconnect': handleReconnect
}