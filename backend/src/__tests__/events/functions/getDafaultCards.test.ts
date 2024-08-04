
import { getDefaultCards } from '../../../events/functions/getDefaultCards';

describe('getDefaultCards', () => {

  test('Deve retornar um array com 52, sendo elas 4 cartas de 1 a 12 e 1 carta de 13 a 16 (todas cartas do tipo comum)', () => {
    const cards = getDefaultCards();

    expect(cards.length).toBe(52);
    expect(cards.every(card => card.type === 'common')).toBeTruthy();

    const cardsCountDict: { [key: number]: number } = {};

    for (const card of cards) {
      if (cardsCountDict[card.value]) {
        cardsCountDict[card.value]++;
      } else {
        cardsCountDict[card.value] = 1;
      }
    }

    expect(cardsCountDict[1] ).toBe(4);
    expect(cardsCountDict[2] ).toBe(4);
    expect(cardsCountDict[3] ).toBe(4);
    expect(cardsCountDict[4] ).toBe(4);
    expect(cardsCountDict[5] ).toBe(4);
    expect(cardsCountDict[6] ).toBe(4);
    expect(cardsCountDict[7] ).toBe(4);
    expect(cardsCountDict[8] ).toBe(4);
    expect(cardsCountDict[9] ).toBe(4);
    expect(cardsCountDict[10]).toBe(4);
    expect(cardsCountDict[11]).toBe(4);
    expect(cardsCountDict[12]).toBe(4);
    expect(cardsCountDict[13]).toBe(1);
    expect(cardsCountDict[14]).toBe(1);
    expect(cardsCountDict[15]).toBe(1);
    expect(cardsCountDict[16]).toBe(1);
  });

  test('Deve retornar dois arrays diferentes ao chamar a função duas vezes (mesmos valores, referências diferentes)', () => {
    const cards1 = getDefaultCards();
    const cards2 = getDefaultCards();

    expect(cards1).not.toBe(cards2);
    expect(cards1).toEqual(cards2);

    for (let i = 0; i < cards1.length; i++) {
      expect(cards1[i]).not.toBe(cards2[i]);
      expect(cards1[i]).toEqual(cards2[i]);
    }
  });
});
