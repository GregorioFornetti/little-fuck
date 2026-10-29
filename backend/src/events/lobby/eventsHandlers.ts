import { handleCreateLobby } from './handlers/createLobby';
import { handleJoinLobby } from './handlers/joinLobby';
import { handleReady } from './handlers/ready';
import { handleStartGameRequest } from './handlers/startGameRequest';
import { handleUnready } from './handlers/unready';
import { handleUpdateOptions } from './handlers/updateOptions';
import { handleAddBot } from './handlers/addBot';
import { handleRemoveBot } from './handlers/removeBot';
import { handleRematchRequest } from './handlers/rematchRequest';
import { handleUpdateAppearance } from './handlers/updateAppearance';

export default {
  'create-lobby': handleCreateLobby,
  'join-lobby': handleJoinLobby,
  'ready': handleReady,
  'start-game-request': handleStartGameRequest,
  'unready': handleUnready,
  'update-options': handleUpdateOptions,
  'add-bot': handleAddBot,
  'remove-bot': handleRemoveBot,
  'rematch-request': handleRematchRequest,
  'update-appearance': handleUpdateAppearance
};
