
import { insertCard } from '../../../events/round/functions/insertCard';
import { RoundCards } from '../../../interfaces/Lobby';

describe('insertCard', () => {

  function createRoundCards(): RoundCards {
    return {
      onMatch: [
        { card: { value: 8, type: 'common' }, playerId: '1' },
        { card: { value: 4, type: 'common' }, playerId: '2' },
      ],
      anulledCards: [
        { card: { value: 7, type: 'common' }, playerId: '3' },
        { card: { value: 7, type: 'common' }, playerId: '4' },
        { card: { value: 5, type: 'common' }, playerId: '5' },
        { card: { value: 5, type: 'common' }, playerId: '6' },
      ],
    };
  }

  test('Não deve alterar a lista original de cartas', () => {
    const cards = createRoundCards();

    insertCard(cards, { card: { value: 7, type: 'common' }, playerId: '5' });

    expect(cards).toEqual(createRoundCards());
  });

  test('Se não tiver nenhuma carta na mesa, deve inserir a carta na lista de cartas em partida', () => {
    const cards = createRoundCards();
    cards.onMatch = [];
    cards.anulledCards = [];

    const newCards = insertCard(cards, { card: { value: 7, type: 'common' }, playerId: '7' });

    expect(newCards).toEqual({
      onMatch: [{ card: { value: 7, type: 'common' }, playerId: '7' }],
      anulledCards: [],
    });
  });

  test('Deve inserir corretamente a carta na primeira posição caso ela seja a maior de todas', () => {
    const cards = createRoundCards();

    const newCards = insertCard(cards, { card: { value: 15, type: 'common' }, playerId: '7' });

    expect(newCards).toEqual({
      onMatch: [
        { card: { value: 15, type: 'common' }, playerId: '7' },
        { card: { value: 8, type: 'common' }, playerId: '1' },
        { card: { value: 4, type: 'common' }, playerId: '2' },
      ],
      anulledCards: [
        { card: { value: 7, type: 'common' }, playerId: '3' },
        { card: { value: 7, type: 'common' }, playerId: '4' },
        { card: { value: 5, type: 'common' }, playerId: '5' },
        { card: { value: 5, type: 'common' }, playerId: '6' },
      ],
    });
  });

  test('Deve inserir corretamente a carta em uma posição intermediária', () => {
    const cards = createRoundCards();

    const newCards = insertCard(cards, { card: { value: 6, type: 'common' }, playerId: '7' });

    expect(newCards).toEqual({
      onMatch: [
        { card: { value: 8, type: 'common' }, playerId: '1' },
        { card: { value: 6, type: 'common' }, playerId: '7' },
        { card: { value: 4, type: 'common' }, playerId: '2' },
      ],
      anulledCards: [
        { card: { value: 7, type: 'common' }, playerId: '3' },
        { card: { value: 7, type: 'common' }, playerId: '4' },
        { card: { value: 5, type: 'common' }, playerId: '5' },
        { card: { value: 5, type: 'common' }, playerId: '6' },
      ],
    });
  });

  test('Deve inserir corretamente a carta na última posição', () => {
    const cards = createRoundCards();

    const newCards = insertCard(cards, { card: { value: 3, type: 'common' }, playerId: '7' });

    expect(newCards).toEqual({
      onMatch: [
        { card: { value: 8, type: 'common' }, playerId: '1' },
        { card: { value: 4, type: 'common' }, playerId: '2' },
        { card: { value: 3, type: 'common' }, playerId: '7' },
      ],
      anulledCards: [
        { card: { value: 7, type: 'common' }, playerId: '3' },
        { card: { value: 7, type: 'common' }, playerId: '4' },
        { card: { value: 5, type: 'common' }, playerId: '5' },
        { card: { value: 5, type: 'common' }, playerId: '6' },
      ],
    });
  });

  test('Caso empate, as duas cartas empatadas devem ser colocadas na lista de cartas anuladas se esta estiver vazia', () => {
    const cards = createRoundCards();
    cards.anulledCards = [];

    const newCards = insertCard(cards, { card: { value: 8, type: 'common' }, playerId: '1' });

    expect(newCards).toEqual({
      onMatch: [
        { card: { value: 4, type: 'common' }, playerId: '2' }
      ],
      anulledCards: [
        { card: { value: 8, type: 'common' }, playerId: '1' },
        { card: { value: 8, type: 'common' }, playerId: '1' },
      ],
    });
  });

  test('Caso empate e as duas cartas empatadas sejam maiores que as outras cartas empatadas, devem ser inseridas no início da lista de cartas anuladas', () => {
    const cards = createRoundCards();

    const newCards = insertCard(cards, { card: { value: 8, type: 'common' }, playerId: '1' });

    expect(newCards).toEqual({
      onMatch: [
        { card: { value: 4, type: 'common' }, playerId: '2' },
      ],
      anulledCards: [
        { card: { value: 8, type: 'common' }, playerId: '1' },
        { card: { value: 8, type: 'common' }, playerId: '1' },
        { card: { value: 7, type: 'common' }, playerId: '3' },
        { card: { value: 7, type: 'common' }, playerId: '4' },
        { card: { value: 5, type: 'common' }, playerId: '5' },
        { card: { value: 5, type: 'common' }, playerId: '6' },
      ],
    });
  });

  test('Caso empate e as duas cartas empatadas sejam intermediárias, devem ser inseridas no meio da lista de cartas anuladas', () => {
    const cards = createRoundCards();

    let newCards = insertCard(cards, { card: { value: 6, type: 'common' }, playerId: '1' });
    newCards = insertCard(newCards, { card: { value: 6, type: 'common' }, playerId: '1' });

    expect(newCards).toEqual({
      onMatch: [
        { card: { value: 8, type: 'common' }, playerId: '1' },
        { card: { value: 4, type: 'common' }, playerId: '2' },
      ],
      anulledCards: [
        { card: { value: 7, type: 'common' }, playerId: '3' },
        { card: { value: 7, type: 'common' }, playerId: '4' },
        { card: { value: 6, type: 'common' }, playerId: '1' },
        { card: { value: 6, type: 'common' }, playerId: '1' },
        { card: { value: 5, type: 'common' }, playerId: '5' },
        { card: { value: 5, type: 'common' }, playerId: '6' },
      ],
    });
  });

  test('Caso empate e as duas cartas empatadas sejam menores que as outras cartas empatadas, devem ser inseridas no final da lista de cartas anuladas', () => {
    const cards = createRoundCards();

    const newCards = insertCard(cards, { card: { value: 4, type: 'common' }, playerId: '2' });

    expect(newCards).toEqual({
      onMatch: [
        { card: { value: 8, type: 'common' }, playerId: '1' },
      ],
      anulledCards: [
        { card: { value: 7, type: 'common' }, playerId: '3' },
        { card: { value: 7, type: 'common' }, playerId: '4' },
        { card: { value: 5, type: 'common' }, playerId: '5' },
        { card: { value: 5, type: 'common' }, playerId: '6' },
        { card: { value: 4, type: 'common' }, playerId: '2' },
        { card: { value: 4, type: 'common' }, playerId: '2' }
      ],
    });
  });
});
