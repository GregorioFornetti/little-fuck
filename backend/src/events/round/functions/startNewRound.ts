
import { Match } from "../../../interfaces/Lobby";
import Player from "../../../interfaces/Player";


/**
 *  Função que começa uma rodada de "little-fuck". Essa função é responsável por:
 *  - Cria um objeto Round
 *  - Enviar mensagens para todos os jogadores que a rodada começou
 *  - Cadastrar um timer para que o primeiro jogador selecione a carta automaticamente caso ele não selecione a tempo
 *  
 *  @param player um jogador qualquer que está na partida
 *  @param firstPlayerId o id do primeiro jogador que deve selecionar uma carta
 *  @returns um objeto do tipo Match, com as informações da partida que irá começar agora
 */
export function startNewRound(player: Player, firstPlayerId: string): Match {

}