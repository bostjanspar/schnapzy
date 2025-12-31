/**
 * Typed event interfaces extending the base SimpleEvent.
 * Provides type safety for events that carry structured data.
 */

import type { SimpleEvent } from '../sm/types.js';
import type { GameEventId } from './game-event-ids.js';

/**
 * Base game event type with typed ID.
 */
export interface GameEvent<TData = unknown> extends SimpleEvent<GameEventId, TData> {}

/**
 * Emitted when user clicks start in the start menu.
 * Data: { language: string } - selected language preference
 */
export interface StartClickedEvent extends GameEvent<{ language: string }> {
  type: 'START_CLICKED';
}

/**
 * Emitted when dealer selection animation completes.
 * Data: { dealerIndex: number } - index of elected dealer
 */
export interface DealerAnimCompleteEvent extends GameEvent<{ dealerIndex: number }> {
  type: 'DEALER_ANIM_COMPLETE';
}
