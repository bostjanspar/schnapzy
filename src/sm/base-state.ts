/**
 * Abstract base class for hierarchical state machine states.
 *
 * Provides:
 * - Parent/child relationships for hierarchical state organization
 * - State entry/exit lifecycle hooks
 * - Event handling with hierarchical propagation
 * - State transitions with automatic default substate activation
 */

import type { StateEnum } from './state.enum.js';
import type { SimpleEvent } from './types.js';

export abstract class BaseState {
  public parent: BaseState | null = null;
  protected children: BaseState[] = [];
  protected activeSubstate: BaseState | null = null;
  protected debug: boolean = false;
  public id: StateEnum;

  constructor(id: StateEnum) {
    this.id = id;
  }

  /**
   * Adds a child state to this state.
   * @throws {Error} If a state with the same ID already exists or a circular reference is detected
   */
  public addSubState(childState: BaseState): void {
    if (this.children.some(child => child.id === childState.id)) {
      throw new Error(
        `State with ID ${String(childState.id)} already exists as a substate.`
      );
    }

    // Check for circular references
    let current: BaseState | null = this;
    while (current) {
      if (current === childState) {
        throw new Error(
          'Circular reference detected: a state cannot be its own ancestor.'
        );
      }
      current = current.parent;
    }

    childState.parent = this;
    this.children.push(childState);
  }

  /**
   * Returns the index of the default child state to activate when this state is entered.
   * Override this method in subclasses to specify a different default child.
   */
  protected get defaultSubstateIndex(): number {
    return 0;
  }

  /**
   * Public getter for accessing the active substate.
   * FIX for Issue 3: Provides safe access to activeSubstate from outside the class.
   */
  public getActiveSubstate(): BaseState | null {
    return this.activeSubstate;
  }

  /**
   * Type guard to check if this state has an active substate.
   */
  public hasActiveSubstate(): boolean {
    return this.activeSubstate !== null;
  }

  /**
   * Returns true if this state has no children (leaf state).
   */
  public isLeafState(): boolean {
    return this.children.length === 0;
  }

  /** Called when entering this state. Must be implemented by subclasses. */
  public abstract onEntry(): void;

  /** Called when leaving this state. Must be implemented by subclasses. */
  public abstract onLeave(): void;

  /**
   * Called when an event is received.
   * Returns true if the event was consumed (handled), false otherwise.
   * Subclasses can override this to handle specific events.
   */
  public onEvent(_simpleEvent: SimpleEvent): boolean {
    return false;
  }

  /**
   * Transitions to a target state.
   * FIX for Issue 6: Searches up the hierarchy, not just siblings.
   * @throws {Error} If the target state cannot be found in the hierarchy
   */
  public transition(targetStateId: StateEnum): void {
    let searchRoot: BaseState | null = this.parent;

    // Search up the hierarchy for states containing the target
    while (searchRoot) {
      const found = searchRoot.findTransition(targetStateId);
      if (found) {
        searchRoot.internalTransition(found);
        return;
      }
      searchRoot = searchRoot.parent;
    }

    throw new Error(
      `State with ID ${String(
        targetStateId
      )} does not exist in hierarchy from state ${String(this.id)}.`
    );
  }

  /**
   * Searches this state's children for a target state.
   * Changed to protected (was private) for testability.
   */
  protected findTransition(targetStateId: StateEnum): BaseState | null {
    return this.children.find(child => child.id === targetStateId) ?? null;
  }

  /**
   * Internal transition logic.
   * 1. Exit all active substates recursively
   * 2. Enter the target state
   * 3. Activate default substates recursively
   * Changed to protected (was private) for testability.
   */
  protected internalTransition(transToState: BaseState): void {
    // Exit all active substates (deepest first)
    let activeState = this.activeSubstate;
    while (activeState) {
      activeState.onLeave();
      const next = activeState.activeSubstate;
      activeState.activeSubstate = null;
      activeState = next;
    }

    // Enter the target state
    transToState.onEntry();
    this.activeSubstate = transToState;

    // FIX for Issue 2: Use defaultSubstateIndex instead of hardcoded [0]
    // Activate default substates recursively
    let currentState: BaseState = transToState;
    while (currentState.children.length > 0) {
      const defaultIndex = currentState.defaultSubstateIndex;
      if (defaultIndex < 0 || defaultIndex >= currentState.children.length) {
        throw new Error(
          `Invalid default substate index: ${defaultIndex} for state ${String(
            currentState.id
          )}`
        );
      }

      const childState = currentState.children.at(defaultIndex);
      if (!childState) {
        throw new Error(
          `Child state at index ${defaultIndex} not found for state ${String(
            currentState.id
          )}`
        );
      }
      currentState.activeSubstate = childState;
      childState.onEntry();
      currentState = childState;
    }
  }

   protected safeParentTransition(stateId: StateEnum): void {
    if (this.parent) {
      this.parent.transition(stateId);
    } else {
      throw new Error(`No parent state machine for state ${this.id} to transition to ${stateId}.`);
    }
  }
}
