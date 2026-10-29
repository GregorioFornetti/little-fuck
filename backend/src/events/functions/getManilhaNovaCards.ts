import { Card, CardSuit } from '../../interfaces/Lobby';
import { buildTrucoCards, TRUCO_COMMON_STRENGTH } from './getManilhaVelhaCards';

/** Valores das cartas comuns da mais forte para a mais fraca. */
const RANKS_STRONGEST_FIRST = ['3', '2', 'A', 'K', 'J', 'Q', '7', '6', '5', '4'];

/**
 *  Valor das manilhas da partida: um nível acima do valor da carta virada.
 *  Ex: virada 2, manilhas são os 3. Se a virada for um 3 (a carta comum mais
 *  forte), as manilhas são os 4 (a carta comum mais fraca).
 */
export function getManilhaNovaRank(turnedCardLabel: string): string {
  const index = RANKS_STRONGEST_FIRST.indexOf(turnedCardLabel);
  if (index < 0) {
    throw new Error(`Valor de carta inválido para manilha nova: ${turnedCardLabel}`);
  }
  return index === 0 ? '4' : RANKS_STRONGEST_FIRST[index - 1];
}

/** Força entre as manilhas, pelo naipe: paus, copas, espadas e ouros. */
const MANILHA_SUIT_STRENGTH: { [suit in CardSuit]: number } = {
  diamonds: 11,
  spades: 12,
  hearts: 13,
  clubs: 14
};

/**
 *  Cartas do tipo "manilha nova" (mesmo baralho e força base da manilha velha).
 *
 *  No início da partida uma carta é virada (a mesma para todos os jogadores) e
 *  sai do baralho. As manilhas são as cartas um nível acima da virada, mais
 *  fortes que todas as outras, desempatadas pelo naipe: paus, copas, espadas
 *  e ouros, da mais forte para a mais fraca.
 *
 *  @param turnedCard carta virada desejada. Sem ela, uma carta aleatória do baralho é virada
 *  @returns a carta virada e as 39 cartas restantes para distribuir aos jogadores
 */
export function getManilhaNovaCards(turnedCard?: Card): { turnedCard: Card, cards: Card[] } {
  const manilhaRank = turnedCard ? getManilhaNovaRank(turnedCard.label ?? '') : undefined;

  const allCards = buildTrucoCards((label, suit) =>
    manilhaRank !== undefined && label === manilhaRank
      ? MANILHA_SUIT_STRENGTH[suit]
      : TRUCO_COMMON_STRENGTH[label]
  );

  if (!turnedCard) {
    return getManilhaNovaCards(allCards[Math.floor(Math.random() * allCards.length)]);
  }

  const cards = allCards.filter(
    (card) => !(card.label === turnedCard.label && card.suit === turnedCard.suit)
  );
  const flipped = allCards.find(
    (card) => card.label === turnedCard.label && card.suit === turnedCard.suit
  );
  if (!flipped || cards.length !== allCards.length - 1) {
    throw new Error('A carta virada precisa fazer parte do baralho de truco');
  }

  return { turnedCard: flipped, cards };
}
