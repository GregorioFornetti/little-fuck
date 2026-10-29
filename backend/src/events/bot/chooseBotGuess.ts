import Lobby from '../../interfaces/Lobby';
import { checkValidFinalGuess } from '../match/functions/checkValidFinalGuess';

/**
 *  Escolhe o palpite de um bot: a quantidade de cartas fortes que ele tem na mão.
 *
 *  Na partida especial (1 carta), o bot palpita 1 apenas se a carta dele for
 *  mais forte que a de todos os outros jogadores. Nos demais casos, cartas
 *  fortes são as de valor 12 ou mais nas cartas numeradas, e as de valor 10
 *  ou mais nos baralhos de truco (3s e manilhas). O palpite é ajustado para
 *  nunca violar a regra do último jogador a palpitar.
 *
 *  @param lobby informações da sala atual
 *  @param botId id do bot que deve palpitar
 *  @returns o palpite escolhido pelo bot
 */
export function chooseBotGuess(lobby: Lobby, botId: string): number {
  const game = lobby.game;
  const match = game?.match;
  const hand = match?.players[botId]?.cards ?? [];
  const numRounds = game?.numRounds ?? hand.length;

  let guess: number;
  if (numRounds === 1 && hand.length === 1) {
    const ownValue = hand[0].value;
    const othersValues = Object.entries(match?.players ?? {})
      .filter(([playerId]) => playerId !== botId)
      .flatMap(([, player]) => player.cards.map((card) => card.value));
    guess = othersValues.every((value) => ownValue > value) ? 1 : 0;
  } else {
    const strongThreshold = lobby.options?.cardType === 'numbered' || !lobby.options?.cardType ? 12 : 10;
    guess = hand.filter((card) => card.value >= strongThreshold).length;
  }

  const candidates = [guess, guess + 1, guess - 1, 0, 1, 2];
  for (let candidate = 0; candidate <= numRounds; candidate++) {
    candidates.push(candidate);
  }
  for (const candidate of candidates) {
    if (candidate >= 0 && candidate <= numRounds && checkValidFinalGuess(lobby, candidate)) {
      return candidate;
    }
  }
  return 0;
}
