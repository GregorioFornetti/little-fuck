import Player from '../../../interfaces/Player';

/**
 *  Mensagem que o cliente enviará para indicar o seu palpite.
 *  O palpite consiste em dizer, a partir das cartas recebidas e dos outros palpites prévios,
 *  quantas rodadas que o jogador acha que irá vencer.
 *  Caso seja a vez do jogador palpitar, e o palpite for válido (não é negativo),
 *  este palpite será passado para todos os outros jogadores e o próximo na fila deve palpitar
 *  (o servidor chamará o evento `win-rounds-number-update`).
 *  Caso não seja um palpite válido ou não seja a vez do jogador, o servidor irá informar esse erro a partir do evento `win-rounds-number-error`.
 *
 *  OBS: também é considerado um palpite inválido no caso do último jogador palpitar um valor que gerará um somatório de vitórias igual ao
 *  número de cartas.
 *  Por exemplo, considerando uma partida com 5 cartas, e que no momento do palpite do último jogador já foram palpitadas 4 vitórias,
 *  o último jogador não poderá palpitar apenas uma vitória, e sim palpitar 0 vitórias ou 2 ou mais vitórias
 *  (para que o somatório não dê 5 (4 + 1 = 5)).
 *
 *  @param player Objeto contendo informações do jogador que acaba de chamar o evento
 *  @param numWinsRounds Número de rodadas que o jogador acha que irá vencer
 */
// Remover comentário abaixo quando implementar a função, juntamente com esse comentário atual
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function handleWinRoundsNumberResponse(player: Player, numWinsRounds: number) {

}
