import { StateMachine } from './state-machine.js';
import type { SimpleEvent } from './types.js';

export class StateMachineManager {
  private stateMachines: StateMachine[] = [];
  private debug: boolean;

  constructor(debug: boolean = false) {
    this.debug = debug;
  }

  public registerStateMachine(sm: StateMachine): void {
    if (this.stateMachines.includes(sm)) {
      console.warn('State machine has already been registered.');
      return;
    }
    this.stateMachines.push(sm);
    // Sort by priority descending (higher priority first)
    this.stateMachines.sort((a, b) => b.priority - a.priority);
  }

  public deregisterStateMachine(sm: StateMachine): void {
    const index = this.stateMachines.indexOf(sm);
    if (index > -1) {
      this.stateMachines.splice(index, 1);
    }
  }

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

  public startAll(): void {
    for (const sm of this.stateMachines) {
      sm.start();
    }
  }

  public setDebug(debug: boolean): void {
    this.debug = debug;
  }
}
