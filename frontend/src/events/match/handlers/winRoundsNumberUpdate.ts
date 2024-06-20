
/**
 *  Após um jogador fazer um palpite válido, essa mensagem será enviada para que todos clientes da sala
 *  atualizem o status dos palpites e saibam qual é o próximo jogador que deve palpitar
 *
 *  @param numWinRounds número de rodadas que o jogador atual acredita que irá vencer (palpite)
 *  @param nextPlayerId id do próximo jogador que deve palpitar. Pode ser undefined caso todos os jogadores já tenham palpitado
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function handleWinRoundsNumberUpdate(numWinRounds: number, nextPlayerId?: string) {

}
