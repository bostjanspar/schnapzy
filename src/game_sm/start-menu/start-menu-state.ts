/**
 * Start menu state - shows the main menu with start button.
 * Transitions to DEALER_SELECTION when START_CLICKED event is received.
 */

import { GameBaseState } from '../game-base-state.js';
import { START_MENU, GAME } from '../game-state.enum.js';
import type { SimpleEvent } from '../../sm/types.js';
import type { SchnapsenGame } from '../../gamelogic/schnapsen-game.js';
import type { UIManager } from '../../ui/ui-manager.js';
import { GAME_EVENT_IDS } from '../../events/index.js';
import type { StateEnum } from '../../sm/state.enum.js';
import log from 'loglevel'

export class StartMenuState extends GameBaseState {
  constructor(game: SchnapsenGame, ui: UIManager) {
    super(START_MENU as StateEnum, game, ui);
  }

  onEntry(): void {
    // Show the start menu
    this.ui.showStartMenu();
    //temporary  move to next state
    setTimeout(() => {
          log.debug('move to GAME state');
          this.transition(GAME as StateEnum);
        }, 100);      
    
  }

  onLeave(): void {
    // No cleanup needed
  }

  override onEvent(simpleEvent: SimpleEvent): boolean {
    if (simpleEvent.type == GAME_EVENT_IDS.START_CLICKED) {            
      log.debug('Start button clicked, transitioning to Game State');
      this.transition(GAME as StateEnum);
      return true;
    }
    return false;
  }

}
