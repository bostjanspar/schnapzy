/**
 * Manages multiple state machines with priority-based event handling.
 *
 * Events are distributed to state machines in priority order (highest first).
 * The first state machine to consume an event stops further propagation.
 */

import { StateMachine } from './state-machine.js';
import type { SimpleEvent } from './types.js';

/**
 * Manages multiple state machines and distributes events to them.
 */
export class StateMachineManager {
  private stateMachines: StateMachine[] = [];
  private debug: boolean;

  constructor(debug: boolean = false) {
    this.debug = debug;
  }

  /**
   * Registers a state machine with this manager.
   * State machines are sorted by priority (highest first).
   */
  public registerStateMachine(sm: StateMachine): void {
    if (this.stateMachines.includes(sm)) {
      console.warn('State machine has already been registered.');
      return;
    }
    this.stateMachines.push(sm);
    // Sort by priority descending (higher priority first)
    this.stateMachines.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Removes a state machine from this manager.
   */
  public deregisterStateMachine(sm: StateMachine): void {
    const index = this.stateMachines.indexOf(sm);
    if (index > -1) {
      this.stateMachines.splice(index, 1);
    }
  }

  /**
   * Distributes an event to all registered state machines in priority order.
   * FIX for Issue 4: Uses simpleEvent.type instead of undefined 'event' variable.
   * FIX for Issue 5: Added debug mode for event consumption logging.
   */
  public onEvent(simpleEvent: SimpleEvent): void {
    for (const sm of this.stateMachines) {
      if (sm.onEvent(simpleEvent)) {
        // FIX for Issue 5: Debug logging for event consumption
        if (this.debug) {
          console.log(
            `Event ${String(simpleEvent.type)} handled by state machine (priority: ${sm.priority})`
          );
        }
        return; // Event consumed, stop propagation
      }
    }

    // FIX for Issue 4: Changed from undefined 'event' to 'simpleEvent.type'
    const message = `Event ${String(simpleEvent.type)} was not handled by any state machine.`;
    if (this.debug) {
      console.warn(message);
    }
  }

  /**
   * Starts all registered state machines.
   */
  public startAll(): void {
    for (const sm of this.stateMachines) {
      sm.start();
    }
  }

  /**
   * Enables or disables debug mode.
   */
  public setDebug(debug: boolean): void {
    this.debug = debug;
  }
}
