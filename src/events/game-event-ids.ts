/**
 * Centralized event ID constants for all game events.
 * Shared between UI layer (scenes emit) and State Machine layer (states consume).
 */

/**
 * Event ID string constants.
 */
export const GAME_EVENT_IDS = {
  ASSET_LOADED: 'ASSET_LOADED',
  START_CLICKED: 'START_CLICKED',
  DEALER_ANIM_COMPLETE: 'DEALER_ANIM_COMPLETE',
  DEAL_ANIM_COMPLETE: 'DEAL_ANIM_COMPLETE',
  CONTINUE_CLICKED: 'CONTINUE_CLICKED',
  PLAY_AGAIN_CLICKED: 'PLAY_AGAIN_CLICKED',
} as const;

/**
 * Union type of all game event IDs.
 */
export type GameEventId = (typeof GAME_EVENT_IDS)[keyof typeof GAME_EVENT_IDS];