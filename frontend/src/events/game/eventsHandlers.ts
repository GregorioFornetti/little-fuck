import { handleEndGame } from "./handlers/endGame";
import { handleStartGame } from "./handlers/startGame";

export default {
    'start-game': handleStartGame,
    'end-game': handleEndGame
}