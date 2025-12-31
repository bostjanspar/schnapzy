/**
 * Loading state - handles initial asset loading.
 * Transitions to START_MENU when ASSET_LOADED event is received.
 */

import { GameBaseState } from '../game-base-state.js';
import { LOADING, START_MENU } from '../game-state.enum.js';
import type { SimpleEvent } from '../../sm/types.js';
import type { SchnapsenGame } from '../../gamelogic/schnapsen-game.js';
import type { UIManager } from '../../ui/ui-manager.js';
import type { EventBus } from '../../ui/event-bus.js';
import { GAME_EVENT_IDS } from '../../events/index.js';
import type { StateEnum } from '../../sm/state.enum.js';

export class LoadingState extends GameBaseState {
  constructor(game: SchnapsenGame, ui: UIManager, eventBus: EventBus) {
    super(LOADING as StateEnum, game, ui, eventBus);
  }

  onEntry(): void {
    // Show the loading screen
    this.ui.showLoadingScreen();
  }

  onLeave(): void {
    // No cleanup needed
  }

  override onEvent(simpleEvent: SimpleEvent): boolean {
    if (this.isEvent(simpleEvent, GAME_EVENT_IDS.ASSET_LOADED)) {
      this.transition(START_MENU as StateEnum);
      return true;
    }
    return false;
  }
}
