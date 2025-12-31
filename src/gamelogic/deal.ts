/**
 * Layer 2: Card/Deck Manager
 *
 * Manages a single hand (deal) of Schnapsen.
 * Responsibilities:
 * - Manage player hands (5 cards each)
 * - Control talon state (OPEN/CLOSED/EXHAUSTED)
 * - Track card points and tricks won per player
 * - Handle marriages (20/40 points)
 * - Handle trump Jack exchange
 * - Validate card plays based on talon state
 */

import type {
  Player,
  Card,
  Suit,
  TalonState,
} from './types.js';
import { Trick } from './trick.js';

/**
 * Manages a single hand (deal) of Schnapsen.
 */
export class Deal {
  private hands: Map<Player, Card[]>;
  private talon: Card[];
  private trumpCard: Card | null;
  private talonState: TalonState;
  private cardPoints: Map<Player, number>;
  private tricksWon: Map<Player, number>;
  private marriagePoints: Map<Player, number>;
  private currentTrick: Trick;

  constructor() {
    this.hands = new Map<Player, Card[]>();
    this.hands.set('PLAYER_ONE' as Player, []);
    this.hands.set('PLAYER_TWO' as Player, []);
    this.talon = [];
    this.trumpCard = null;
    this.talonState = 'TALON_OPEN' as TalonState;
    this.cardPoints = new Map<Player, number>();
    this.cardPoints.set('PLAYER_ONE' as Player, 0);
    this.cardPoints.set('PLAYER_TWO' as Player, 0);
    this.tricksWon = new Map<Player, number>();
    this.tricksWon.set('PLAYER_ONE' as Player, 0);
    this.tricksWon.set('PLAYER_TWO' as Player, 0);
    this.marriagePoints = new Map<Player, number>();
    this.marriagePoints.set('PLAYER_ONE' as Player, 0);
    this.marriagePoints.set('PLAYER_TWO' as Player, 0);
    this.currentTrick = new Trick(null);
  }

  // ==========================================================================
  // Setup
  // ==========================================================================

  /**
   * Deal cards to both players.
   * 5 cards each: first 3, then 2 more after trump is determined.
   */
  public deal(dealer: Player): void {
    // Placeholder: actual deck creation and shuffling to be implemented
    this.hands.get(dealer)!.push(...this.createMockHand());
    this.hands.get(this.getOpponent(dealer))!.push(...this.createMockHand());

    // Set trump card (placeholder)
    this.trumpCard = { suit: 'HEARTS' as Suit, rank: 'ACE' as const };

    // Initialize trick with trump suit
    this.currentTrick = new Trick(this.trumpCard.suit);
  }

  /**
   * Create a mock hand for testing (placeholder).
   */
  private createMockHand(): Card[] {
    return [
      { suit: 'HEARTS' as Suit, rank: 'ACE' as const },
      { suit: 'HEARTS' as Suit, rank: 'KING' as const },
      { suit: 'HEARTS' as Suit, rank: 'QUEEN' as const },
      { suit: 'CLUBS' as Suit, rank: 'JACK' as const },
      { suit: 'DIAMONDS' as Suit, rank: 'TEN' as const },
    ];
  }

  private getOpponent(player: Player): Player {
    return player === 'PLAYER_ONE' ? ('PLAYER_TWO' as Player) : ('PLAYER_ONE' as Player);
  }

  // ==========================================================================
  // Card Play
  // ==========================================================================

  /**
   * Play a card from the player's hand to the current trick.
   */
  public playCard(player: Player, card: Card): Trick {
    if (!this.isValidPlay(player, card)) {
      throw new Error(`Invalid play: player cannot play ${card.rank} of ${card.suit}`);
    }

    // Remove card from hand
    const hand = this.hands.get(player)!;
    const index = hand.findIndex(c => c.suit === card.suit && c.rank === card.rank);
    if (index === -1) {
      throw new Error('Card not in player\'s hand.');
    }
    hand.splice(index, 1);

    // Add to trick
    if (!this.currentTrick.getLeadPlayer()) {
      this.currentTrick.leadCard(player, card);
    } else {
      this.currentTrick.followCard(player, card);
    }

    // If trick complete, award points
    if (this.currentTrick.isComplete()) {
      const result = this.currentTrick.complete();
      const points = this.cardPoints.get(result.winner)! + result.points;
      this.cardPoints.set(result.winner, points);
      const tricks = this.tricksWon.get(result.winner)! + 1;
      this.tricksWon.set(result.winner, tricks);
    }

    return this.currentTrick;
  }

  /**
   * Validate whether a card play is legal.
   * TODO: Implement full validation based on talon state and Schnapsen rules.
   */
  public isValidPlay(player: Player, card: Card): boolean {
    const hand = this.hands.get(player);
    if (!hand) return false;

    // Check if player has the card
    const hasCard = hand.some(c => c.suit === card.suit && c.rank === card.rank);
    if (!hasCard) return false;

    // TODO: Add talon state validation rules
    // - Open talon: any card is legal
    // - Closed/exhausted: must follow suit, trump rules apply

    return true;
  }

  // ==========================================================================
  // Special Actions
  // ==========================================================================

  /**
   * Exchange the trump Jack for the face-up trump card.
   * Can only be done while talon is open.
   */
  public exchangeTrumpJack(player: Player): void {
    if (this.talonState !== 'TALON_OPEN') {
      throw new Error('Cannot exchange trump Jack: talon is not open.');
    }

    const hand = this.hands.get(player)!;
    const jackIndex = hand.findIndex(c =>
      c.rank === 'JACK' && c.suit === this.trumpCard?.suit
    );

    if (jackIndex === -1) {
      throw new Error('Player does not have the trump Jack.');
    }

    // TODO: Implement exchange logic
    // Remove Jack from hand, add trump card
  }

  /**
   * Declare a marriage (King-Queen of same suit).
   * Returns 20 points for plain marriage, 40 for royal marriage (trumps).
   */
  public declareMarriage(player: Player, suit: Suit): number {
    const hand = this.hands.get(player)!;
    const hasKing = hand.some(c => c.suit === suit && c.rank === 'KING');
    const hasQueen = hand.some(c => c.suit === suit && c.rank === 'QUEEN');

    if (!hasKing || !hasQueen) {
      throw new Error('Player does not have both King and Queen of the declared suit.');
    }

    const isRoyalMarriage = suit === this.trumpCard?.suit;
    const points = isRoyalMarriage ? 40 : 20;

    const currentPoints = this.marriagePoints.get(player)!;
    this.marriagePoints.set(player, currentPoints + points);

    return points;
  }

  /**
   * Close the talon (draw pile).
   * Commits the player to reach 66 points with their current cards.
   */
  public closeTalon(): void {
    if (this.talonState !== 'TALON_OPEN') {
      throw new Error('Cannot close: talon is not open.');
    }

    if (this.talon.length < 2) {
      throw new Error('Cannot close with less than 2 cards in talon.');
    }

    this.talonState = 'TALON_CLOSED';
  }

  // ==========================================================================
  // Queries
  // ==========================================================================

  /**
   * Get the current hand of a player.
   */
  public getHand(player: Player): Card[] {
    return [...(this.hands.get(player) ?? [])];
  }

  /**
   * Get the current state of the talon.
   */
  public getTalonState(): TalonState {
    return this.talonState;
  }

  /**
   * Get the trump suit.
   */
  public getTrumpSuit(): Suit | null {
    return this.trumpCard?.suit ?? null;
  }

  /**
   * Get the card points earned by a player.
   */
  public getCardPoints(player: Player): number {
    return this.cardPoints.get(player) ?? 0;
  }

  /**
   * Get the number of tricks won by a player.
   */
  public getTricksWon(player: Player): number {
    return this.tricksWon.get(player) ?? 0;
  }

  /**
   * Get the marriage points earned by a player.
   */
  public getMarriagePoints(player: Player): number {
    return this.marriagePoints.get(player) ?? 0;
  }

  /**
   * Get the total points (card points + marriage points) for a player.
   */
  public getTotalPoints(player: Player): number {
    return this.getCardPoints(player) + this.getMarriagePoints(player);
  }

  /**
   * Get the current trick.
   */
  public getCurrentTrick(): Trick {
    return this.currentTrick;
  }

  /**
   * Check if the talon is exhausted.
   */
  public isTalonExhausted(): boolean {
    return this.talon.length === 0 && this.talonState === 'TALON_OPEN';
  }
}
