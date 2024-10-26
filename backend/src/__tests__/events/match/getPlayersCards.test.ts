
import { getPlayersCards } from '../../../events/match/functions/getPlayersCards';
import { shuffle } from '../../../functions/shuffle';
import { Card } from '../../../interfaces/Lobby';
import i18n from '../../../plugins/i18n';

function createCards(): Card[] {
  const cards: Card[] = [];
  for (let i = 0; i < 50; i++) {
    cards.push({ value: i, type: 'common' });
  }
  return cards;
}

const shuffledCards: Card[] = createCards();

jest.mock('../../../functions/shuffle',
  () => ({
    shuffle: jest.fn((_array) => [...shuffledCards])
  })
);

describe('getPlayersCards', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function createCards(): Card[] {
    const cards: Card[] = [];
    for (let i = 0; i < 50; i++) {
      cards.push({ value: i, type: 'common' });
    }
    return cards;
  }

  function verifyPlayersCards(playersCards: { [playerId: string]: Card[] }, playersIds: string[], numCards: number) {
    expect(Object.keys(playersCards)).toHaveLength(playersIds.length);

    for (const playerId of playersIds) {
      expect(playersCards[playerId]).toHaveLength(numCards);
      expect(playersIds).toContain(playerId);
    }

    expect(shuffle).toHaveBeenCalledTimes(1);

    const allSelectedCards: Card[] = [];
    for (const playerId of playersIds) {
      allSelectedCards.push(...playersCards[playerId]);
    }

    // Verifica se todas as cartas sorteadas são de fatos cartas que foram embaralhadas
    for (const card of allSelectedCards) {
      expect(shuffledCards).toContain(card);
    }

    // Verifica se as cartas sorteadas são diferentes entre si
    for (let i = 0; i < allSelectedCards.length; i++) {
      for (let j = i + 1; j < allSelectedCards.length; j++) {
        if (i !== j) {
          expect(allSelectedCards[i]).not.toEqual(allSelectedCards[j]);
        }
      }
    }
  }

  test('Deve retornar uma carta aleatória para cada jogador caso numCards seja 1', () => {
    const cards = createCards();
    const playersIds = ['player1id', 'player2id', 'player3id'];
    const numCards = 1;

    const playersCards = getPlayersCards(playersIds, cards, numCards);

    verifyPlayersCards(playersCards, playersIds, numCards);
  });

  test('Deve retornar duas cartas aleatórias para cada jogador caso numCards seja 2', () => {
    const cards = createCards();
    const playersIds = ['player1id', 'player2id', 'player3id'];
    const numCards = 2;

    const playersCards = getPlayersCards(playersIds, cards, numCards);

    verifyPlayersCards(playersCards, playersIds, numCards);
  });

  test('Deve retornar cinco cartas aleatórias para cada jogador caso numCards seja 5', () => {
    const cards = createCards();
    const playersIds = ['player1id', 'player2id', 'player3id'];
    const numCards = 5;

    const playersCards = getPlayersCards(playersIds, cards, numCards);

    verifyPlayersCards(playersCards, playersIds, numCards);
  });

  test('Deve lançar um erro caso não haja jogadores vivos', () => {
    const cards = createCards();
    const playersIds: string[] = [];
    const numCards = 1;

    expect(() => getPlayersCards(playersIds, cards, numCards)).toThrow(new Error(i18n.t('COMMON.ERROR.NO_PLAYERS_ALIVE')));
  });

  test('Deve lançar erro caso numCards seja menor que 1', () => {
    const cards = createCards();
    const playersIds = ['player1id', 'player2id', 'player3id'];
    const numCards = 0;

    expect(() => getPlayersCards(playersIds, cards, numCards)).toThrow(new Error(i18n.t('COMMON.ERROR.INVALID_NEGATIVE_NUM_CARDS')));
  });

  test('Deve lançar erro caso não haja cartas suficientes para sortear', () => {
    const cards = createCards();
    const playersIds = ['player1id', 'player2id', 'player3id'];
    const numCards = 100;

    expect(() => getPlayersCards(playersIds, cards, numCards)).toThrow(new Error(i18n.t('COMMON.ERROR.NOT_ENOUGH_CARDS')));
  });
});
