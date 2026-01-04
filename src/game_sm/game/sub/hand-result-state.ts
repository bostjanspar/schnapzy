import { GameBaseState } from '../../game-base-state.js';
import { HAND_RESULT, GAME_FINISHED, DEALER_SELECTION } from '../../game-state.enum.js';
import type { SimpleEvent } from '../../../sm/types.js';import { GAME_EVENT_IDS } from '../../../events/index.js';
import type { StateEnum } from '../../../sm/state.enum.js';
import type { GameState } from '../game-state.js';

export class HandResultState extends GameBaseState {
  constructor(gameState: GameState) {
      super(HAND_RESULT as StateEnum, gameState.game, gameState.ui);
      gameState.addSubState(this);
  }

  onEntry(): void {
    //
  }

  onLeave(): void {
    // No cleanup needed
  }

  override onEvent(simpleEvent: SimpleEvent): boolean {
    if (this.isEvent(simpleEvent, GAME_EVENT_IDS.CONTINUE_CLICKED)) {
      // Check if the game is over
      if (this.game.isGameOver()) {
        this.safeParentTransition(GAME_FINISHED as StateEnum);
      } else {
        // Start a new hand
        this.game.startNewHand();
        this.safeParentTransition(DEALER_SELECTION as StateEnum);
      }
      return true;
    }
    return false;
  }


}
