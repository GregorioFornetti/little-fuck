
import Player from '../../../interfaces/Player';
import { getNextPlayerId } from '../../functions/getNextPlayerId';
import { lobbys, players } from '../../../global';
import { generateInternalServerError } from '../functions/generateInternalServerError';

/**
 *  Evento criado quando um jogador deseja sair de uma sala.
 *  O jogador sairá da sala caso ele esteja em uma, sendo enviado o evento `player-logout` (que será enviado para todos os outros da
 *  sala, para que removam ele da sala também), caso contrário será enviado o evento `logout-error` (apenas para o jogador que tentou
 *  sair).
 *
 *  @param player Objeto contendo informações do jogador que acaba de chamar o evento
 */
export function handleLogout(player: Player) {
  if (!player.lobby) {
    return player.eventsEmitter.General.emitPlayerLogoutError('not-in-lobby');
  }

  const lobby = player.lobby;

  try {
    player.eventsEmitter.General.emitPlayerLogout(player.playerId);

    const game = lobby.game;
    if (game) {
      delete game.playersHealth[player.playerId];

      if (game.currentPlayerId === player.playerId) {
        game.currentPlayerId = getNextPlayerId(game.currentPlayerId, lobby);
      }

      if (game.deadPlayersIds.includes(player.playerId)) {
        game.deadPlayersIds.splice(game.deadPlayersIds.indexOf(player.playerId), 1);
      }

      game.timer.reset();
    }

    const match = game?.match;
    if (match) {
      delete match.players[player.playerId];

      if (match.nextPlayerId === player.playerId) {
        match.nextPlayerId = getNextPlayerId(match.nextPlayerId, lobby);
      }

      if (match.roundFirstPlayerId === player.playerId) {
        match.roundFirstPlayerId = getNextPlayerId(match.roundFirstPlayerId, lobby);
      }
    }

    const round = match?.round;
    if (round) {
      if (round.cards.onMatch.map(card => card.playerId).includes(player.playerId)) {
        round.cards.onMatch = round.cards.onMatch.filter(card => card.playerId !== player.playerId);
      }

      if (round.nextPlayerId === player.playerId) {
        round.nextPlayerId = getNextPlayerId(round.nextPlayerId, lobby);
      }
    }

    const playerIndex = lobby.players.findIndex(p => p.id === player.playerId);
    const playerInLobby = lobby.players[playerIndex];
    const wasLeader = playerInLobby.leader;

    lobby.players.splice(playerIndex, 1);

    if (wasLeader && lobby.players.length > 0) {
      lobby.players[0].leader = true;
    }

    if (lobby.players.length === 0) {
      delete lobbys[lobby.lobbyId];
    }

    players[player.playerId].lobby = undefined;
  } catch (error) {
    generateInternalServerError(lobby, error as Error);
  }
}
