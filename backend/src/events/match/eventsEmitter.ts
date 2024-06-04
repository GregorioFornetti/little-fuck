
import EmitterBase from "../EmitterBase"
import { Card, SpecialMatchCards } from "../../interfaces/Lobby"


/**
 *  Objetos dessa classe emitem eventos a respeito de uma partida.
 *  
 *  Uma partida consiste de diversas rodadas, dependendo da quantidade de cartas distribuídas na partida.
 *  No inicio das partidas, são distribuídas as cartas e os jogadores devem fazer seus palpites.
 *  Logo em seguida começam as rodadas.
 * 
 *  A partida com apenas uma carta é especial, com os jogadores podendo ver as cartas dos outros jogadores,
 *  menos as próprias cartas.
 */
export default class MatchEventsEmitter extends EmitterBase {

    /**
     *  Evento enviado para indicar o início da partida.
     *  Este evento é enviado para todos os jogadores do lobby, mas com informações específicas para cada jogador.
     *  
     *  @param cards Cartas que cada jogador possui. A chave é o id do jogador e o valor é um array de cartas.
     *  @param firstPlayerId Id do jogador que deve começar fazendo o primeiro palpite.
     */
    public emitStartMatch(cards: { [playerId: string]: Card[] }, firstPlayerId: string) {
        const playersInfos: { [playerId: string]: { cards: Card[], firstPlayerId: string}} = {}
        for (const playerId in cards) {
            playersInfos[playerId] = {
                cards: cards[playerId],
                firstPlayerId
            }
        }
        this.emitToSpecificLobbyPlayers("start-match", playersInfos)
    }

    /**
     *  Após um jogador fazer um palpite válido, essa mensagem será enviada para que todos clientes da sala
     *  atualizem o status dos palpites e saibam qual é o próximo jogador que deve palpitar
     * 
     *  @param numWinMatches inteiro indicando o palpite do jogador que acabou de palpitar.
     *  @param nextPlayerId string indicando o id do próximo jogador que deverá palpitar.
     *  Pode ser undefined caso todos os jogadores já tenham palpitado.
     */
    public emitWinRoundsNumberUpdate(numWinMatches: number, nextPlayerId?: string) {
        this.emitToLobby("win-rounds-number-update", numWinMatches, nextPlayerId)
    }

    /**
     *  Mensagem enviada quando ocorrer algum erro no palpite escolhido pelo usuário. 
     *  Este erro pode ocorrer quando um jogador palpitar um número negativo, não estiver em um lobby ou não for o turno do jogador.
     * 
     *  OBS: também é considerado um palpite inválido no caso do último jogador palpitar um valor que gerará um somatório de vitórias
     *  igual ao número de cartas. Por exemplo, considerando uma partida com 5 cartas, e que no momento do palpite do último jogador já
     *  foram palpitadas 4 vitórias, o último jogador não poderá palpitar apena uma vitória, ele poderá apenas palpitar 0 vitórias ou 2
     *  ou mais vitórias (para que o somatório não dê 5 (4 + 1 = 5)).
     * 
     *  @param type tipo de erro que ocorreu ao tentar palpitar um número de vitórias
     */
    public emitWinRoundsNumberError(type: "not-your-turn"|"negative-is-invalid"|"num-wins-equals-num-cards"|"not-in-lobby"|"not-in-game"|"not-in-match") {
        this.emitToUser("win-rounds-number-error", type)
    }

    /**
     *  Evento enviado para indicar o fim da partida.
     *  Uma partida acaba quando todos os jogadores já jogaram todas as suas cartas, ou seja,
     *  todas as rodadas dessa partida foram finalizadas, podendo atualizar as vidas dos jogadores
     *  dependendo das vitórias e palpites feitos.
     * 
     *  @param playerHealthUpdate É um objeto tendo como chaves todos os ids dos jogadores do lobby. 
     *  É um objeto mapeando id de jogadores para o valor que deve ser modificado em sua vida final. 
     *  Ex: { "123": -1 } = jogador com id "123" perdeu uma vida
     */
    public emitEndMatch(playerHealthUpdate: { [playerId: string]: number }) {
        this.emitToLobby("end-match", playerHealthUpdate)
    }

    /**
     *  Iniciará a partida especial, quando todos os jogadores possuem apenas uma carta. 
     *  Todos os jogadores poderão ver as cartas dos outros, porém, não poderão ver a própria carta. 
     *  
     *  @param cards um objeto mapeando id de jogadores para um conjunto de cartas dos outros jogadores. Todos jogadores devem saber das cartas
     *  dos outros jogadores, exceto a sua própria carta.
     *  @param firstPlayerId id do jogador que deve começar fazendo o primeiro palpite.
     */
    public emitStartSpecialMatch(cards: { [playerId: string]: SpecialMatchCards }, firstPlayerId: string) {
        const playersInfos: { [playerId: string]: { cards: SpecialMatchCards, firstPlayerId: string}} = {}
        for (const playerId in cards) {
            playersInfos[playerId] = {
                cards: cards[playerId],
                firstPlayerId
            }
        }
        this.emitToSpecificLobbyPlayers("start-special-match", playersInfos)
    }
}