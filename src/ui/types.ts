/**
 * Type definitions for the UI scene management system.
 */

/**
 * All available game scenes.
 */
export type GameScene =
  | 'LOADING'
  | 'START_MENU'
  | 'DEALER_SELECTION'
  | 'DEAL_CARDS'
  | 'DEAL_RESULT'
  | 'GAME_FINISHED';

/**
 * Game scene values.
 */
export const GameScene = {
  LOADING: 'LOADING' as const,
  START_MENU: 'START_MENU' as const,
  DEALER_SELECTION: 'DEALER_SELECTION' as const,
  DEAL_CARDS: 'DEAL_CARDS' as const,
  DEAL_RESULT: 'DEAL_RESULT' as const,
  GAME_FINISHED: 'GAME_FINISHED' as const,
} as const;

/**
 * Events that scenes emit to notify the State Machine of completion.
 */
export type GameEvent =
  | 'ASSET_LOADED'
  | 'START_CLICKED'
  | 'DEALER_ANIM_COMPLETE'
  | 'DEAL_ANIM_COMPLETE'
  | 'CONTINUE_CLICKED'
  | 'PLAY_AGAIN_CLICKED';

/**
 * Game event values.
 */
export const GameEvent = {
  // Loading scene events
  ASSET_LOADED: 'ASSET_LOADED' as const,

  // Start menu events
  START_CLICKED: 'START_CLICKED' as const,

  // Dealer selection events
  DEALER_ANIM_COMPLETE: 'DEALER_ANIM_COMPLETE' as const,

  // Deal cards events
  DEAL_ANIM_COMPLETE: 'DEAL_ANIM_COMPLETE' as const,

  // Deal result events
  CONTINUE_CLICKED: 'CONTINUE_CLICKED' as const,

  // Game finished events
  PLAY_AGAIN_CLICKED: 'PLAY_AGAIN_CLICKED' as const,
} as const;

/**
 * Scene transition data.
 */
export interface SceneTransition {
  from: GameScene;
  to: GameScene;
  data?: unknown;
}

/**
 * Event callback signature.
 */
export type EventCallback = (data?: unknown) => void;
