
import { handleEndMatch } from "./handlers/endMatch";
import { handleStartMatch } from "./handlers/startMatch";
import { handleStartSpecialMatch } from "./handlers/startSpecialMatch";
import { handleWinRoundsNumberError } from "./handlers/winRoundsNumberError";
import { handleWinRoundsNumberUpdate } from "./handlers/winRoundsNumberUpdate";

export default {
    'start-match': handleStartMatch,
    'win-rounds-number-update': handleWinRoundsNumberUpdate,
    'win-rounds-number-error': handleWinRoundsNumberError,
    'end-match': handleEndMatch,
    'start-special-match': handleStartSpecialMatch
}