// Zone heights (percentage of screen)
export const LAYOUT = {
  TOP_ZONE: 0.25,
  MIDDLE_ZONE: 0.50,
  BOTTOM_ZONE: 0.25,
  H_MARGIN: 40,
  V_MARGIN: 30,
  CARD_SPACING: 130,
  DECK_STACK_OFFSET: 4,
  CARD_WIDTH: 100,
  CARD_HEIGHT: 140,
  HAND_Y_OFFSET: 200,
} as const;

// Perspective scale factors
export const SCALE = {
  CPU: 0.65,
  TALON: 0.75,
  TRICK: 0.85,
  PLAYER: 1.0,
  TRICK_PILE: 0.6,
} as const;

export type LayoutConfig = typeof LAYOUT;
export type ScaleConfig = typeof SCALE;
