/**
 * Game state identifiers for the Schnapsen game state machine.
 * These use number values to be compatible with the StateEnum type.
 */

/**
 * Loading state - initial asset loading.
 */
export const LOADING = 100;

/**
 * Start menu state - main menu with start button.
 */
export const START_MENU = 101;

/**
 * Dealer selection state - animating dealer election.
 */
export const DEALER_SELECTION = 102;

/**
 * Deal cards state - animating card dealing.
 */
export const DEAL_CARDS = 103;

/**
 * Deal result state - showing deal winner and points.
 */
export const DEAL_RESULT = 104;

/**
 * Game finished state - showing overall winner and final scores.
 */
export const GAME_FINISHED = 105;

/**
 * Union type of all game state identifiers.
 */
export type GameStateEnum =
  | typeof LOADING
  | typeof START_MENU
  | typeof DEALER_SELECTION
  | typeof DEAL_CARDS
  | typeof DEAL_RESULT
  | typeof GAME_FINISHED;
