import Lobby from '../../interfaces/Lobby';

/**
 *  Escolhe qual carta o bot deve jogar na rodada atual:
 *  - Começando a mesa, joga sua carta mais fraca (guardando as fortes).
 *  - Com cartas na mesa, joga a carta mais fraca que ainda vence a rodada.
 *  - Sem nenhuma carta vencedora, descarta a carta mais fraca.
 *
 *  @param lobby informações da sala atual
 *  @param botId id do bot que deve jogar
 *  @returns o índice da carta escolhida na mão do bot
 */
export function chooseBotCardIndex(lobby: Lobby, botId: string): number {
  const hand = lobby.game?.match?.players[botId]?.cards ?? [];
  if (hand.length === 0) {
    return 0;
  }

  const indexesByStrength = hand
    .map((card, index) => ({ card, index }))
    .sort((a, b) => a.card.value - b.card.value);

  const bestOnTable = lobby.game?.match?.round?.cards.onMatch[0]?.card.value;
  if (bestOnTable === undefined) {
    return indexesByStrength[0].index;
  }

  const cheapestWin = indexesByStrength.find(({ card }) => card.value > bestOnTable);
  return (cheapestWin ?? indexesByStrength[0]).index;
}
