import type { SimpleEvent } from './types.js';

export const START = 'START' as const;
export const STOP = 'STOP' as const;
export const PAUSE = 'PAUSE' as const;
export const RESUME = 'RESUME' as const;
export const TRANSITION = 'TRANSITION' as const;
export const ENTRY_COMPLETE = 'ENTRY_COMPLETE' as const;
export const LEAVE_COMPLETE = 'LEAVE_COMPLETE' as const;

export type EventEnum =
  | typeof START
  | typeof STOP
  | typeof PAUSE
  | typeof RESUME
  | typeof TRANSITION
  | typeof ENTRY_COMPLETE
  | typeof LEAVE_COMPLETE;

export type EventType = string | number;

export interface BaseEvent extends SimpleEvent<EventType> {}
