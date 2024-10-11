import { RoundCard, RoundCards } from '../../../interfaces/Lobby';

/**
 *  Insere uma carta na mesa da rodada atual. Essa função irá inserir de forma ordenada a nova carta nas cartas que estão em partida (onMatch),
 *  caso não exista nenhuma carta igual a ela. Caso exista, a carta será inserida na lista de cartas anuladas (anulledCards),
 *  também de forma ordenada (juntamente com a outra carta que empatou). A função não atualiza o objeto original de cartas (mesa), mas sim retorna um novo objeto com as cartas atualizadas.
 *
 *  @param cards São as cartas (mesa) da rodada atual
 *  @param toInsertRoundCard É a carta que será inserida na mesa
 *
 *  @returns Retorna um novo objeto de cartas (mesa) da rodada atual, com a carta inserida
 */
export function insertCard(cards: RoundCards, toInsertRoundCard: RoundCard): RoundCards {

  const newRoundCards: RoundCards = {
    onMatch: [],
    anulledCards: [],
  };

  let cardPlaceFound = false;
  let annuledCard: RoundCard | null = null;
  for (let i = 0; i < cards.onMatch.length; i++) {
    const currentRoundCard = cards.onMatch[i];
    if (!cardPlaceFound) {
      if (toInsertRoundCard.card.value === currentRoundCard.card.value) {
        // Ocorreu um empate, então a carta atual e a carta que estava na partida irão para a lista de cartas anuladas
        annuledCard = currentRoundCard;
        cardPlaceFound = true;
        continue; // É preciso usar o continue para não inserir a carta que empatou na lista de cartas em partida
      }
      else if (toInsertRoundCard.card.value > currentRoundCard.card.value) {
        // Encontramos o lugar da carta deverá ser inserida
        newRoundCards.onMatch.push(toInsertRoundCard);
        cardPlaceFound = true;
      }
    }
    newRoundCards.onMatch.push(currentRoundCard);
  }

  if (!cardPlaceFound) { // Caso a carta a ser inserida seja a menor de todas, é preciso inserir ela no final da lista
    newRoundCards.onMatch.push(toInsertRoundCard);
  }

  if (annuledCard) {
    // Se houve cartas empatadas, é preciso inseri-las na lista de cartas anuladas de forma ordenada
    let annuledCardPlaceFound = false;

    for (let i = 0; i < cards.anulledCards.length; i++) {
      const currentRoundCard = cards.anulledCards[i];
      if (!annuledCardPlaceFound && annuledCard.card.value > currentRoundCard.card.value) {
        // Encontramos o lugar da carta deverá ser inserida
        newRoundCards.anulledCards.push(annuledCard);
        newRoundCards.anulledCards.push(toInsertRoundCard);
        annuledCardPlaceFound = true;
      }
      newRoundCards.anulledCards.push(currentRoundCard);
    }

    if (!annuledCardPlaceFound) { // Caso a carta a ser inserida seja a menor de todas, é preciso inserir ela no final da lista
      newRoundCards.anulledCards.push(annuledCard);
      newRoundCards.anulledCards.push(toInsertRoundCard);
    }
  }

  return newRoundCards;
}
