
import Timer from 'easytimer.js';
import { startNewMatch } from '../../match/functions/startNewMatch';
import { grantPowerupsIfNeeded } from '../../powerup/functions/grantPowerups';
import Lobby from '../../../interfaces/Lobby';
import { io } from '../../../index';
import { createPlayer } from '../../functions/createPlayer';
import { DEFAULT_GAME_OPTIONS } from '../../../global';

/**
 *  Função que começa um jogo de "little-fuck". Essa função é responsável por:
 *  - Criar a versão inicial do objeto Game no Lobby atual
 *  - Enviar mensagens para todos os jogadores que o jogo começou
 *  - Cadastrar um timer para o início de uma partida
 *
 *  @param lobby informações do lobby atual
 */
export function startNewGame(lobby: Lobby): void {

  const playersHealth: { [playerId: string]: number} = {};
  for (const player of lobby.players) {
    playersHealth[player.id] = lobby.options?.initialHealth ?? DEFAULT_GAME_OPTIONS.initialHealth;
  }

  const timer = new Timer();
  timer.start({ countdown: true, startValues: { seconds: 5 } });
  timer.addEventListener('targetAchieved', () => {
    grantPowerupsIfNeeded(lobby, 'game');
  startNewMatch(lobby);
  });

  lobby.game = {
    matchNumber: 1,
    roundNumber: 1,
    currentPlayerId: lobby.players[lobby.players.length - 1].id,
    status: 'starting_match',
    deadPlayersIds: [],
    // Comeca em 0 para que a primeira partida tenha 1 carta (partida especial), a segunda 2, e assim por diante
    numRounds: 0,
    playersHealth,
    timer,
  };

  const player = createPlayer(io, lobby.game.currentPlayerId);
  player.eventsEmitter.Game.emitStartGame();
}
