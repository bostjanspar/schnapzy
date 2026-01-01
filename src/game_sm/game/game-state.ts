/**
 * Deal cards state - animates dealing cards to players.
 * Transitions to DEAL_RESULT when DEAL_ANIM_COMPLETE event is received.
 *
 * Note: This would normally transition to a "playing cards" state where
 * the actual trick-taking gameplay happens. For now, we skip directly to
 * the deal result for demonstration.
 */

import { GameBaseState } from '../game-base-state.js';
import { GAME } from '../game-state.enum.js';
import type { SchnapsenGame } from '../../gamelogic/schnapsen-game.js';
import type { UIManager } from '../../ui/ui-manager.js';

import type { StateEnum } from '../../sm/state.enum.js';

export class GameState extends GameBaseState {
  constructor(game: SchnapsenGame, ui: UIManager) {
    super(GAME as StateEnum, game, ui);
  }

  onEntry(): void {
    // Get deal state from the game a
  }

  onLeave(): void {
    // No cleanup needed
  }
}
