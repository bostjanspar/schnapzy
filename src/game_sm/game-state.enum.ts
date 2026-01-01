
export const LOADING = 100;
export const START_MENU = 101;
export const GAME = 201;
export const DEALER_SELECTION = 202;
export const DEAL_CARDS = 203;
export const PLAY_HAND = 301;
export const HAND_RESULT = 204;
export const GAME_FINISHED = 105;

export type GameStateEnum =
  | typeof LOADING
  | typeof START_MENU
  | typeof GAME
  | typeof DEALER_SELECTION
  | typeof DEAL_CARDS
  | typeof PLAY_HAND
  | typeof HAND_RESULT
  | typeof GAME_FINISHED;
