import { GameBaseState } from '../../game-base-state.js';
import type { GameState } from '../game-state.js';
import { DEAL_CARDS, DEALER_SELECTION, PLAY_HAND } from '../../game-state.enum.js';
import type { StateEnum } from '../../../sm/state.enum.js';
import type { SimpleEvent } from '../../../sm/types.js';
import { GAME_EVENT_IDS } from '../../../events/game-event-ids.js';
import log from 'loglevel'

export class DealerSelectionState extends GameBaseState {
  constructor(gameState: GameState) {
      super(DEALER_SELECTION as StateEnum, gameState.game, gameState.ui);
      gameState.addSubState(this);
    }

  onEntry(): void {
    log.debug('Entering DealerSelectionState');
    //create simple timer call

    //temporary  move to next state
    setTimeout(() => {
      log.debug('move to PLAY_HAND state');
      this.transition(PLAY_HAND as StateEnum);
    }, 100);
  }

  onLeave(): void {
    // No cleanup needed
  }

  override onEvent(simpleEvent: SimpleEvent): boolean {
    if (this.isEvent(simpleEvent, GAME_EVENT_IDS.DEALER_ANIM_COMPLETE)) {
      // Start a new hand (deal)
      this.game.startNewHand();
      this.transition(DEAL_CARDS as StateEnum);
      return true;
    }
    return false;
  }
}
