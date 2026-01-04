import { GameBaseState } from '../game-base-state.js';
import { LOADING, START_MENU } from '../game-state.enum.js';
import type { SimpleEvent } from '../../sm/types.js';
import type { SchnapsenGame } from '../../gamelogic/schnapsen-game.js';
import type { UIManager } from '../../ui/ui-manager.js';
import { GAME_EVENT_IDS } from '../../events/index.js';
import type { StateEnum } from '../../sm/state.enum.js';
import log from 'loglevel'

export class LoadingState extends GameBaseState {
  constructor(game: SchnapsenGame, ui: UIManager) {
    super(LOADING as StateEnum, game, ui);
  }

  onEntry(): void {
    // Show the loading screen
    this.ui.showLoadingScreen();
  }

  onLeave(): void {
    // No cleanup needed
  }

  override onEvent(simpleEvent: SimpleEvent): boolean {
    log.debug(`LoadingState: Received event ${simpleEvent.type}`);

    if (simpleEvent.type === GAME_EVENT_IDS.ASSET_LOADED) {
      this.transition(START_MENU as StateEnum);
      return true;
    }
    return false;
  }
}
