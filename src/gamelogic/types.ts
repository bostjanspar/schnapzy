// ============================================================================
// Card Types
// ============================================================================

export const CLUBS = 'CLUBS' as const;
export const DIAMONDS = 'DIAMONDS' as const;
export const HEARTS = 'HEARTS' as const;
export const SPADES = 'SPADES' as const;

export type Suit =
  | typeof CLUBS
  | typeof DIAMONDS
  | typeof HEARTS
  | typeof SPADES;

export const JACK = 'JACK' as const;
export const QUEEN = 'QUEEN' as const;
export const KING = 'KING' as const;
export const TEN = 'TEN' as const;
export const ACE = 'ACE' as const;

export type Rank =
  | typeof JACK
  | typeof QUEEN
  | typeof KING
  | typeof TEN
  | typeof ACE;

export const RANK_VALUES: Readonly<Record<Rank, number>> = {
  [JACK]: 2,
  [QUEEN]: 3,
  [KING]: 4,
  [TEN]: 10,
  [ACE]: 11,
} as const;

export interface Card {
  suit: Suit;
  rank: Rank;
}

// ============================================================================
// Player Types
// ============================================================================

export const PLAYER_ONE = 'PLAYER_ONE' as const;
export const PLAYER_TWO = 'PLAYER_TWO' as const;

export type Player =
  | typeof PLAYER_ONE
  | typeof PLAYER_TWO;

export function getOpponent(player: Player): Player {
  return player === PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE;
}

// ============================================================================
// Game State Enums
// ============================================================================

export const NOT_STARTED = 'NOT_STARTED' as const;
export const IN_PROGRESS = 'IN_PROGRESS' as const;
export const HAND_COMPLETE = 'HAND_COMPLETE' as const;
export const GAME_OVER = 'GAME_OVER' as const;

export type GamePhase =
  | typeof NOT_STARTED
  | typeof IN_PROGRESS
  | typeof HAND_COMPLETE
  | typeof GAME_OVER;

export const TALON_OPEN = 'TALON_OPEN' as const;
export const TALON_CLOSED = 'TALON_CLOSED' as const;
export const TALON_EXHAUSTED = 'TALON_EXHAUSTED' as const;

export type TalonState =
  | typeof TALON_OPEN
  | typeof TALON_CLOSED
  | typeof TALON_EXHAUSTED;

// ============================================================================
// Result Types
// ============================================================================

export interface TrickResult {
  winner: Player;
  points: number;
}

export interface HandResult {
  winner: Player;
  pointsWon: number;  // 1, 2, or 3 game points
  opponentPoints: number;  // Card points opponent had
  opponentTricks: number;  // Number of tricks opponent won
}
