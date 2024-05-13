
import { lobby } from '@/connection'

/**
 *  Indica que um jogador acaba de ficar preparado para um jogo.
 *  Este evento só é acionado caso o jogador que solicitou o "ready" ainda não estivesse pronto.
 * 
 *  @param id identificador do jogador que acabou de ficar pronto
 */
export function handlePlayerReady(id: string) {
  if (lobby.value === null) {
    throw new Error('Você não está em um lobby !');
  }

  if (lobby.value.game) {
    throw new Error('Não foi possível atualizar o status de um jogador para preparado: O jogo já começou !');
  }

  const playerIndex = lobby.value.players.findIndex((player) => player.id === id);
  if (playerIndex === -1) {
    throw new Error('Não foi possível atualizar o status de um jogador para preparado: Jogador não encontrado !');
  }

  lobby.value.players[playerIndex].ready = true;
}