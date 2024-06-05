import { Round } from '../../../interfaces/Lobby';
import Player from '../../../interfaces/Player';

/**
 *  Função que começa uma rodada de "little-fuck". Essa função é responsável por:
 *  - Criar um objeto Round
 *  - Enviar mensagens para todos os jogadores que a rodada começou
 *  - Cadastrar um timer para que o primeiro jogador selecione a carta automaticamente caso ele não selecione a tempo
 *
 *  @param player um jogador qualquer que está na partida
 *  @returns um objeto do tipo Round, com as informações da partida que irá começar agora
 */
export function startNewRound(player: Player): Round {

}
