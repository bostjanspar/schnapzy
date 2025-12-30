/**
 * Deal result state - shows the winner of the current deal and points awarded.
 * Transitions to GAME_FINISHED or DEALER_SELECTION based on game state.
 */

import { GameBaseState } from './GameBaseState.js';
import { DEAL_RESULT, GAME_FINISHED, DEALER_SELECTION } from './game-state.enum.js';
import type { SimpleEvent } from '../sm/types.js';
import type { SchnapsenGame } from '../gamelogic/SchnapsenGame.js';
import type { UIManager } from '../ui/UIManager.js';
import type { EventBus } from '../ui/EventBus.js';
import { GameEvent } from '../ui/types.js';
import type { StateEnum } from '../sm/state.enum.js';

export class DealResultState extends GameBaseState {
  constructor(game: SchnapsenGame, ui: UIManager, eventBus: EventBus) {
    super(DEAL_RESULT as StateEnum, game, ui, eventBus);
  }

  onEntry(): void {
    // Determine deal winner and show result
    // For demonstration, we'll randomly assign a winner
    // In a real implementation, this would come from the game logic
    const winnerName = Math.random() > 0.5 ? 'Player 1' : 'Player 2';
    const pointsWon = Math.floor(Math.random() * 3) + 1; // 1-3 points

    this.ui.showDealResult({
      winnerName,
      points: pointsWon,
    });
  }

  onLeave(): void {
    // No cleanup needed
  }

  override onEvent(simpleEvent: SimpleEvent): boolean {
    if (this.isEvent(simpleEvent, GameEvent.CONTINUE_CLICKED)) {
      // Check if the game is over
      if (this.game.isGameOver()) {
        this.transition(GAME_FINISHED as StateEnum);
      } else {
        // Start a new hand
        this.game.startNewHand();
        this.transition(DEALER_SELECTION as StateEnum);
      }
      return true;
    }
    return false;
  }
}
