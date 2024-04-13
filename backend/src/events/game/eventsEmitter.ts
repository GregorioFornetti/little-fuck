
import EmitterBase from "../EmitterBase"


/**
 *  Objetos dessa classe emitem eventos a respeito de um jogo de "Little Fuck".
 *  
 *  Um jogo completo de "Little Fuck" consiste de diversas partidas.
 *  Todos os jogadores iniciam com uma quantidade de vida, e vão perdendo elas ao decorrer das partidas.
 *  O jogo acaba quando restar apenas um jogador com vidas.
 */
export default class GameEventsEmitter extends EmitterBase {

    /**
     *  Evento indicando o início de um jogo completo de "Little Fuck"
     */
    public emitStartGame() {
        this.emitToLobby("start-game")
    }

    /**
     *  Evento indicando o final de um jogo completo de "Little Fuck".
     * 
     *  @param playersRanks uma lista de strings de ids de jogadores ordenadas.
     *  A primeira posição é o jogador que ganhou (único sobrevivente), o último a ser eliminado fica na segunda posição,
     *  até a última posição que tem o primeiro a ser eliminado.
     */
    public emitEndGame(playersRanks: string[]) {
        this.emitToLobby("end-game", playersRanks)
    }
}