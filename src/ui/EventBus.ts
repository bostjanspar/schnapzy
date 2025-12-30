/**
 * Centralized event bus for scene-to-StateMachine communication.
 * Scenes emit events; the State Machine listens and responds.
 */

import type { EventCallback } from './types.js';

type WildcardCallback = (event: string, data?: unknown) => void;

export class EventBus {
  private listeners: Map<string, EventCallback[]> = new Map();
  private wildcardListeners: WildcardCallback[] = [];

  /**
   * Register a callback for an event.
   */
  on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Register a wildcard callback that receives ALL events.
   * Useful for forwarding events to a state machine.
   */
  onAny(callback: WildcardCallback): void {
    this.wildcardListeners.push(callback);
  }

  /**
   * Unregister a wildcard callback.
   */
  offAny(callback: WildcardCallback): void {
    const index = this.wildcardListeners.indexOf(callback);
    if (index > -1) {
      this.wildcardListeners.splice(index, 1);
    }
  }

  /**
   * Unregister a callback for an event.
   */
  off(event: string, callback: EventCallback): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event with optional data.
   */
  emit(event: string, data?: unknown): void {
    // Call specific event listeners
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }

    // Call wildcard listeners
    this.wildcardListeners.forEach(cb => cb(event, data));
  }

  /**
   * Clear all event listeners.
   */
  clear(): void {
    this.listeners.clear();
    this.wildcardListeners = [];
  }
}
