
/**
 *  Mensagem que o cliente enviará para indicar o seu palpite. 
 *  O palpite consiste em dizer, a partir das cartas recebidas e dos outros palpites prévios, quantas rodadas que o jogador acha que irá vencer.
 *  Caso seja a vez do jogador palpitar, e o palpite for válido (não é negativo), este palpite será passado para todos os outros jogadores e o
 *  próximo na fila deve palpitar (o servidor chamará o evento `win-rounds-number-update`). Caso não seja um palpite válido ou não seja a 
 *  vez do jogador, o servidor irá informar esse erro a partir do evento `win-rounds-number-error`.
 *  
 *  OBS: também é considerado um palpite inválido no caso do último jogador palpitar um valor que gerará um somatório de vitórias 
 *  igual ao número de cartas. Por exemplo, considerando uma partida com 5 cartas, e que no momento do palpite do último jogador 
 *  já foram palpitadas 4 vitórias, o último jogador não poderá palpitar apenas uma vitória, e sim palpitar 0 vitórias ou 2 ou mais vitórias 
 *  (para que o somatório não dê 5 (4 + 1 = 5)).
 * 
 *  @param numWinRound número de rodadas que o jogador espera ganhar (palpite)
 */
export function emitWinRoundsNumberResponse(numWinRound: number) {
    globalThis.player.socket.emit('win-rounds-number-response', numWinRound);
}


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
export default class MatchEventsEmitter {
    static emitWinRoundsNumberResponse = emitWinRoundsNumberResponse;
}