
import i18n from '../../../plugins/i18n';
import Timer from 'easytimer.js';
import { startNewMatch } from '../../match/functions/startNewMatch';
import Lobby from '../../../interfaces/Lobby';
import { io } from '../../../index';
import { createPlayer } from '../../functions/createPlayer';

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
