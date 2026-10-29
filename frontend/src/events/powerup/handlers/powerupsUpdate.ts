import type { PowerupType } from '@/interfaces/Lobby';
import { lobby, playerPowerups } from '@/connection';
import { i18n } from '@/plugins/i18n';

/**
 *  Evento com os poderes guardados do próprio jogador e a quantidade de
 *  poderes de todos os jogadores da sala.
 *
 *  @param powerups poderes guardados do próprio jogador
 *  @param counts quantidade de poderes guardados por jogador
 */
export function handlePowerupsUpdate(powerups: PowerupType[], counts: { [playerId: string]: number }) {
  if (lobby.value === null) {
    throw new Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY'));
  }

  playerPowerups.value = [...powerups];
  for (const player of lobby.value.players) {
    player.powerupCount = counts[player.id] ?? 0;
  }
}
