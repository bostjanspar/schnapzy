import { GameBaseState } from '../game-base-state.js';
import { GAME } from '../game-state.enum.js';
import type { Game } from '../../gamelogic/game.js';
import type { UIManager } from '../../ui/ui-manager.js';

import type { StateEnum } from '../../sm/state.enum.js';
import log from 'loglevel'
import { CPUPlayer } from '../../gamelogic/cpu/cpu-player.js';

export class GameState extends GameBaseState {
   cpuPlayer: CPUPlayer = new CPUPlayer(); 
   

  constructor(game: Game, ui: UIManager) {
    super(GAME as StateEnum, game, ui);
  }

  

  onEntry(): void {
    log.debug('GameState:Entering Game State');
    this.game.startGame();
    this.cpuPlayer = new CPUPlayer();
  }

  onLeave(): void {
    // No cleanup needed
  }

  public getCpuPlayer():CPUPlayer {
    return this.cpuPlayer;
  }
}
