
import { lobby } from '@/connection'


/**
 *  Indica que um jogador acaba de ficar despreparado para um jogo.
 *  Este evento só é acionado caso o jogador que solicitou o "unready" ainda não estivesse despreparado.
 * 
 *  @param id identificador do jogador que acabou de ficar despreparado
 */
export function handlePlayerUnready(id: string) {
  if (lobby.value === null) {
    throw new Error('Você não está em um lobby !');
  }

  if (lobby.value.game) {
    throw new Error('Não foi possível atualizar o status de um jogador para não preparado: O jogo já começou !');
  }

  const playerIndex = lobby.value.players.findIndex((player) => player.id === id);
  if (playerIndex === -1) {
    throw new Error('Não foi possível atualizar o status de um jogador para não preparado: Jogador não encontrado !');
  }

  lobby.value.players[playerIndex].ready = false;
}