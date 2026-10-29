import { getManilhaParaguaiaStrength, getRankBelow } from '../../../events/functions/getManilhaParaguaiaStrength';
import { Card } from '../../../interfaces/Lobby';

describe('getManilhaParaguaiaStrength', () => {
  const card = (label: string, suit: Card['suit']): Pick<Card, 'label' | 'suit'> => ({ label, suit });
  const turned = card('2', 'spades'); // Virada 2

  test('rodada 1 segue a manilha nova: manilhas são os 3, por naipe', () => {
    expect(getManilhaParaguaiaStrength(card('3', 'clubs'), turned, 1)).toBeGreaterThan(
      getManilhaParaguaiaStrength(card('3', 'hearts'), turned, 1)
    );
    expect(getManilhaParaguaiaStrength(card('3', 'hearts'), turned, 1)).toBeGreaterThan(
      getManilhaParaguaiaStrength(card('3', 'spades'), turned, 1)
    );
    expect(getManilhaParaguaiaStrength(card('3', 'spades'), turned, 1)).toBeGreaterThan(
      getManilhaParaguaiaStrength(card('3', 'diamonds'), turned, 1)
    );
    // Manilhas acima de qualquer carta comum
    expect(getManilhaParaguaiaStrength(card('3', 'diamonds'), turned, 1)).toBeGreaterThan(
      getManilhaParaguaiaStrength(card('2', 'clubs'), turned, 1)
    );
  });

  test('rodada 2: manilhas são os ases, um nível abaixo da virada 2', () => {
    expect(getManilhaParaguaiaStrength(card('A', 'clubs'), turned, 2)).toBeGreaterThan(
      getManilhaParaguaiaStrength(card('A', 'diamonds'), turned, 2)
    );
    expect(getManilhaParaguaiaStrength(card('A', 'diamonds'), turned, 2)).toBeGreaterThan(
      getManilhaParaguaiaStrength(card('3', 'clubs'), turned, 2)
    );
    // Os 3 voltam a ser cartas comuns (as mais fortes entre as comuns)
    expect(getManilhaParaguaiaStrength(card('3', 'clubs'), turned, 2)).toBeGreaterThan(
      getManilhaParaguaiaStrength(card('2', 'clubs'), turned, 2)
    );
  });

  test('rodada 3: manilhas fixas da manilha velha', () => {
    const zap = getManilhaParaguaiaStrength(card('4', 'clubs'), turned, 3);
    const seteCopas = getManilhaParaguaiaStrength(card('7', 'hearts'), turned, 3);
    const asEspadas = getManilhaParaguaiaStrength(card('A', 'spades'), turned, 3);
    const seteOuros = getManilhaParaguaiaStrength(card('7', 'diamonds'), turned, 3);

    expect(zap).toBeGreaterThan(seteCopas);
    expect(seteCopas).toBeGreaterThan(asEspadas);
    expect(asEspadas).toBeGreaterThan(seteOuros);
    expect(seteOuros).toBeGreaterThan(getManilhaParaguaiaStrength(card('3', 'clubs'), turned, 3));
    // Um 3 qualquer não é manilha na rodada 3
    expect(getManilhaParaguaiaStrength(card('3', 'hearts'), turned, 3)).toBe(
      getManilhaParaguaiaStrength(card('3', 'clubs'), turned, 3)
    );
  });

  test('o ciclo de três rodadas se repete', () => {
    for (const round of [1, 2, 3]) {
      expect(getManilhaParaguaiaStrength(card('3', 'clubs'), turned, round + 3)).toBe(
        getManilhaParaguaiaStrength(card('3', 'clubs'), turned, round)
      );
      expect(getManilhaParaguaiaStrength(card('7', 'hearts'), turned, round + 3)).toBe(
        getManilhaParaguaiaStrength(card('7', 'hearts'), turned, round)
      );
    }
  });

  test('um nível abaixo segue o ciclo dos valores', () => {
    expect(getRankBelow('2')).toBe('A');
    expect(getRankBelow('3')).toBe('2');
    expect(getRankBelow('5')).toBe('4');
    expect(getRankBelow('4')).toBe('3'); // A carta mais fraca volta para a mais forte

    const turnedFour = card('4', 'hearts');
    expect(getManilhaParaguaiaStrength(card('3', 'clubs'), turnedFour, 2)).toBeGreaterThan(
      getManilhaParaguaiaStrength(card('2', 'clubs'), turnedFour, 2)
    );
  });
});
