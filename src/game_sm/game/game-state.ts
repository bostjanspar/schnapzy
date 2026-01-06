import { GameBaseState } from '../game-base-state.js';
import { GAME } from '../game-state.enum.js';
import type { Game } from '../../gamelogic/game.js';
import type { UIManager } from '../../ui/ui-manager.js';

import type { StateEnum } from '../../sm/state.enum.js';
import log from 'loglevel'

export class GameState extends GameBaseState {
  constructor(game: Game, ui: UIManager) {
    super(GAME as StateEnum, game, ui);
  }

  onEntry(): void {
    log.debug('Entering Game State');
  }

  onLeave(): void {
    // No cleanup needed
  }
}
