/**
 * Shared type definitions for the state machine library.
 */

/**
 * Simple event structure for state machine communication.
 * Framework-agnostic - can be used with any event system.
 *
 * @template TType - The type of the event type identifier (string, number, or enum)
 * @template TData - The type of optional data payload
 */
export interface SimpleEvent<TType = string | number, TData = unknown> {
  /** The event type identifier */
  type: TType;
  /** Optional data payload associated with the event */
  data?: TData;
}

/**
 * Optional configuration for state machine behavior.
 */
export interface StateMachineOptions {
  /** Enable debug logging for state transitions and event handling */
  debug?: boolean;
  /** Enable event consumption logging */
  enableEventLogging?: boolean;
}

/**
 * Custom error class for state machine related errors.
 */
export class StateMachineError extends Error {
  public stateId: string | number | undefined;

  constructor(
    message: string,
    stateId?: string | number
  ) {
    super(message);
    this.name = 'StateMachineError';
    this.stateId = stateId;
  }
}

/**
 * Error thrown when a target state cannot be found in the hierarchy.
 */
export class StateNotFoundError extends StateMachineError {
  constructor(
    targetStateId: string | number,
    fromStateId: string | number
  ) {
    super(
      `Cannot transition from ${String(fromStateId)} to ${String(targetStateId)}: target not found in hierarchy`,
      targetStateId
    );
    this.name = 'StateNotFoundError';
  }
}
