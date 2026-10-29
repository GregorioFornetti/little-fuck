import Player from '../../../interfaces/Player';
import { players } from '../../../global';

/**
 *  Evento enviado pelo líder quando ele deseja remover um bot da sala.
 *  Apenas o líder pode remover, apenas antes do jogo começar e apenas bots.
 *  Todos na sala recebem o evento `bot-removed`.
 *
 *  @param player Objeto contendo informações do jogador que acaba de chamar o evento
 *  @param botId identificador único do bot a ser removido
 */
export function handleRemoveBot(player: Player, botId: string) {
  const playerInLobby = player.lobby?.players.find((lobbyPlayer) => lobbyPlayer.id === player.playerId);

  if (!player.lobby || !playerInLobby) {
    player.eventsEmitter.Lobby.emitBotError('not-in-lobby');
    return;
  }

  if (!playerInLobby.leader) {
    player.eventsEmitter.Lobby.emitBotError('not-leader');
    return;
  }

  if (player.lobby.game) {
    player.eventsEmitter.Lobby.emitBotError('already-in-game');
    return;
  }

  const botIndex = player.lobby.players.findIndex(
    (lobbyPlayer) => lobbyPlayer.id === botId && lobbyPlayer.bot
  );
  if (botIndex === -1) {
    player.eventsEmitter.Lobby.emitBotError('bot-not-found');
    return;
  }

  player.lobby.players.splice(botIndex, 1);
  delete players[botId];

  player.eventsEmitter.Lobby.emitBotRemoved(botId);
}
