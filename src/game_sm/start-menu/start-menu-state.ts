/**
 * Start menu state - shows the main menu with start button.
 * Transitions to DEALER_SELECTION when START_CLICKED event is received.
 */

import { GameBaseState } from '../game-base-state.js';
import { START_MENU, DEALER_SELECTION } from '../game-state.enum.js';
import type { SimpleEvent } from '../../sm/types.js';
import type { SchnapsenGame } from '../../gamelogic/schnapsen-game.js';
import type { UIManager } from '../../ui/ui-manager.js';
import { GAME_EVENT_IDS } from '../../events/index.js';
import type { StateEnum } from '../../sm/state.enum.js';

export class StartMenuState extends GameBaseState {
  constructor(game: SchnapsenGame, ui: UIManager) {
    super(START_MENU as StateEnum, game, ui);
  }

  onEntry(): void {
    // Show the start menu
    this.ui.showStartMenu();
  }

  onLeave(): void {
    // No cleanup needed
  }

  override onEvent(simpleEvent: SimpleEvent): boolean {
    if (this.isEvent(simpleEvent, GAME_EVENT_IDS.START_CLICKED)) {
      // Start a new game
      this.game.startGame();
      this.transition(DEALER_SELECTION as StateEnum);
      return true;
    }
    return false;
  }
}
