/**
 * Dealer selection state - animates the dealer election process.
 * Transitions to DEAL_CARDS when DEALER_ANIM_COMPLETE event is received.
 */

import { GameBaseState } from './game-base-state.js';
import { DEALER_SELECTION, DEAL_CARDS } from './game-state.enum.js';
import type { SimpleEvent } from '../sm/types.js';
import type { SchnapsenGame } from '../gamelogic/schnapsen-game.js';
import type { UIManager } from '../ui/ui-manager.js';
import type { EventBus } from '../ui/event-bus.js';
import { GAME_EVENT_IDS } from '../events/index.js';
import { PLAYER_ONE, PLAYER_TWO } from '../gamelogic/types.js';
import type { StateEnum } from '../sm/state.enum.js';

export class DealerSelectionState extends GameBaseState {
  constructor(game: SchnapsenGame, ui: UIManager, eventBus: EventBus) {
    super(DEALER_SELECTION as StateEnum, game, ui, eventBus);
  }

  onEntry(): void {
    // Get player information and start dealer selection
    const players = [
      { id: PLAYER_ONE, name: 'Player 1' },
      { id: PLAYER_TWO, name: 'Player 2' },
    ];
    this.ui.startDealerSelection({ players });
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
