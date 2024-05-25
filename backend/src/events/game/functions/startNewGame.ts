
import { Game } from "../../../interfaces/Lobby";
import Timer from "easytimer.js";
import Player from "../../../interfaces/Player";

/**
 *  Função que começa um jogo de "little-fuck". Essa função é responsável por:
 *  - Criar a versão inicial do objeto Game
 *  - Enviar mensagens para todos os jogadores que o jogo começou
 *  - Cadastrar um timer para o início de uma partida
 *  
 *  @param player jogador que solicitou o inicio do jogo
 *  @param playersIds lista de strings contendo os ids dos jogadores que estão no lobby que acaba de iniciar o jogo.
 *  @returns um objeto do tipo Game, contendo as informações iniciais necessárias para o começo do jogo.
 */
export function startNewGame(player: Player, playersIds: string[]): Game {

}