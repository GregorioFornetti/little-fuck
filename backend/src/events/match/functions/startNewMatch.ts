
import { Match } from "../../../interfaces/Lobby";
import Player from "../../../interfaces/Player";
import { generateAutomaticNumWinResponse } from "./generateAutomaticNumWinResponse";


/**
 *  Função que começa um jogo de "little-fuck". Essa função é responsável por:
 *  - Cria um objeto Match
 *  - Enviar mensagens para todos os jogadores que a partida começou
 *  - Cadastrar um timer para que o primeiro jogador faça o palpite automaticamente caso ele não palpite a tempo
 *  
 *  @param player um jogador qualquer que está na partida
 *  @returns um objeto do tipo Match, com as informações da partida que irá começar agora
 */
export function startNewMatch(player: Player): Match {

}