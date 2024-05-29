
import EmitterBase from "../EmitterBase"
import { Round, RoundCards } from "../../interfaces/Lobby"



/**
 *  Objetos dessa classe emitem eventos a respeito de uma rodada.
 *  
 *  Uma rodada consiste em todos os jogadores jogarem uma das suas cartas.
 *  Ao final da rodada, será verificado qual for a maior carta para definir um campeão daquela rodada.
 *  Podem ocorrer empates também, caso todas as cartas empatem, nãa concedendo a vitória a nenhum dos jogadores.
 */
export default class RoundEventsEmitter extends EmitterBase {

    /**
     *  Evento enviado para indicar o início da rodada.
     * 
     *  @param playerId Id do jogador que deve começar jogando a primeira carta.
     */
    public emitStartRound(playerId: string) {
        this.emitToLobby("start-round", playerId)
    }

    /**
     *  Após um jogador selecionar uma carta, essa mensagem será enviada para que todos clientes da sala
     *  atualizem o status da mesa e saibam qual é o próximo jogador que deve jogar.
     *  
     *  @param cards objeto contendo as informações da rodada atual, ou seja, as cartas que estão em jogo.
     *  @param nextPlayerId string indicando o id do próximo jogador que deverá jogar.
     *  Caso não tenha um próximo jogador (todos já escolheram as cartas), esse valor será undefined
     */
    public emitTableUpdate(cards: RoundCards, nextPlayerId?: string) {
        this.emitToLobby("table-update", cards, nextPlayerId)
    }

    /**
     *  Mensagem enviada quando ocorrer algum erro na seleção de carta de um jogador. 
     *  Este erro pode ocorrer quando um jogador enviar uma seleção de carta quando não é sua vez (pode ser que ele tenha tentado 
     *  selecionar a carta, só que o tempo acabou antes da mensagem chegar ao servidor). 
     *  Outro motivo é a seleção de um índice inválido, por exemplo, contando que temos 5 cartas, -1 e 5 (índice começa em 0) 
     *  seriam índices inválidos. Para finalizar, outro motivo possível é que ele tenha mandado essa mensagem sem estar em um lobby.
     * 
     *  @param type tipo de erro que ocorreu ao tentar selecionar uma carta
     */
    public emitSelectCardError(type: "not-your-turn"|"invalid-index"|"not-in-lobby"|"not-in-game"|"not-in-match"|"not-in-round") {
        this.emitToUser("select-card-error", type)
    }

    /**
     *  Evento enviado para indicar o fim da rodada. Uma rodada acaba quando todos os jogadores já jogaram as suas cartas.
     * 
     *  @param winnerId Id do jogador que venceu a rodada
     *  @param points número de pontos que o jogador vencedor ganhou
     */
    public emitEndRound(winnerId: string, points: number) {
        this.emitToLobby("end-round", winnerId, points)
    }
}