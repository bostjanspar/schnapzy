
import { GameBaseState } from '../../game-base-state.js';
import { PLAY_HAND } from '../../game-state.enum.js';
import type { StateEnum } from '../../../sm/state.enum.js';
import type { GameState } from '../game-state.js';
import { GameStateReader } from '../../../ui/game-state-reader.js';
import type { Card } from '../../../gamelogic/types.js';

import log from 'loglevel'

export class PlayHandState extends GameBaseState {
  constructor(gameState: GameState) {
      super(PLAY_HAND as StateEnum, gameState.game, gameState.ui);
      gameState.addSubState(this);
  }

  onEntry(): void {
    log.debug('We are now in PLAY_HAND state');
    const stateReader = new GameStateReader(this.game);
    
    this.ui.startGameplay(stateReader, (card: Card) => {
      log.info(`Card played: ${card.suit} ${card.rank}`);
      // TODO: Pass event to state machine
    });
  }

  onLeave(): void {
    // No cleanup needed
  }
}
