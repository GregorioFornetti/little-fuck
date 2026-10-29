import type { PowerupType } from '@/interfaces/Lobby';
import { lobby } from '@/connection';
import { i18n } from '@/plugins/i18n';

export interface PowerupUsedInfo {
  type: PowerupType,
  userId: string,
  targetPlayerId?: string,
  pendingStrengthTotal?: number
}

/**
 *  Evento indicando que um poder foi usado na partida. Atualiza o estado
 *  visível do efeito: força invertida na rodada e modificadores pendentes.
 *
 *  @param info informações sobre o poder usado
 */
export function handlePowerupUsed(info: PowerupUsedInfo) {
  if (lobby.value === null) {
    throw new Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY'));
  }

  const match = lobby.value.game?.match;
  if (!match) return;

  if (info.type === 'reverse-card-strengths' && match.round) {
    match.round.reversed = true;
  }

  if (
    (info.type === 'increase-card-strength' || info.type === 'decrease-card-strength') &&
    info.targetPlayerId
  ) {
    match.pendingStrength = {
      ...(match.pendingStrength ?? {}),
      [info.targetPlayerId]: info.pendingStrengthTotal ?? 0
    };
  }
}
