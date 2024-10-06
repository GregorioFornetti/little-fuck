import Player from '../../../interfaces/Player';
import { startNewGame } from '../../game/functions/startNewGame';
import { generateInternalServerError } from '../../general/functions/generateInternalServerError';

/**
 *  Evento para tentativa de inicio de jogo. Para que o jogo comece, é preciso que o solicitante esteja em uma sala que não
 *  esteja em andamento e seja o líder dela, além de que todos os jogadores precisam estar prontos.
 *  Caso todas essas condições sejam atendidas, o evento `start-game` será acionado, para que o jogo comece,
 *  caso contrário, será enviado ao solicitante o evento `start-game-error`.
 *
 *  @param player Objeto contendo informações do jogador que acaba de chamar o evento
 */
export function handleStartGameRequest(player: Player) {

  if (!player.lobby) {
    player.eventsEmitter.Lobby.emitStartGameError('not-in-lobby');
    return;
  }

  if (!player.lobby.players.some(lobby_player => lobby_player.leader && lobby_player.id === player.playerId)) {
    player.eventsEmitter.Lobby.emitStartGameError('not-leader');
    return;
  }

  if (!player.lobby.game) {
    player.eventsEmitter.Lobby.emitStartGameError('already-in-game');
    return;
  }

  if (!player.lobby.players.every(lobby_player => lobby_player.ready || lobby_player.leader)) {
    player.eventsEmitter.Lobby.emitStartGameError('not-all-ready');
    return;
  }

  try {
    startNewGame(player.lobby);
  } catch (error) {
    generateInternalServerError(player.lobby, error as Error);
  }
}
