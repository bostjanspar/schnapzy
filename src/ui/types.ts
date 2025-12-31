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
 * Scene transition data.
 */
export interface SceneTransition {
  from: GameScene;
  to: GameScene;
  data?: unknown;
}
