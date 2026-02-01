
import { GameBaseState } from '../../game-base-state.js';
import { PLAY_HAND } from '../../game-state.enum.js';
import type { StateEnum } from '../../../sm/state.enum.js';
import type { GameState } from '../game-state.js';

import log from 'loglevel'
import type { SimpleEvent } from '../../../sm/types.js';
import { GAME_EVENT_IDS } from '../../../events/game-event-ids.js';
import { PLAYER_HUMAN } from '../../../gamelogic/types.js';

export class PlayHandState extends GameBaseState {
  constructor(gameState: GameState) {
    super(PLAY_HAND as StateEnum, gameState.game, gameState.ui);
    gameState.addSubState(this);
  }

  onEntry(): void {
    log.debug('We are now in PLAY_HAND state');
    this.ui.startGameplay();
  }

  onLeave(): void {
    // No cleanup needed
  }

  private gamePlayReady() {
    const currentHand = this.game.getCurrentHand();
    if (!currentHand) {
      log.warn('No active hand in gamePlayReady');
      return;
    }

    const isHumanTurn = currentHand.turnPlayer === PLAYER_HUMAN;

    if (isHumanTurn) {
      log.debug('It is the human player\'s turn');
      // TODO: Enable human input, wait for player to play
    } else {
      log.debug('It is the CPU\'s turn');
      const hand =  this.game.getCurrentHand();
          const talon = hand?.getTalon();
          if (hand && talon){
            const card  = this.getParentCpuPlayer()?.decideMove(hand.cpuPlayCards(), null, talon.getState(), talon.getTrumpCard().suit, 7,7);
            if (card) {
              this.ui.cpuPlayCard(card);
            }
          } else {
              log.error('GameState: No current hand or talon found during CPU player initialization');
          }

      
      // TODO: Trigger CPU AI to play
    }
  }


  override onEvent(simpleEvent: SimpleEvent): boolean {
    if (this.isEvent(simpleEvent, GAME_EVENT_IDS.GAME_PLAY_READY)) {
        this.gamePlayReady();
      return true;
    }
    return false;
  }


}
