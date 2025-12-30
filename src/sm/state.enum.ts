/**
 * Core state identifiers for the state machine library.
 *
 * Applications should create their own state values extending these:
 *
 * ```typescript
 * const GAME_START = 100;
 * const PLAYING = 101;
 *
 * // Or use strings:
 * const GAME_START = 'GAME_START' as const;
 * type GameState = number | typeof GAME_START | typeof PLAYING;
 * ```
 */

/**
 * Root state - always present in any state machine.
 */
export const ROOT = 0;

/**
 * Placeholder for application-defined starting state.
 */
export const INITIAL = 1;

// Test states (for unit testing the state machine library)
export const UNIT_TEST_STATE_A = 100;
export const UNIT_TEST_STATE_B = 101;
export const UNIT_TEST_STATE_C = 102;
export const UNIT_TEST_PARENT = 200;
export const UNIT_TEST_CHILD_A = 201;
export const UNIT_TEST_CHILD_B = 202;
export const UNIT_TEST_GRANDCHILD = 300;

/**
 * Union type of all library-defined state identifiers.
 * Applications can extend this with their own state types.
 */
export type StateEnum =
  | typeof ROOT
  | typeof INITIAL
  | typeof UNIT_TEST_STATE_A
  | typeof UNIT_TEST_STATE_B
  | typeof UNIT_TEST_STATE_C
  | typeof UNIT_TEST_PARENT
  | typeof UNIT_TEST_CHILD_A
  | typeof UNIT_TEST_CHILD_B
  | typeof UNIT_TEST_GRANDCHILD;
