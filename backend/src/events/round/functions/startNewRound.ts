import { Round } from '../../../interfaces/Lobby';
import Player from '../../../interfaces/Player';

/**
 *  Função que começa uma rodada de "little-fuck". Essa função é responsável por:
 *  - Criar um objeto Round (de forma in-place, ou seja, modifica o objeto `player.lobby` diretamente)
 *  - Enviar mensagens para todos os jogadores que a rodada começou
 *  - Cadastrar um timer para que o primeiro jogador selecione a carta automaticamente caso ele não selecione a tempo
 *
 *  @param player um jogador qualquer que está na partida
 *  @returns um objeto do tipo Round, com as informações da partida que irá começar agora
 */
// Remover comentário abaixo quando implementar a função, juntamente com esse comentário atual
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function startNewRound(player: Player): void {

}
