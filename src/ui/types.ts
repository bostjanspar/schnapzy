export type GameScene =
  | 'LOADING'
  | 'START_MENU'
  | 'DEALER_SELECTION'
  | 'DEAL_ANIMATION'
  | 'GAMEPLAY'
  | 'DEAL_RESULT'
  | 'GAME_FINISHED';

export const GameScene = {
  LOADING: 'LOADING' as const,
  START_MENU: 'START_MENU' as const,
  DEALER_SELECTION: 'DEALER_SELECTION' as const,
  DEAL_ANIMATION: 'DEAL_ANIMATION' as const,
  GAMEPLAY: 'GAMEPLAY' as const,
  DEAL_RESULT: 'DEAL_RESULT' as const,
  GAME_FINISHED: 'GAME_FINISHED' as const,
} as const;

export interface SceneTransition {
  from: GameScene;
  to: GameScene;
  data?: unknown;
}