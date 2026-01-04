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

  public startGame(): void {
    this.phase = IN_PROGRESS;
    this.gamePoints.set(PLAYER_ONE, 7);
    this.gamePoints.set(PLAYER_TWO, 7);
    this.currentDealer = PLAYER_ONE;
    this.overallWinner = null;

    // Deal the first hand
    this.startNewHand();
  }

  public startNewHand(): void {
    this.currentDeal = new Deal();
    this.currentDeal.deal(this.currentDealer);
    this.phase = IN_PROGRESS;
  }

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

  public getGamePhase(): GamePhase {
    return this.phase;
  }

  public getGamePoints(player: Player): number {
    return this.gamePoints.get(player) ?? 7;
  }

  public getWinner(): Player | null {
    return this.overallWinner;
  }

  public getCurrentDealer(): Player {
    return this.currentDealer;
  }

  public getCurrentDeal(): Deal | null {
    return this.currentDeal;
  }

  public isGameOver(): boolean {
    return this.phase === GAME_OVER;
  }

  public isHandInProgress(): boolean {
    return this.phase === IN_PROGRESS && this.currentDeal !== null;
  }

  // ==========================================================================
  // Delegation to Deal Layer
  // ==========================================================================

  public playCard(player: Player, card: Card): void {
    if (!this.currentDeal) {
      throw new Error('No active deal.');
    }
    this.currentDeal.playCard(player, card);
  }

  public exchangeTrumpJack(player: Player): void {
    if (!this.currentDeal) {
      throw new Error('No active deal.');
    }
    this.currentDeal.exchangeTrumpJack(player);
  }

  public declareMarriage(player: Player, suit: Suit): number {
    if (!this.currentDeal) {
      throw new Error('No active deal.');
    }
    return this.currentDeal.declareMarriage(player, suit);
  }

  public closeTalon(_player: Player): void {
    if (!this.currentDeal) {
      throw new Error('No active deal.');
    }
    this.currentDeal.closeTalon();
  }

  // ==========================================================================
  // Convenience Methods
  // ==========================================================================

  public getHand(player: Player): Card[] {
    if (!this.currentDeal) {
      return [];
    }
    return this.currentDeal.getHand(player);
  }

  public getTrumpSuit(): Suit | null {
    if (!this.currentDeal) {
      return null;
    }
    return this.currentDeal.getTrumpSuit();
  }

  public getCardPoints(player: Player): number {
    if (!this.currentDeal) {
      return 0;
    }
    return this.currentDeal.getCardPoints(player);
  }

  public getTotalPoints(player: Player): number {
    if (!this.currentDeal) {
      return 0;
    }
    return this.currentDeal.getTotalPoints(player);
  }

  public hasReached66(player: Player): boolean {
    return this.getTotalPoints(player) >= 66;
  }
}
