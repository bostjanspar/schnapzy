/**
 * Game State Machine for Schnapsen
 *
 * A state machine that bridges the UI layer (scenes) and game logic layer (SchnapsenGame).
 * The state machine listens to UI events via EventBus and controls scenes via UIManager.
 *
 * @example
 * ```typescript
 * import { SchnapsenGame } from './gamelogic/index.js';
 * import { UIManager } from './ui/index.js';
 * import { createGameStateMachine } from './game_sm/index.js';
 *
 * const uiManager = new UIManager(app);
 * await uiManager.initialize();
 *
 * const game = new SchnapsenGame();
 * const gameStateMachine = createGameStateMachine(game, uiManager, uiManager.getEventBus());
 *
 * // Connect EventBus to StateMachine
 * uiManager.getEventBus().on((event, data) => {
 *   gameStateMachine.onEvent({ type: event, data });
 * });
 *
 * gameStateMachine.start();
 * ```
 */

// State identifiers
export {
  LOADING,
  START_MENU,
  DEALER_SELECTION,
  DEAL_CARDS,
  DEAL_RESULT,
  GAME_FINISHED,
} from './game-state.enum.js';
export type { GameStateEnum } from './game-state.enum.js';

// Base class
export { GameBaseState } from './game-base-state.js';

// State implementations
export { LoadingState } from './load/loading-state.js';
export { StartMenuState } from './start-menu-state.js';
export { DealerSelectionState } from './dealer-selection-state.js';
export { DealCardsState } from './deal-cards-state.js';
export { DealResultState } from './deal-result-state.js';
export { GameFinishedState } from './game-finished-state.js';

// Factory function
export { createGameStateMachine } from './game-state-machine.js';
