/**
 * Layer 1: Overall Game Manager
 *
 * Main facade for the Schnapsen game - all interactions go through this class.
 * Responsibilities:
 * - Track game points (starting at 7, counting down to 0)
 * - Manage dealer alternation between hands
 * - Handle game phases (NOT_STARTED, IN_PROGRESS, HAND_COMPLETE, GAME_OVER)
 * - Determine overall winner
 * - Coordinate Deal and Trick layers
 */

import type {
  Player,
  Card,
  Suit,
  GamePhase,
} from './types.js';
import { Deal } from './deal.js';
import {
  PLAYER_ONE,
  PLAYER_TWO,
  NOT_STARTED,
  IN_PROGRESS,
  HAND_COMPLETE,
  GAME_OVER,
} from './types.js';

/**
 * Main game class for Schnapsen.
 * All interactions with the game logic should go through this class.
 */
export class SchnapsenGame {
  private phase: GamePhase;
  private gamePoints: Map<Player, number>;
  private currentDealer: Player;
  private currentDeal: Deal | null;
  private overallWinner: Player | null;

  constructor() {
    this.phase = NOT_STARTED;
    this.gamePoints = new Map<Player, number>();
    this.gamePoints.set(PLAYER_ONE, 7);
    this.gamePoints.set(PLAYER_TWO, 7);
    this.currentDealer = PLAYER_ONE;
    this.currentDeal = null;
    this.overallWinner = null;
  }

  // ==========================================================================
  // Game Flow
  // ==========================================================================

  /**
   * Start a new game of Schnapsen.
   */
  public startGame(): void {
    this.phase = IN_PROGRESS;
    this.gamePoints.set(PLAYER_ONE, 7);
    this.gamePoints.set(PLAYER_TWO, 7);
    this.currentDealer = PLAYER_ONE;
    this.overallWinner = null;

    // Deal the first hand
    this.startNewHand();
  }

  /**
   * Start a new hand (deal).
   * Alternates the dealer each time.
   */
  public startNewHand(): void {
    this.currentDeal = new Deal();
    this.currentDeal.deal(this.currentDealer);
    this.phase = IN_PROGRESS;
  }

  /**
   * End the current hand and award game points.
   * @param winner - Player who won the hand
   * @param pointsWon - Number of game points won (1, 2, or 3)
   */
  public endHand(winner: Player, pointsWon: number): void {
    if (!this.currentDeal) {
      throw new Error('No active deal to end.');
    }

    if (pointsWon < 1 || pointsWon > 3) {
      throw new Error('Points won must be 1, 2, or 3.');
    }

    // Subtract from winner's game points
    const currentPoints = this.gamePoints.get(winner)!;
    const newPoints = currentPoints - pointsWon;
    this.gamePoints.set(winner, Math.max(0, newPoints));

    // Check for overall winner
    if (newPoints <= 0) {
      this.overallWinner = winner;
      this.phase = GAME_OVER;
    } else {
      this.phase = HAND_COMPLETE;
      // Alternate dealer for next hand
      this.currentDealer = this.currentDealer === PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE;
    }
  }

  // ==========================================================================
  // Queries
  // ==========================================================================

  /**
   * Get the current game phase.
   */
  public getGamePhase(): GamePhase {
    return this.phase;
  }

  /**
   * Get the game points for a player.
   * Players start at 7 and count down to 0.
   */
  public getGamePoints(player: Player): number {
    return this.gamePoints.get(player) ?? 7;
  }

  /**
   * Get the overall winner (null if game is not over).
   */
  public getWinner(): Player | null {
    return this.overallWinner;
  }

  /**
   * Get the current dealer.
   */
  public getCurrentDealer(): Player {
    return this.currentDealer;
  }

  /**
   * Get the current deal (hand).
   */
  public getCurrentDeal(): Deal | null {
    return this.currentDeal;
  }

  /**
   * Check if the game is over.
   */
  public isGameOver(): boolean {
    return this.phase === GAME_OVER;
  }

  /**
   * Check if a hand is in progress.
   */
  public isHandInProgress(): boolean {
    return this.phase === IN_PROGRESS && this.currentDeal !== null;
  }

  // ==========================================================================
  // Delegation to Deal Layer
  // ==========================================================================

  /**
   * Play a card from the player's hand.
   * Delegates to the current Deal.
   */
  public playCard(player: Player, card: Card): void {
    if (!this.currentDeal) {
      throw new Error('No active deal.');
    }
    this.currentDeal.playCard(player, card);
  }

  /**
   * Exchange the trump Jack for the trump card.
   * Delegates to the current Deal.
   */
  public exchangeTrumpJack(player: Player): void {
    if (!this.currentDeal) {
      throw new Error('No active deal.');
    }
    this.currentDeal.exchangeTrumpJack(player);
  }

  /**
   * Declare a marriage (King-Queen pair).
   * Delegates to the current Deal.
   */
  public declareMarriage(player: Player, suit: Suit): number {
    if (!this.currentDeal) {
      throw new Error('No active deal.');
    }
    return this.currentDeal.declareMarriage(player, suit);
  }

  /**
   * Close the talon (draw pile).
   * Delegates to the current Deal.
   */
  public closeTalon(_player: Player): void {
    if (!this.currentDeal) {
      throw new Error('No active deal.');
    }
    this.currentDeal.closeTalon();
  }

  // ==========================================================================
  // Convenience Methods
  // ==========================================================================

  /**
   * Get the hand of a player.
   */
  public getHand(player: Player): Card[] {
    if (!this.currentDeal) {
      return [];
    }
    return this.currentDeal.getHand(player);
  }

  /**
   * Get the trump suit for the current hand.
   */
  public getTrumpSuit(): Suit | null {
    if (!this.currentDeal) {
      return null;
    }
    return this.currentDeal.getTrumpSuit();
  }

  /**
   * Get the card points for a player in the current hand.
   */
  public getCardPoints(player: Player): number {
    if (!this.currentDeal) {
      return 0;
    }
    return this.currentDeal.getCardPoints(player);
  }

  /**
   * Get the total points (card + marriage) for a player.
   */
  public getTotalPoints(player: Player): number {
    if (!this.currentDeal) {
      return 0;
    }
    return this.currentDeal.getTotalPoints(player);
  }

  /**
   * Check if a player has reached 66 points in the current hand.
   */
  public hasReached66(player: Player): boolean {
    return this.getTotalPoints(player) >= 66;
  }
}
