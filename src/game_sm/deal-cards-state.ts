/**
 * Deal cards state - animates dealing cards to players.
 * Transitions to DEAL_RESULT when DEAL_ANIM_COMPLETE event is received.
 *
 * Note: This would normally transition to a "playing cards" state where
 * the actual trick-taking gameplay happens. For now, we skip directly to
 * the deal result for demonstration.
 */

import { GameBaseState } from './game-base-state.js';
import { DEAL_CARDS, DEAL_RESULT } from './game-state.enum.js';
import type { SimpleEvent } from '../sm/types.js';
import type { SchnapsenGame } from '../gamelogic/schnapsen-game.js';
import type { UIManager } from '../ui/ui-manager.js';
import type { EventBus } from '../ui/event-bus.js';
import { GAME_EVENT_IDS } from '../events/index.js';
import type { StateEnum } from '../sm/state.enum.js';

export class DealCardsState extends GameBaseState {
  constructor(game: SchnapsenGame, ui: UIManager, eventBus: EventBus) {
    super(DEAL_CARDS as StateEnum, game, ui, eventBus);
  }

  onEntry(): void {
    // Get deal state from the game and show deal animation
    const currentDeal = this.game.getCurrentDeal();
    this.ui.dealCards(currentDeal);
  }

  onLeave(): void {
    // No cleanup needed
  }

  override onEvent(simpleEvent: SimpleEvent): boolean {
    if (this.isEvent(simpleEvent, GAME_EVENT_IDS.DEAL_ANIM_COMPLETE)) {
      // TODO: Would normally go to a "playing" state here
      // For now, skip directly to deal result
      this.transition(DEAL_RESULT as StateEnum);
      return true;
    }
    return false;
  }
}
