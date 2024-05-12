
import { lobby, socket } from '@/connection'

/**
 *  Evento indicando que um jogador acaba de sair da sala.
 * 
 *  @param id id do jogador que acabou de sair da sala
 */
export function handlePlayerLogout(id: string) {
  if (lobby.value === null) {
    throw new Error('Você não está em um lobby !');
  }

  const playerIndex = lobby.value.players.findIndex((player) => player.id === id);
  if (playerIndex === -1) {
    throw new Error('Não foi possível remover o jogador do lobby atual: Jogador não encontrado !');
  }

  lobby.value.players.splice(playerIndex, 1);

  if (socket.id === id) {
    lobby.value = null;
  }
}
