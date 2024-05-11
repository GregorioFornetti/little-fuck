
import { lobby } from '@/connection'
import type { Card, SpecialMatchCards } from "@/interfaces/Lobby";
import EventsListenersAdderBase from "../EventsListenersAdderBase";

import { handleEndMatch } from "./handlers/endMatch";
import { handleStartMatch } from "./handlers/startMatch";
import { handleStartSpecialMatch } from "./handlers/startSpecialMatch";
import { handleWinRoundsNumberError } from "./handlers/winRoundsNumberError";
import { handleWinRoundsNumberUpdate } from "./handlers/winRoundsNumberUpdate";
import type { Socket } from "socket.io-client";



export class MatchEventsHandlersAdder extends EventsListenersAdderBase {

    /**
     *  Evento enviado para indicar o início da partida.
     * 
     *  @param handlerFunction função que será chamada quando o evento for recebido
     */
    public startMatch(handlerFunction: (cards: Card[], firstPlayerId: string) => void): void {
        this.socket.on('start-match', handlerFunction)
    }

    /**
     *  Após um jogador fazer um palpite válido, essa mensagem será enviada para que todos clientes da sala
     *  atualizem o status dos palpites e saibam qual é o próximo jogador que deve palpitar
     *  
     *  @param handlerFunction função que será chamada quando o evento for recebido
     */
    public winRoundsNumberUpdate(handlerFunction: (numWinRounds: number, nextPlayerId?: string) => void): void {
        this.socket.on('win-rounds-number-update', handlerFunction)
    }

    /**
     *  Mensagem enviada quando ocorrer algum erro no palpite escolhido pelo usuário. 
     *  Este erro pode ocorrer quando um jogador palpitar um número negativo, não estiver em um lobby ou não for o turno do jogador.
     *  
     *  OBS: também é considerado um palpite inválido no caso do último jogador palpitar um valor que gerará um somatório de vitórias 
     *  igual ao número de cartas. Por exemplo, considerando uma partida com 5 cartas, e que no momento do palpite do último jogador 
     *  já foram palpitadas 4 vitórias, o último jogador não poderá palpitar apena uma vitória, ele poderá apenas palpitar 
     *  0 vitórias ou 2 ou mais vitórias (para que o somatório não dê 5 (4 + 1 = 5)).
     * 
     *  @param handlerFunction função que será chamada quando o evento for recebido
     */
    public winRoundsNumberError(handlerFunction: (type: "not-your-turn"|"negative-is-invalid"|"not-in-lobby"|"num-wins-equals-num-cards") => void): void {
        this.socket.on('win-rounds-number-error', handlerFunction)
    }

    /**
     *  Evento enviado para indicar o fim da partida. Uma partida acaba quando todos os jogadores já jogaram todas as suas cartas, ou seja,
     *  todas as rodadas dessa partida foram finalizadas, podendo atualizar as vidas dos jogadores dependendo das vitórias e palpites feitos.
     *  
     *  @param handlerFunction função que será chamada quando o evento for recebido
     */
    public endMatch(handlerFunction: (playerHealthUpdate: { [playerId: string]: number }) => void): void {
        this.socket.on('end-match', handlerFunction)
    }

    /**
     *  Iniciará a partida especial, quando todos os jogadores possuem apenas uma carta. 
     *  Todos os jogadores poderão ver as cartas dos outros, porém, não poderão ver a própria carta.
     * 
     *  Após todos os jogadores palpitarem, será acionado o evento table-update, mostrando o estado final da mesa para todos os jogadores
     *  e logo em seguida o evento `end-round` será também acionado. Depois de um tempo, será acionado o evento `end-match`.
     *  
     *  @param handlerFunction função que será chamada quando o evento for recebido
     */
    public startSpecialMatch(handlerFunction: (cards: SpecialMatchCards, firstPlayerId: string) => void): void {
        this.socket.on('start-special-match', handlerFunction)
    }
}
    


export default function addDefaultMatchHandlers(socket: Socket) {
    const matchEventsHandlersAdder = new MatchEventsHandlersAdder(socket)
    
    matchEventsHandlersAdder.startMatch(handleStartMatch)
    matchEventsHandlersAdder.winRoundsNumberUpdate(handleWinRoundsNumberUpdate)
    matchEventsHandlersAdder.winRoundsNumberError(handleWinRoundsNumberError)
    matchEventsHandlersAdder.endMatch(handleEndMatch)
    matchEventsHandlersAdder.startSpecialMatch(handleStartSpecialMatch)
}