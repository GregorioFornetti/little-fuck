
import { lobby } from '@/connection'


/**
 *  Evento enviado para todos os jogadores indicando que um novo jogador entrou na sala.
 * 
 *  @param id id do jogador que acabou de entrar na sala
 *  @param name nome do jogador que acabou de entrar na sala
 */
export function handlePlayerJoin(id: string, name: string) {
  if (lobby.value === null) {
    throw new Error('Você não está em um lobby !');
  }

  if (lobby.value.game) {
    throw new Error('Não foi possível adicionar um novo jogador ao seu lobby atual, o jogo já começou !');
  }

  lobby.value.players.push({
    id,
    name,
    leader: false,
    ready: false
  });
}
