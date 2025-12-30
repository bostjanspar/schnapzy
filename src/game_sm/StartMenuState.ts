/**
 * Start menu state - shows the main menu with start button.
 * Transitions to DEALER_SELECTION when START_CLICKED event is received.
 */

import { GameBaseState } from './GameBaseState.js';
import { START_MENU, DEALER_SELECTION } from './game-state.enum.js';
import type { SimpleEvent } from '../sm/types.js';
import type { SchnapsenGame } from '../gamelogic/SchnapsenGame.js';
import type { UIManager } from '../ui/UIManager.js';
import type { EventBus } from '../ui/EventBus.js';
import { GameEvent } from '../ui/types.js';
import type { StateEnum } from '../sm/state.enum.js';

export class StartMenuState extends GameBaseState {
  constructor(game: SchnapsenGame, ui: UIManager, eventBus: EventBus) {
    super(START_MENU as StateEnum, game, ui, eventBus);
  }

  onEntry(): void {
    // Show the start menu
    this.ui.showStartMenu();
  }

  onLeave(): void {
    // No cleanup needed
  }

  override onEvent(simpleEvent: SimpleEvent): boolean {
    if (this.isEvent(simpleEvent, GameEvent.START_CLICKED)) {
      // Start a new game
      this.game.startGame();
      this.transition(DEALER_SELECTION as StateEnum);
      return true;
    }
    return false;
  }
}
