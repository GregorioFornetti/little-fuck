import { getManilhaNovaCards, getManilhaNovaRank } from '../../../events/functions/getManilhaNovaCards';
import { Card } from '../../../interfaces/Lobby';

describe('getManilhaNovaCards', () => {
  const card = (label: string, suit: Card['suit']): Card => ({ value: 0, type: 'common', label, suit });
  const find = (cards: Card[], label: string, suit: Card['suit']): Card => {
    const found = cards.find((candidate) => candidate.label === label && candidate.suit === suit);
    if (!found) throw new Error(`Carta ${label} de ${suit} não encontrada`);
    return found;
  };

  test('a carta virada sai do baralho e restam 39 cartas', () => {
    const { turnedCard, cards } = getManilhaNovaCards(card('2', 'spades'));

    expect(cards).toHaveLength(39);
    expect(cards).not.toContainEqual(
      expect.objectContaining({ label: turnedCard.label, suit: turnedCard.suit })
    );
    const keys = cards.map((candidate) => `${candidate.label}-${candidate.suit}`);
    expect(new Set(keys).size).toBe(39);
  });

  test('virada 2: as manilhas são os 3, por naipe paus, copas, espadas e ouros', () => {
    const { cards } = getManilhaNovaCards(card('2', 'spades'));

    expect(find(cards, '3', 'clubs').value).toBeGreaterThan(find(cards, '3', 'hearts').value);
    expect(find(cards, '3', 'hearts').value).toBeGreaterThan(find(cards, '3', 'spades').value);
    expect(find(cards, '3', 'spades').value).toBeGreaterThan(find(cards, '3', 'diamonds').value);

    // Todas as manilhas são mais fortes que qualquer carta comum
    const manilhaValues = ['clubs', 'hearts', 'spades', 'diamonds'].map(
      (suit) => find(cards, '3', suit as Card['suit']).value
    );
    const commonValues = cards
      .filter((candidate) => candidate.label !== '3')
      .map((candidate) => candidate.value);
    expect(Math.min(...manilhaValues)).toBeGreaterThan(Math.max(...commonValues));

    // Sem manilhas fixas: o Zap da manilha velha é apenas um 4 comum aqui
    expect(find(cards, '4', 'clubs').value).toBe(find(cards, '4', 'hearts').value);
    expect(find(cards, '7', 'hearts').value).toBe(find(cards, '7', 'clubs').value);
  });

  test('virada 3: as manilhas são os 4', () => {
    expect(getManilhaNovaRank('3')).toBe('4');
    const { cards } = getManilhaNovaCards(card('3', 'hearts'));

    expect(find(cards, '4', 'clubs').value).toBeGreaterThan(find(cards, '4', 'hearts').value);
    expect(find(cards, '4', 'diamonds').value).toBeGreaterThan(find(cards, '3', 'clubs').value);
    // Os 3 continuam sendo a carta comum mais forte
    expect(find(cards, '3', 'clubs').value).toBeGreaterThan(find(cards, '2', 'clubs').value);
  });

  test('o valor da manilha é sempre um nível acima da virada', () => {
    expect(getManilhaNovaRank('2')).toBe('3');
    expect(getManilhaNovaRank('A')).toBe('2');
    expect(getManilhaNovaRank('K')).toBe('A');
    expect(getManilhaNovaRank('J')).toBe('K');
    expect(getManilhaNovaRank('Q')).toBe('J');
    expect(getManilhaNovaRank('7')).toBe('Q');
    expect(getManilhaNovaRank('4')).toBe('5');
    expect(getManilhaNovaRank('3')).toBe('4');
  });

  test('sem carta informada, vira uma carta aleatória do baralho', () => {
    const { turnedCard, cards } = getManilhaNovaCards();

    expect(turnedCard.label).toBeDefined();
    expect(turnedCard.suit).toBeDefined();
    expect(cards).toHaveLength(39);
  });
});
