
import EventsEmitterBase from '../EventsEmitterBase';

/**
 *  Objetos dessa classe emitem eventos a respeito de uma rodada.
 *
 *  Uma rodada consiste em todos os jogadores jogarem uma das suas cartas.
 *  Ao final da rodada, será verificado qual for a maior carta para definir um campeão daquela rodada.
 *  Podem ocorrer empates também, caso todas as cartas empatem, nãa concedendo a vitória a nenhum dos jogadores.
 */
export default class RoundEventsEmitter extends EventsEmitterBase {

  /**
     *  Evento enviado para selecionar a carta que o jogador jogará na rodada atual.
     *  Caso seja de fato a vez do jogdor selecinar sua carta e ele fornecer um índice de carta válido, será colocado a nova
     *  carta na mesa para que todos possam vê-la (evento `table-update`). Caso contrário, o servidor informará o erro ao cliente
     *  (evento `select-card-error`).
     *
     *  @param cardIndex índice da carta selecionada
     */
  public emitSelectCard(cardIndex: number) {
    this.socket.emit('select-card', cardIndex);
  }
}
