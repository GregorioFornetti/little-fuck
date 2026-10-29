import Lobby, { PowerupType } from '../../../interfaces/Lobby';
import { io } from '../../..';
import { createPlayer } from '../../functions/createPlayer';

/** Todos os tipos de poderes que existem no jogo. */
export const ALL_POWERUP_TYPES: PowerupType[] = [
  'swap-cards',
  'cancel-card',
  'reverse-card-strengths',
  'random-card',
  'hide-card-strength',
  'increase-card-strength',
  'decrease-card-strength',
  'peek-card',
  'shield'
];

/** Variação de força aplicada pelos poderes increase/decrease-card-strength. */
export const POWERUP_STRENGTH_DELTA = 5;

/**
 *  Envia para cada jogador os seus próprios poderes guardados e a quantidade
 *  de poderes de todos os jogadores da sala (evento `powerups-update`).
 *
 *  @param lobby informações da sala atual
 */
export function emitPowerupsUpdate(lobby: Lobby): void {
  if (lobby.players.length === 0) {
    return;
  }

  const counts: { [playerId: string]: number } = {};
  for (const lobbyPlayer of lobby.players) {
    counts[lobbyPlayer.id] = lobbyPlayer.powerups?.length ?? 0;
  }

  const byPlayerId: { [playerId: string]: { powerups: PowerupType[], counts: { [playerId: string]: number } } } = {};
  for (const lobbyPlayer of lobby.players) {
    byPlayerId[lobbyPlayer.id] = { powerups: [...(lobbyPlayer.powerups ?? [])], counts };
  }

  const player = createPlayer(io, lobby.players[0].id);
  player.eventsEmitter.Powerup.emitPowerupsUpdate(byPlayerId);
}

/**
 *  Dá poderes aleatórios (dos tipos ativados nas opções) para cada jogador da sala,
 *  caso seja o momento configurado: no início de cada partida (`match`) ou apenas
 *  no início do jogo (`game`). Poderes não usados acumulam entre partidas e podem
 *  se repetir para o mesmo jogador.
 *
 *  @param lobby informações da sala atual
 *  @param moment momento atual do jogo (início de partida ou de jogo)
 */
export function grantPowerupsIfNeeded(lobby: Lobby, moment: 'match' | 'game'): void {
  const config = lobby.options?.powerups;
  if (!config || config.enabled.length === 0 || config.grantTiming !== moment || config.perGrant <= 0) {
    return;
  }

  for (const lobbyPlayer of lobby.players) {
    const granted: PowerupType[] = [];
    for (let i = 0; i < config.perGrant; i++) {
      granted.push(config.enabled[Math.floor(Math.random() * config.enabled.length)]);
    }
    lobbyPlayer.powerups = [...(lobbyPlayer.powerups ?? []), ...granted];
  }

  emitPowerupsUpdate(lobby);
}
