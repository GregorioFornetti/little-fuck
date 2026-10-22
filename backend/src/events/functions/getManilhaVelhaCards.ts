import { Card, CardSuit } from '../../interfaces/Lobby';

/**
 *  Cartas do tipo "manilha velha" (baralho de truco, 40 cartas: sem 8, 9 e 10).
 *
 *  Da mais forte para a mais fraca: as manilhas são o 4 de paus (Zap), o 7 de copas,
 *  o Ás de espadas e o 7 de ouros, mais fortes que todas as outras cartas. Depois vêm
 *  as cartas comuns: 3, 2, Ases (exceto o de espadas), Reis, Valetes, Damas, os 7
 *  restantes, 6, 5 e os 4 restantes.
 *
 *  O campo `value` guarda a força da carta seguindo exatamente essa ordem (cartas
 *  comuns de mesmo valor empatam entre si), enquanto `label` e `suit` guardam o
 *  valor e o naipe que devem ser exibidos para os jogadores.
 *
 *  @returns uma lista contendo todas as cartas do tipo manilha velha
 */
export function getManilhaVelhaCards(): Card[] {
  const suits: CardSuit[] = ['clubs', 'hearts', 'spades', 'diamonds'];

  // Força das cartas comuns, da mais fraca (4) para a mais forte (3)
  const commonStrength: { [label: string]: number } = {
    '4': 1,
    '5': 2,
    '6': 3,
    '7': 4,
    'Q': 5,
    'J': 6,
    'K': 7,
    'A': 8,
    '2': 9,
    '3': 10
  };

  // Força das manilhas, todas acima das cartas comuns: 7 de ouros, Ás de espadas, 7 de copas e Zap
  const manilhaStrength = (label: string, suit: CardSuit): number | undefined => {
    if (label === '7' && suit === 'diamonds') return 11;
    if (label === 'A' && suit === 'spades') return 12;
    if (label === '7' && suit === 'hearts') return 13;
    if (label === '4' && suit === 'clubs') return 14; // Zap, a carta mais forte do jogo
    return undefined;
  };

  const cards: Card[] = [];
  for (const label of Object.keys(commonStrength)) {
    for (const suit of suits) {
      cards.push({
        value: manilhaStrength(label, suit) ?? commonStrength[label],
        type: 'common',
        suit,
        label
      });
    }
  }

  return cards;
}
