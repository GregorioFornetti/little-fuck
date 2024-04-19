
import type { Round } from "@/interfaces/Lobby";
import EventsListenersAdderBase from "../eventsListenersAdderBase";

import { handleEndRound } from "./handlers/endRound";
import { handleSelectCardError } from "./handlers/selectCardError";
import { handleStartRound } from "./handlers/startRound";
import { handleTableUpdate } from "./handlers/tableUpdate";
import type { Socket } from "socket.io-client";


export class RoundEventsHandlersAdder extends EventsListenersAdderBase {

    /**
     *  Evento enviado para indicar o início da rodada.
     *  
     *  @param handlerFunction função que será chamada quando o evento for recebido
     */
    public startRound(handlerFunction: (firstPlayerId: string) => void): void {
        this.socket.on('start-round', handlerFunction)
    }

    /**
     *  Após um jogador selecionar uma carta, essa mensagem será enviada para que todos clientes da sala atualizem
     *  o status da mesa e saibam qual é o próximo jogador que deve jogar
     * 
     *  @param handlerFunction função que será chamada quando o evento for recebido
     */
    public tableUpdate(handlerFunction: (cards: Round, nextPlayerId: string | null) => void): void {
        this.socket.on('table-update', handlerFunction)
    }

    /**
     *  Mensagem enviada quando ocorrer algum erro na seleção de carta de um jogador.
     *  Este erro pode ocorrer quando um jogador enviar uma seleção de carta quando não é sua vez 
     *  (pode ser que ele tenha tentado selecionar a carta, só que o tempo acabou antes da mensagem chegar ao servidor).
     *  Outro motivo é a seleção de um índice inválido, por exemplo, contando que temos 5 cartas, -1 e 5 (índice começa em 0)
     *  seriam índices inválidos. Para finalizar, outro motivo possível é que ele tenha mandado essa mensagem sem estar em um lobby.
     *  
     *  @param handlerFunction função que será chamada quando o evento for recebido
     */
    public selectCardError(handlerFunction: (type: "not-your-turn"|"invalid-index"|"not-in-lobby") => void): void {
        this.socket.on('select-card-error', handlerFunction)
    }

    /**
     *  Evento enviado para indicar o fim da rodada. Uma rodada acaba quando todos os jogadores já jogaram as suas cartas.
     * 
     *  @param handlerFunction função que será chamada quando o evento for recebido
     */
    public endRound(handlerFunction: (winnerId: string, points: number) => void): void {
        this.socket.on('end-round', handlerFunction)
    }
}

export default function addDefaultRoundHandlers (socket: Socket) {
    const roundEventsHandlersAdder = new RoundEventsHandlersAdder(socket)
    
    roundEventsHandlersAdder.startRound(handleStartRound)
    roundEventsHandlersAdder.tableUpdate(handleTableUpdate)
    roundEventsHandlersAdder.selectCardError(handleSelectCardError)
    roundEventsHandlersAdder.endRound(handleEndRound)
}