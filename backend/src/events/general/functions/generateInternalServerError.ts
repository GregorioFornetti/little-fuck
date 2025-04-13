
import Lobby from '../../../interfaces/Lobby';
import { lobbys, players } from '../../../global';
import { createPlayer } from '../../functions/createPlayer';
import { io } from '../../..';

/**
 *  Essa função deve ser chamada quando ocorrer um erro inesperado no servidor. Essa função irá informar os clientes da ocorrência
 *  do erro, finalizando o lobby de todos os jogadores (para não ocorrer erros piores, podendo "crashar" o servidor). Também
 *  registra o erro no console do servidor.
 *
 *  @param lobby Lobby que ocorreu o erro.
 *  @param error Erro que será registrado no console do servidor.
 */
export function generateInternalServerError(lobby: Lobby, error: Error): void {
  console.error(`Error at lobby id: ${lobby.lobbyId}`);
  console.error(`Error message:\n: ${error.message}\n`);
  console.error(`Error stack:\n: ${error.stack}\n`);

  if (lobby.game) {
    lobby.game.timer.stop();
    lobby.game = undefined;
  }

  if (lobby.players.length > 0) {
    const player = createPlayer(io, lobby.players[0].id);
    player.eventsEmitter.General.emitInternalServerError();

    for (const player of lobby.players) {
      players[player.id].lobby = undefined;
    }

    lobby.players = [];
  }

  delete lobbys[lobby.lobbyId];
}
