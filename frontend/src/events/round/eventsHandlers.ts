
import { handleEndRound } from "./handlers/endRound";
import { handleSelectCardError } from "./handlers/selectCardError";
import { handleStartRound } from "./handlers/startRound";
import { handleTableUpdate } from "./handlers/tableUpdate";

export default {
    'start-round': handleStartRound,
    'table-update': handleTableUpdate,
    'select-card-error': handleSelectCardError,
    'end-round': handleEndRound
}