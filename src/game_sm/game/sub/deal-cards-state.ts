import { GameBaseState } from '../../game-base-state.js';
import { DEAL_CARDS, PLAY_HAND } from '../../game-state.enum.js';
import type { SimpleEvent } from '../../../sm/types.js';
import { GAME_EVENT_IDS } from '../../../events/index.js';
import type { StateEnum } from '../../../sm/state.enum.js';
import type { GameState } from '../game-state.js';
import log from 'loglevel'

export class DealCardsState extends GameBaseState {
  constructor(gameState: GameState) {
    super(DEAL_CARDS as StateEnum, gameState.game, gameState.ui);
    gameState.addSubState(this);
  }

  onEntry(): void {
     log.debug('GameState:DealCardsState starting deal animation');
    this.ui.showDealAnimation();
  }

  onLeave(): void {
    // No cleanup needed
  }

  override onEvent(simpleEvent: SimpleEvent): boolean {
    if (this.isEvent(simpleEvent, GAME_EVENT_IDS.DEAL_ANIM_COMPLETE)) {
      // TODO: Would normally go to a "playing" state here
      // For now, skip directly to deal result
      this.transition(PLAY_HAND as StateEnum);
      return true;
    }
    return false;
  }
}
