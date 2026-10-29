import { Card, CardSuit } from '../../interfaces/Lobby';
import { TRUCO_COMMON_STRENGTH } from './getManilhaVelhaCards';
import { getManilhaNovaRank } from './getManilhaNovaCards';

/** Valores das cartas comuns da mais forte para a mais fraca. */
const RANKS_STRONGEST_FIRST = ['3', '2', 'A', 'K', 'J', 'Q', '7', '6', '5', '4'];

/**
 *  Valor um nível abaixo do informado (na força das cartas comuns).
 *  Se o valor for o 4 (a carta comum mais fraca), o nível abaixo é o 3
 *  (a carta comum mais forte), seguindo o ciclo dos valores.
 */
export function getRankBelow(label: string): string {
  const index = RANKS_STRONGEST_FIRST.indexOf(label);
  if (index < 0) {
    throw new Error(`Valor de carta inválido para manilha paraguaia: ${label}`);
  }
  return RANKS_STRONGEST_FIRST[(index + 1) % RANKS_STRONGEST_FIRST.length];
}

/** Força entre manilhas definidas pela virada, pelo naipe: paus, copas, espadas e ouros. */
const TURNED_MANILHA_SUIT_STRENGTH: { [suit in CardSuit]: number } = {
  diamonds: 11,
  spades: 12,
  hearts: 13,
  clubs: 14
};

/** Manilhas fixas da manilha velha: 7 de ouros, Ás de espadas, 7 de copas e Zap. */
const FIXED_MANILHA_STRENGTH = (label: string, suit: CardSuit): number | undefined => {
  if (label === '7' && suit === 'diamonds') return 11;
  if (label === 'A' && suit === 'spades') return 12;
  if (label === '7' && suit === 'hearts') return 13;
  if (label === '4' && suit === 'clubs') return 14;
  return undefined;
};

/**
 *  Força de uma carta na manilha paraguaia, que muda a cada rodada da partida
 *  seguindo um ciclo de três rodadas:
 *  - Rodadas 1, 4, 7...: igual à manilha nova (manilhas um nível acima da virada)
 *  - Rodadas 2, 5, 8...: manilhas um nível abaixo da virada
 *  - Rodadas 3, 6, 9...: manilhas fixas da manilha velha
 *
 *  @param card carta a ser avaliada
 *  @param turnedCard carta virada no início da partida
 *  @param roundNumber número da rodada dentro da partida (começa em 1)
 */
export function getManilhaParaguaiaStrength(
  card: Pick<Card, 'label' | 'suit'>,
  turnedCard: Pick<Card, 'label' | 'suit'>,
  roundNumber: number
): number {
  const label = card.label ?? '';
  const suit = card.suit ?? 'clubs';
  const cycle = (roundNumber - 1) % 3;

  if (cycle === 2) {
    return FIXED_MANILHA_STRENGTH(label, suit) ?? TRUCO_COMMON_STRENGTH[label];
  }

  const manilhaRank = cycle === 0
    ? getManilhaNovaRank(turnedCard.label ?? '')
    : getRankBelow(turnedCard.label ?? '');

  return label === manilhaRank
    ? TURNED_MANILHA_SUIT_STRENGTH[suit]
    : TRUCO_COMMON_STRENGTH[label];
}
