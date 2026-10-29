import type { Card } from '@/interfaces/Lobby';
import { peekedCard } from '@/connection';

/**
 *  Evento com o resultado do poder peek-card: uma carta da mão do jogador
 *  alvo, revelada apenas para quem usou o poder.
 *
 *  @param card carta revelada do alvo
 *  @param targetPlayerId id do jogador alvo
 */
export function handlePeekResult(card: Card, targetPlayerId: string) {
  peekedCard.value = { card, targetPlayerId };
}
