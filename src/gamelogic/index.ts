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
