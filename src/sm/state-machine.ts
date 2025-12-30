/**
 * Core state machine implementation with hierarchical state support.
 */

import { BaseState } from './base-state.js';
import { ROOT } from './state.enum.js';
import type { SimpleEvent } from './types.js';

/**
 * The root state of a state machine.
 * All top-level states are children of this root.
 */
export class RootState extends BaseState {
  constructor() {
    super(ROOT);
  }

  onEntry(): void {
    // Root state has no entry behavior
  }

  onLeave(): void {
    // Root state has no exit behavior
  }

  /**
   * Initialize the state machine by entering the first child state.
   */
  public start(): void {
    if (this.children.length === 0) {
      throw new Error('Root state must have at least one child state before starting.');
    }
    const startState = this.children.at(0);
    if (!startState) {
      throw new Error('First child state not found.');
    }
    this.activeSubstate = startState;
    startState.onEntry();
  }

  /**
   * Handle events with hierarchical propagation from leaf to root.
   * FIX for Issue 3: Uses getActiveSubstate() instead of accessing protected member.
   */
  public override onEvent(simpleEvent: SimpleEvent): boolean {
    // Find the leaf state (deepest active substate)
    let leafState: BaseState | null = this;
    while (leafState) {
      const activeChild = leafState.getActiveSubstate();
      if (!activeChild) break;
      leafState = activeChild;
    }

    // Hierarchical event handling from leaf to root
    let currentState: BaseState | null = leafState;
    while (currentState) {
      if (currentState.onEvent(simpleEvent)) {
        return true; // Event consumed
      }
      currentState = currentState.parent;
    }

    return false; // Event not handled
  }
}

/**
 * A hierarchical state machine.
 * Manages a tree of states and handles events and transitions.
 */
export class StateMachine {
  public priority: number;
  private rootState: RootState = new RootState();

  constructor(priority: number = 0) {
    this.priority = priority;
  }

  /**
   * Adds a top-level state to this state machine.
   */
  public addState(state: BaseState): void {
    this.rootState.addSubstate(state);
  }

  /**
   * Starts the state machine by entering the initial state.
   */
  public start(): void {
    this.rootState.start();
  }

  /**
   * Forwards an event to the state machine for handling.
   * Returns true if the event was consumed, false otherwise.
   */
  public onEvent(simpleEvent: SimpleEvent): boolean {
    return this.rootState.onEvent(simpleEvent);
  }

  /**
   * Gets the root state of this state machine.
   * Useful for advanced operations like direct state access.
   */
  public getRoot(): RootState {
    return this.rootState;
  }
}
