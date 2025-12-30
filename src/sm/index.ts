/**
 * Hierarchical State Machine Library
 *
 * A framework-agnostic library for implementing hierarchical state machines
 * with support for event handling, state transitions, and priority-based
 * state machine management.
 *
 * @example
 * ```typescript
 * import { BaseState, StateMachine, StateMachineManager, StateEnum } from '@/sm';
 *
 * // Define your state enum
 * enum MyStates {
 *   ROOT = StateEnum.ROOT,
 *   STATE_A = 100,
 *   STATE_B = 200,
 * }
 *
 * // Create a state class
 * class MyState extends BaseState {
 *   onEntry() { console.log('Entered state'); }
 *   onLeave() { console.log('Left state'); }
 * }
 * ```
 */

// Core classes
export { BaseState } from './base-state.js';
export { StateMachine, RootState } from './state-machine.js';
export { StateMachineManager } from './state-machine-manager.js';

// State constants and types
export { ROOT, INITIAL } from './state.enum.js';
export {
  UNIT_TEST_STATE_A,
  UNIT_TEST_STATE_B,
  UNIT_TEST_STATE_C,
  UNIT_TEST_PARENT,
  UNIT_TEST_CHILD_A,
  UNIT_TEST_CHILD_B,
  UNIT_TEST_GRANDCHILD,
} from './state.enum.js';
export type { StateEnum } from './state.enum.js';

// Event constants and types
export { START, STOP, PAUSE, RESUME, TRANSITION, ENTRY_COMPLETE, LEAVE_COMPLETE } from './event.enum.js';
export type { EventEnum, BaseEvent, EventType } from './event.enum.js';

// Types
export type { SimpleEvent, StateMachineOptions, StateMachineError, StateNotFoundError } from './types.js';
