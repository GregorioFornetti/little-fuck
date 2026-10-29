import Player from '../../../interfaces/Player';

/**
 *  Evento enviado pelo líder ao final de um jogo pedindo uma revanche.
 *  Apenas o líder pode pedir, e apenas quando nenhum jogo está em andamento.
 *  Todos os jogadores voltam para a sala com o status de prontidão resetado
 *  (bots continuam sempre prontos), recebendo o evento `rematch`.
 *
 *  @param player Objeto contendo informações do jogador que acaba de chamar o evento
 */
export function handleRematchRequest(player: Player) {
  const playerInLobby = player.lobby?.players.find((lobbyPlayer) => lobbyPlayer.id === player.playerId);

  if (!player.lobby || !playerInLobby) {
    player.eventsEmitter.Lobby.emitRematchError('not-in-lobby');
    return;
  }

  if (!playerInLobby.leader) {
    player.eventsEmitter.Lobby.emitRematchError('not-leader');
    return;
  }

  if (player.lobby.game) {
    player.eventsEmitter.Lobby.emitRematchError('already-in-game');
    return;
  }

  for (const lobbyPlayer of player.lobby.players) {
    lobbyPlayer.ready = lobbyPlayer.bot === true;
  }

  player.eventsEmitter.Lobby.emitRematch();
}
