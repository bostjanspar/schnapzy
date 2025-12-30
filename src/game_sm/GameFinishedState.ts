/**
 * Game finished state - shows the overall winner and final scores.
 * Transitions back to START_MENU when PLAY_AGAIN_CLICKED event is received.
 */

import { GameBaseState } from './GameBaseState.js';
import { GAME_FINISHED, START_MENU } from './game-state.enum.js';
import type { SimpleEvent } from '../sm/types.js';
import type { SchnapsenGame } from '../gamelogic/SchnapsenGame.js';
import type { UIManager } from '../ui/UIManager.js';
import type { EventBus } from '../ui/EventBus.js';
import { GameEvent } from '../ui/types.js';
import { PLAYER_ONE, PLAYER_TWO } from '../gamelogic/types.js';
import type { StateEnum } from '../sm/state.enum.js';

export class GameFinishedState extends GameBaseState {
  constructor(game: SchnapsenGame, ui: UIManager, eventBus: EventBus) {
    super(GAME_FINISHED as StateEnum, game, ui, eventBus);
  }

  onEntry(): void {
    // Get final scores and show game finished screen
    const winner = this.game.getWinner();
    const winnerName = winner === PLAYER_ONE ? 'Player 1' : winner === PLAYER_TWO ? 'Player 2' : 'Nobody';
    const p1Points = this.game.getGamePoints(PLAYER_ONE);
    const p2Points = this.game.getGamePoints(PLAYER_TWO);
    const scores = `P1: ${p1Points} | P2: ${p2Points}`;

    this.ui.showGameFinished({
      winnerName,
      scores,
    });
  }

  onLeave(): void {
    // No cleanup needed
  }

  override onEvent(simpleEvent: SimpleEvent): boolean {
    if (this.isEvent(simpleEvent, GameEvent.PLAY_AGAIN_CLICKED)) {
      // Reset the game for a new session
      // Note: SchnapsenGame doesn't have a reset method, so we create a new instance
      // The caller would need to handle this, or we could add a reset method
      // For now, we just transition back to the start menu
      this.transition(START_MENU as StateEnum);
      return true;
    }
    return false;
  }
}
