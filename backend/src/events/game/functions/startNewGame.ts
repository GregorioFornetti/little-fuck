
import Timer from 'easytimer.js';
import { startNewMatch } from '../../match/functions/startNewMatch';
import Lobby from '../../../interfaces/Lobby';
import { io } from '../../../index';
import { createPlayer } from '../../functions/createPlayer';

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
    playersHealth[player.id] = 3;
  }

  const timer = new Timer();
  timer.start({ countdown: true, startValues: { seconds: 5 } });
  timer.addEventListener('targetAchieved', () => {
    startNewMatch(lobby);
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

  const player = createPlayer(io, lobby.game.currentPlayerId);
  player.eventsEmitter.Game.emitStartGame();
}
