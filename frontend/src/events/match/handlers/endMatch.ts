import { lobby } from '@/connection';
import { buildMatchSummary } from '@/components/pages/gameState';
import { i18n } from '@/plugins/i18n';

/**
 *  Evento enviado para indicar o fim da partida. Uma partida acaba quando todos os jogadores já jogaram todas as suas cartas, ou seja,
 *  todas as rodadas dessa partida foram finalizadas, podendo atualizar as vidas dos jogadores dependendo das vitórias e palpites feitos.
 *
 *  @param playerHealthUpdate É um objeto tendo como chaves todos os ids dos jogadores do lobby.
 *  É um objeto mapeando id de jogadores para o valor que deve ser modificado em sua vida final.
 *  Ex: { 123: -1 } = jogador com id 123 perdeu uma vida
 */
export function handleEndMatch(playerHealthUpdate: { [playerId: string]: number }) {
  if (lobby.value === null) {
    throw new Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY'));
  }

  if (!lobby.value.game) {
    throw new Error(i18n.t('COMMON.ERROR.GAME_NOT_STARTED'));
  }

  if (!lobby.value.game.match) {
    throw new Error(i18n.t('COMMON.ERROR.MATCH_NOT_STARTED'));
  }

  // Guarda o resumo da partida para exibição entre partidas e no histórico do jogo
  const summary = buildMatchSummary(
    lobby.value.game.match,
    playerHealthUpdate,
    lobby.value.players.map((player) => player.id)
  );
  lobby.value.game.lastMatchSummary = summary;
  lobby.value.game.history = [
    ...(lobby.value.game.history ?? []),
    {
      matchNumber: lobby.value.game.matchNumber,
      rows: summary,
      roundWinners: lobby.value.game.currentRoundWinners ?? [],
      rounds: lobby.value.game.currentRounds ?? [],
      turnedCard: lobby.value.game.match.turnedCard,
      cardType: lobby.value.options?.cardType
    }
  ];
  lobby.value.game.currentRoundWinners = [];
  lobby.value.game.currentRounds = [];

  for (const playerId in playerHealthUpdate) {
    lobby.value.game.playersHealth[playerId] += playerHealthUpdate[playerId];
  }

  lobby.value.game.match = undefined;
  lobby.value.game.matchNumber += 1;
  lobby.value.game.roundNumber = 1;
}
