/**
 * Schnapsen Game Logic Library
 *
 * A three-layer architecture for implementing the Schnapsen card game.
 *
 * Layer 1: SchnapsenGame - Overall game manager (game points, dealer, phases)
 * Layer 2: Deal - Card/deck manager (hands, talon, marriages, trump exchange)
 * Layer 3: Trick - Current trick manager (lead, follow, winner, points)
 *
 * @example
 * ```typescript
 * import { SchnapsenGame, PLAYER_ONE } from '@/gamelogic';
 *
 * const game = new SchnapsenGame();
 * game.startGame();
 *
 * // Play cards through the main facade
 * game.playCard(PLAYER_ONE, { suit: HEARTS, rank: ACE });
 * ```
 */

// Main game class
export { SchnapsenGame } from './schnapsen-game.js';

// Layer classes
export { Deal } from './deal.js';
export { Trick } from './trick.js';

// Type constants
export {
  CLUBS,
  DIAMONDS,
  HEARTS,
  SPADES,
} from './types.js';

export {
  JACK,
  QUEEN,
  KING,
  TEN,
  ACE,
} from './types.js';

export {
  PLAYER_ONE,
  PLAYER_TWO,
} from './types.js';

export {
  NOT_STARTED,
  IN_PROGRESS,
  HAND_COMPLETE,
  GAME_OVER,
} from './types.js';

export {
  TALON_OPEN,
  TALON_CLOSED,
  TALON_EXHAUSTED,
} from './types.js';

// Types
export type { Card, Suit, Rank } from './types.js';
export type { Player } from './types.js';
export type { GamePhase } from './types.js';
export type { TalonState } from './types.js';
export type { TrickResult, HandResult } from './types.js';

// Utility functions
export { getCardValue, getOpponent } from './types.js';
