import type {
  Player,
  Card,
  Suit,
  TalonState,
} from './types.js';
import { Trick } from './trick.js';

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

  public deal(dealer: Player): void {
    // Placeholder: actual deck creation and shuffling to be implemented
    this.hands.get(dealer)!.push(...this.createMockHand());
    this.hands.get(this.getOpponent(dealer))!.push(...this.createMockHand());

    // Set trump card (placeholder)
    this.trumpCard = { suit: 'HEARTS' as Suit, rank: 'ACE' as const };

    // Initialize trick with trump suit
    this.currentTrick = new Trick(this.trumpCard.suit);
  }

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

  public getHand(player: Player): Card[] {
    return [...(this.hands.get(player) ?? [])];
  }

  public getTalonState(): TalonState {
    return this.talonState;
  }

  public getTrumpSuit(): Suit | null {
    return this.trumpCard?.suit ?? null;
  }

  public getCardPoints(player: Player): number {
    return this.cardPoints.get(player) ?? 0;
  }

  public getTricksWon(player: Player): number {
    return this.tricksWon.get(player) ?? 0;
  }

  public getMarriagePoints(player: Player): number {
    return this.marriagePoints.get(player) ?? 0;
  }

  public getTotalPoints(player: Player): number {
    return this.getCardPoints(player) + this.getMarriagePoints(player);
  }

  public getCurrentTrick(): Trick {
    return this.currentTrick;
  }

  public isTalonExhausted(): boolean {
    return this.talon.length === 0 && this.talonState === 'TALON_OPEN';
  }
}
