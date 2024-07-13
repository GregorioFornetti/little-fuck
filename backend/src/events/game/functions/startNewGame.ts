
import Player from '../../../interfaces/Player';
import i18n from '../../../plugins/i18n';
import Timer from 'easytimer.js';
import { startNewMatch } from '../../match/functions/startNewMatch';

/**
 *  Função que começa um jogo de "little-fuck". Essa função é responsável por:
 *  - Criar a versão inicial do objeto Game (de forma in-place, ou seja, modifica o objeto `player.lobby` diretamente)
 *  - Enviar mensagens para todos os jogadores que o jogo começou
 *  - Cadastrar um timer para o início de uma partida
 *
 *  OBS: pode lançar uma exceção caso o jogador não esteja em um lobby
 *
 *  @param player jogador que iniciou o jogo (líder)
 */
export function startNewGame(player: Player): void {
  const lobby = player.lobby;
  if (!lobby) {
    throw new Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY'));
  }

  const playersHealth: { [playerId: string]: number} = {};
  for (const player of lobby.players) {
    playersHealth[player.id] = 3;
  }

  const timer = new Timer();
  timer.start({ countdown: true, startValues: { seconds: 5 } });
  timer.addEventListener('targetAchieved', () => {
    startNewMatch(player);
  });

  lobby.game = {
    matchNumber: 1,
    roundNumber: 1,
    currentPlayerId: lobby.players[lobby.players.length - 1].id,
    status: 'starting_match',
    deadPlayersIds: [],
    numRounds: 1,
    playersHealth,
    timer,
  };

  player.eventsEmitter.Game.emitStartGame();
}
