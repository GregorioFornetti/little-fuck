
import i18n from '../../../plugins/i18n';
import { getNextMatchNumCards } from '../../../events/match/functions/getNextMatchNumCards';
import { Card } from '../../../interfaces/Lobby';

describe('getNextMatchNumCards', () => {

  function generate52CardsList(): Card[] {
    const cards: Card[] = [];
    for (let i = 0; i < 52; i++) {
      cards.push({
        type: 'common',
        value: 1
      });
    }
    return cards;
  }

  test('Se o número de cartas é maior que o mínimo necessário, deve retornar o número de cartas atual + 1', () => {
    const currentMatchNumCards = 1;
    const alivePlayersIds = ['1', '2', '3', '4']; // 4 players
    const possibleCards = generate52CardsList();

    const nextMatchNumCards = getNextMatchNumCards(currentMatchNumCards, alivePlayersIds, possibleCards);

    // Com 4 jogadores é possível fornecer 2 cartas para cada jogador, já que temos 52 cartas no total e precisamos de 8 cartas (2 * 4 (2 cartas por jogador))
    expect(nextMatchNumCards).toBe(2);
  });

  test('Se o número de cartas é igual ao mínimo necessário, deve retornar o número de cartas atual + 1', () => {
    const currentMatchNumCards = 12;
    const alivePlayersIds = ['1', '2', '3', '4']; // 4 players
    const possibleCards = generate52CardsList();

    const nextMatchNumCards = getNextMatchNumCards(currentMatchNumCards, alivePlayersIds, possibleCards);

    // Com 4 jogadores é possível fornecer 13 cartas para cada jogador, já que temos 52 cartas no total e precisamos de 52 cartas (13 * 4 (13 cartas por jogador))
    expect(nextMatchNumCards).toBe(13);
  });

  test('Se o número de cartas é maior que o máximo possível, deve retornar 1', () => {
    const currentMatchNumCards = 13;
    const alivePlayersIds = ['1', '2', '3', '4']; // 4 players
    const possibleCards = generate52CardsList();

    const nextMatchNumCards = getNextMatchNumCards(currentMatchNumCards, alivePlayersIds, possibleCards);

    // Com 4 jogadores é possível fornecer 13 cartas para cada jogador, já que temos 52 cartas no total e precisamos de 52 cartas (13 * 4 (13 cartas por jogador))
    expect(nextMatchNumCards).toBe(1);
  });

  test('Se não houver jogadores vivos, deve lançar um erro', () => {
    const currentMatchNumCards = 1;
    const alivePlayersIds: string[] = [];
    const possibleCards = generate52CardsList();

    expect(() => getNextMatchNumCards(currentMatchNumCards, alivePlayersIds, possibleCards))
      .toThrow(new Error(i18n.t('COMMON.ERROR.NO_PLAYERS_ALIVE')));
  });

  test('Se não houver cartas, deve lançar um erro', () => {
    const currentMatchNumCards = 1;
    const alivePlayersIds = ['1', '2', '3', '4']; // 4 players
    const possibleCards: Card[] = [];

    expect(() => getNextMatchNumCards(currentMatchNumCards, alivePlayersIds, possibleCards))
      .toThrow(new Error(i18n.t('COMMON.ERROR.NO_CARDS')));
  });
});
