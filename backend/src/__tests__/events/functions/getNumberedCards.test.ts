import { getNumberedCards } from '../../../events/functions/getDefaultCards';

describe('getNumberedCards', () => {
  test('sem cartas personalizadas, usa as 52 cartas padrão do jogo', () => {
    const cards = getNumberedCards(undefined, 2);

    expect(cards).toHaveLength(52);
    expect(cards.filter((card) => card.value === 1)).toHaveLength(4);
    expect(cards.filter((card) => card.value === 12)).toHaveLength(4);
    expect(cards.filter((card) => card.value >= 13)).toHaveLength(4);
  });

  test('usa exatamente as cartas personalizadas escolhidas', () => {
    const cards = getNumberedCards([5, 5, 999, 1], 2);

    expect(cards.map((card) => card.value)).toEqual([5, 5, 999, 1]);
  });

  test('completa com cartas de valor 1 até ter uma carta por jogador', () => {
    const cards = getNumberedCards([7], 3);

    expect(cards.map((card) => card.value)).toEqual([7, 1, 1]);
  });

  test('não adiciona cartas quando o baralho já tem cartas suficientes', () => {
    const cards = getNumberedCards([7, 8], 2);

    expect(cards.map((card) => card.value)).toEqual([7, 8]);
  });
});
