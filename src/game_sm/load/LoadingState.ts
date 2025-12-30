/**
 * Loading state - handles initial asset loading.
 * Transitions to START_MENU when ASSET_LOADED event is received.
 */

import { GameBaseState } from './GameBaseState.js';
import { LOADING, START_MENU } from './game-state.enum.js';
import type { SimpleEvent } from '../sm/types.js';
import type { SchnapsenGame } from '../gamelogic/SchnapsenGame.js';
import type { UIManager } from '../ui/UIManager.js';
import type { EventBus } from '../ui/EventBus.js';
import { GameEvent } from '../ui/types.js';
import type { StateEnum } from '../sm/state.enum.js';

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
    if (this.isEvent(simpleEvent, GameEvent.ASSET_LOADED)) {
      this.transition(START_MENU as StateEnum);
      return true;
    }
    return false;
  }
}
