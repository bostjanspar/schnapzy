import { GameBaseState } from '../../game-base-state.js';
import { GAME_FINISHED, START_MENU } from '../../game-state.enum.js';
import type { SimpleEvent } from '../../../sm/types.js';
import { GAME_EVENT_IDS } from '../../../events/index.js';
import { PLAYER_HUMAN, PLAYER_CPU } from '../../../gamelogic/types.js';
import type { StateEnum } from '../../../sm/state.enum.js';
import type { GameState } from '../game-state.js';

export class GameFinishedState extends GameBaseState {
  constructor(gameState: GameState) {
      super(GAME_FINISHED as StateEnum, gameState.game, gameState.ui);
      gameState.addSubState(this);
    }

  onEntry(): void {
    // Get final scores and show game finished screen
    const winner = this.game.getWinner();
    const winnerName = winner === PLAYER_HUMAN ? 'Player 1' : winner === PLAYER_CPU ? 'Player 2' : 'Nobody';
    const p1Points = this.game.getGamePoints(PLAYER_HUMAN);
    const p2Points = this.game.getGamePoints(PLAYER_CPU);
    const scores = `P1: ${p1Points} | P2: ${p2Points}`;

    this.ui.showGameFinished({
      winnerName,
      scores,
    });
  }

  onLeave(): void {
    // No cleanup needed
  }

  override onEvent(simpleEvent: SimpleEvent): boolean {
    if (this.isEvent(simpleEvent, GAME_EVENT_IDS.PLAY_AGAIN_CLICKED)) {
      // Reset the game for a new session
      // Note: Game doesn't have a reset method, so we create a new instance
      // The caller would need to handle this, or we could add a reset method
      // For now, we just transition back to the start menu
      this.transition(START_MENU as StateEnum);
      return true;
    }
    return false;
  }
}
