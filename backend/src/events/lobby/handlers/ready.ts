import type Player from "../../../interfaces/Player";

/**
 *  Evento enviado quando o jogador está preparado para começar a partida. 
 *  Caso o jogador não estivesse preparado antes, e este esteja em uma sala de um jogo que ainda não está em andamento e não seja o
 *  líder, será atualizado o status desse jogador para todos os outros integrantes da sala (chamando o evento player-ready). 
 *  Caso contrário, o erro será informado para o cliente pelo evento player-ready-error.
 * 
 *  @param player Objeto contendo informações do jogador que acaba de chamar o evento
 */
export function handleReady(player: Player) {
  const playerInLobby = player.lobby?.players.find((lobbyPlayer) => lobbyPlayer.id === player.playerId);

  if (!player.lobby || !playerInLobby) {
    player.eventsEmitter.Lobby.emitPlayerReadyError('not-in-lobby');
    return;
  }

  if (playerInLobby.leader) {
    player.eventsEmitter.Lobby.emitPlayerReadyError('leader');
    return;
  }

  if (player.lobby.game) {
    player.eventsEmitter.Lobby.emitPlayerReadyError('in-game');
    return;
  }
  
  if (!playerInLobby.ready) {
    player.eventsEmitter.Lobby.emitPlayerReady(player.playerId);
    playerInLobby.ready = true;
  }
}
