/**
 * Layer 3: Current Trick Manager
 *
 * Manages a single trick within a hand of Schnapsen.
 * Responsibilities:
 * - Track which player leads
 * - Store played cards
 * - Determine trick winner based on trump and card values
 * - Calculate trick points
 */

import type {
  Player,
  Card,
  Suit,
  TrickResult,
} from './types.js';

/**
 * Manages a single trick in the game.
 * A trick consists of two cards played (one by each player).
 */
export class Trick {
  private leadPlayer: Player | null;
  private playedCards: Map<Player, Card>;
  private trumpSuit: Suit | null;

  constructor(trumpSuit: Suit | null) {
    this.leadPlayer = null;
    this.playedCards = new Map<Player, Card>();
    this.trumpSuit = trumpSuit;
  }

  /**
   * The first player plays a card to start the trick.
   */
  public leadCard(player: Player, card: Card): void {
    if (this.leadPlayer !== null) {
      throw new Error('Trick already has a lead player.');
    }
    if (this.playedCards.size >= 2) {
      throw new Error('Trick is already complete.');
    }

    this.leadPlayer = player;
    this.playedCards.set(player, card);
  }

  /**
   * The second player plays a card in response.
   */
  public followCard(player: Player, card: Card): void {
    if (this.leadPlayer === null) {
      throw new Error('Cannot follow: no lead player has been set.');
    }
    if (player === this.leadPlayer) {
      throw new Error('Cannot follow your own lead.');
    }
    if (this.playedCards.has(player)) {
      throw new Error('Player has already played to this trick.');
    }

    this.playedCards.set(player, card);
  }

  /**
   * Complete the trick and determine the winner.
   * Returns the result including winner and points.
   */
  public complete(): TrickResult {
    if (this.playedCards.size !== 2) {
      throw new Error('Cannot complete trick: both players must play.');
    }

    const winner = this.determineWinner();
    const points = this.calculatePoints();

    return { winner, points };
  }

  /**
   * Get the player who led the trick.
   */
  public getLeadPlayer(): Player | null {
    return this.leadPlayer;
  }

  /**
   * Get all cards played in this trick.
   */
  public getPlayedCards(): Map<Player, Card> {
    return new Map<Player, Card>(this.playedCards);
  }

  /**
   * Get the card played by a specific player.
   */
  public getCardPlayedBy(player: Player): Card | undefined {
    return this.playedCards.get(player);
  }

  /**
   * Get the winner of the trick (if complete).
   */
  public getWinner(): Player | null {
    if (this.playedCards.size !== 2) {
      return null;
    }
    return this.determineWinner();
  }

  /**
   * Check if the trick is complete (both players have played).
   */
  public isComplete(): boolean {
    return this.playedCards.size === 2;
  }

  /**
   * Get the total points in the trick.
   */
  public getPoints(): number {
    return this.calculatePoints();
  }

  /**
   * Reset the trick for reuse.
   */
  public reset(): void {
    this.leadPlayer = null;
    this.playedCards.clear();
  }

  /**
   * Determine the winner based on Schnapsen rules:
   * - Highest trump wins
   * - If no trump, highest card of led suit wins
   */
  private determineWinner(): Player {
    const entries = Array.from(this.playedCards.entries());
    if (entries.length !== 2) {
      throw new Error('Cannot determine winner: trick must have 2 cards.');
    }
    const entry0 = entries.at(0);
    const entry1 = entries.at(1);
    if (!entry0 || !entry1) {
      throw new Error('Cannot determine winner: missing entries.');
    }
    const [player1, card1] = entry0;
    const [player2, card2] = entry1;

    // If either card is trump, highest trump wins
    if (card1.suit === this.trumpSuit && card2.suit !== this.trumpSuit) {
      return player1;
    }
    if (card2.suit === this.trumpSuit && card1.suit !== this.trumpSuit) {
      return player2;
    }
    if (card1.suit === this.trumpSuit && card2.suit === this.trumpSuit) {
      return this.compareRanks(card1, card2) > 0 ? player1 : player2;
    }

    // No trumps: highest card of led suit wins
    const leadSuit = card1.suit;
    if (card1.suit === leadSuit && card2.suit !== leadSuit) {
      return player1;
    }
    if (card2.suit === leadSuit && card1.suit !== leadSuit) {
      return player2;
    }

    // Same suit: higher rank wins
    return this.compareRanks(card1, card2) > 0 ? player1 : player2;
  }

  /**
   * Compare two card ranks.
   * Returns positive if card1 > card2, negative if card1 < card2, zero if equal.
   */
  private compareRanks(card1: Card, card2: Card): number {
    const rankOrder = { JACK: 0, QUEEN: 1, KING: 2, TEN: 3, ACE: 4 } as const;
    return rankOrder[card1.rank] - rankOrder[card2.rank];
  }

  /**
   * Calculate total points in the trick.
   */
  private calculatePoints(): number {
    let points = 0;
    const rankValues = { JACK: 2, QUEEN: 3, KING: 4, TEN: 10, ACE: 11 } as const;
    for (const card of this.playedCards.values()) {
      points += rankValues[card.rank];
    }
    return points;
  }
}
