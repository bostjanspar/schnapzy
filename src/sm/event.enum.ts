/**
 * Event type definitions for the state machine library.
 * This file replaces the missing '../events/event.enum' dependency.
 */

import type { SimpleEvent } from './types.js';

/**
 * Standard event type constants.
 * Applications can define their own event types.
 */
export const START = 'START' as const;
export const STOP = 'STOP' as const;
export const PAUSE = 'PAUSE' as const;
export const RESUME = 'RESUME' as const;
export const TRANSITION = 'TRANSITION' as const;
export const ENTRY_COMPLETE = 'ENTRY_COMPLETE' as const;
export const LEAVE_COMPLETE = 'LEAVE_COMPLETE' as const;

/**
 * Union type of all library-defined event types.
 */
export type EventEnum =
  | typeof START
  | typeof STOP
  | typeof PAUSE
  | typeof RESUME
  | typeof TRANSITION
  | typeof ENTRY_COMPLETE
  | typeof LEAVE_COMPLETE;

/**
 * Type alias for event compatibility.
 * Applications can use string unions, const values, or numbers as event types.
 */
export type EventType = string | number;

/**
 * Base event interface.
 * Applications extend this for domain-specific events.
 */
export interface BaseEvent extends SimpleEvent<EventType> {}
