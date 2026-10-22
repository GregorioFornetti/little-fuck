
import Player from '../../../interfaces/Player';
import { generateInternalServerError } from '../../general/functions/generateInternalServerError';
import { insertCard } from '../functions/insertCard';
import { getNextPlayerId } from '../../functions/getNextPlayerId';
import { endRound } from '../functions/endRound';
import { generateAutomaticSelectCard } from '../functions/generateAutomaticSelectCard';
import Timer from 'easytimer.js';
import { PLAYER_ACTION_TIME_SECONDS } from '../../../global';

/**
 *  Evento enviado para selecionar a carta que o jogador jogará na rodada atual.
 *  Caso seja de fato a vez do jogdor selecinar sua carta e ele fornecer um índice de carta válido, será colocado a nova carta
 *  na mesa para que todos possam vê-la (evento `table-update`). Caso contrário, o servidor informará o erro ao cliente
 *  (`evento select-card-error ).
 *
 *  @param player Objeto contendo informações do jogador que acaba de chamar o evento
 *  @param cardIndex Índice da carta que o jogador deseja jogar
 */
export function handleSelectCard(player: Player, cardIndex: number): void {
  if (!player.lobby) {
    return player.eventsEmitter.Round.emitSelectCardError('not-in-lobby');
  }
  const lobby = player.lobby;

  if (!lobby.game) {
    return player.eventsEmitter.Round.emitSelectCardError('not-in-game');
  }

  if (!lobby.game.match) {
    return player.eventsEmitter.Round.emitSelectCardError('not-in-match');
  }

  if (!lobby.game.match.round) {
    return player.eventsEmitter.Round.emitSelectCardError('not-in-round');
  }

  if (lobby.game.match.round.nextPlayerId !== player.playerId) {
    return player.eventsEmitter.Round.emitSelectCardError('not-your-turn');
  }

  if (cardIndex < 0 || cardIndex >= lobby.game.match.players[player.playerId].cards.length) {
    return player.eventsEmitter.Round.emitSelectCardError('invalid-index');
  }

  try {
    lobby.game.timer.stop();

    // A carta jogada é descartada da mão do jogador
    const [playedCard] = lobby.game.match.players[player.playerId].cards.splice(cardIndex, 1);

    const newTableCards = insertCard(
      lobby.game.match.round.cards,
      { card: playedCard, playerId: player.playerId }
    );
    lobby.game.match.round.cards = newTableCards;

    lobby.game.match.round.nextPlayerId = getNextPlayerId(lobby.game.match.round.nextPlayerId, lobby);
    if (lobby.game.match.roundFirstPlayerId === lobby.game.match.round.nextPlayerId) {
      // O último jogador acabou de selecionar a carta, então é hora de finalizar a rodada
      lobby.game.match.round.nextPlayerId = undefined;
      // A mesa deve ser atualizada antes de finalizar a rodada, pois `endRound` limpa a rodada atual
      player.eventsEmitter.Round.emitTableUpdate(newTableCards, undefined);
      endRound(lobby);
    } else {
      // Ainda há jogadores que precisam selecionar cartas. Deve iniciar um timer para selecionar uma carta automaticamente caso o jogador não selecione a tempo
      lobby.game.timer = new Timer();
      lobby.game.timer.start({ countdown: true, startValues: { seconds: lobby.options?.playerActionTimeSeconds ?? PLAYER_ACTION_TIME_SECONDS } });
      lobby.game.timer.addEventListener('targetAchieved', () => {
        generateAutomaticSelectCard(lobby);
      });

      player.eventsEmitter.Round.emitTableUpdate(newTableCards, lobby.game.match.round.nextPlayerId);
    }
  } catch (error) {
    generateInternalServerError(player.lobby, error as Error);
  }
}
