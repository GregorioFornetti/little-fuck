import { getManilhaVelhaCards } from '../../../events/functions/getManilhaVelhaCards';
import { Card } from '../../../interfaces/Lobby';

describe('getManilhaVelhaCards', () => {
  const cards = getManilhaVelhaCards();
  const find = (label: string, suit: Card['suit']): Card => {
    const card = cards.find((candidate) => candidate.label === label && candidate.suit === suit);
    if (!card) throw new Error(`Carta ${label} de ${suit} não encontrada`);
    return card;
  };

  test('deve ter 40 cartas, com todos os valores e naipes sem repetição', () => {
    expect(cards).toHaveLength(40);
    const keys = cards.map((card) => `${card.label}-${card.suit}`);
    expect(new Set(keys).size).toBe(40);
    expect(new Set(cards.map((card) => card.label))).toEqual(
      new Set(['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'])
    );
  });

  test('as manilhas são as cartas mais fortes, na ordem Zap, 7 de copas, Ás de espadas e 7 de ouros', () => {
    const zap = find('4', 'clubs');
    const seteCopas = find('7', 'hearts');
    const asEspadas = find('A', 'spades');
    const seteOuros = find('7', 'diamonds');

    const strongestCommon = Math.max(
      ...cards.filter((card) => ![zap, seteCopas, asEspadas, seteOuros].includes(card)).map((card) => card.value)
    );

    expect(zap.value).toBeGreaterThan(seteCopas.value);
    expect(seteCopas.value).toBeGreaterThan(asEspadas.value);
    expect(asEspadas.value).toBeGreaterThan(seteOuros.value);
    expect(seteOuros.value).toBeGreaterThan(strongestCommon);
  });

  test('as cartas comuns seguem a ordem 3, 2, A, K, J, Q, 7, 6, 5, 4', () => {
    const strength = (label: string, suit: Card['suit']) => find(label, suit).value;

    // Um representante comum de cada valor, na ordem da mais forte para a mais fraca
    const ordered: Array<[string, Card['suit']]> = [
      ['3', 'clubs'],
      ['2', 'clubs'],
      ['A', 'clubs'], // Ás de espadas é manilha
      ['K', 'clubs'],
      ['J', 'clubs'],
      ['Q', 'clubs'],
      ['7', 'clubs'], // 7 de copas e de ouros são manilhas
      ['6', 'clubs'],
      ['5', 'clubs'],
      ['4', 'hearts'] // 4 de paus é o Zap
    ];

    for (let i = 0; i < ordered.length - 1; i++) {
      expect(strength(...ordered[i])).toBeGreaterThan(strength(...ordered[i + 1]));
    }
  });

  test('cartas comuns de mesmo valor empatam entre si', () => {
    expect(find('3', 'hearts').value).toBe(find('3', 'diamonds').value);
    expect(find('K', 'spades').value).toBe(find('K', 'clubs').value);
    expect(find('4', 'spades').value).toBe(find('4', 'diamonds').value);
  });
});
