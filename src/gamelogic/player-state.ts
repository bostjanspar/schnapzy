import { KING, QUEEN } from './types.js';
import type { Card, Suit, Player } from './types.js';
import { cardsEqual } from './card.js';

export class PlayerState {
    public id: Player;
    private hand: Card[];
    private trickPoints: number;
    private marriagePoints: number;
    private tricksWon: number;

    constructor(id: Player) {
        this.id = id;
        this.hand = [];
        this.trickPoints = 0;
        this.marriagePoints = 0;
        this.tricksWon = 0;
    }

    // =========================================================================
    // Hand Management
    // =========================================================================

    public addCards(cards: Card[]): void {
        this.hand.push(...cards);
    }

    public removeCard(card: Card): void {
        const index = this.hand.findIndex((c) => cardsEqual(c, card));
        if (index === -1) {
            throw new Error(`Player ${this.id} does not have card ${card.rank} of ${card.suit}`);
        }
        this.hand.splice(index, 1);
    }

    public getHand(): readonly Card[] {
        return this.hand;
    }

    public hasCard(card: Card): boolean {
        return this.hand.some((c) => cardsEqual(c, card));
    }

    // =========================================================================
    // Scoring
    // =========================================================================

    public addTrickPoints(points: number): void {
        this.trickPoints += points;
    }

    public addMarriagePoints(points: number): void {
        this.marriagePoints += points;
    }

    public incrementTricksWon(): void {
        this.tricksWon++;
    }

    // =========================================================================
    // Queries
    // =========================================================================

    public getTrickPoints(): number {
        return this.trickPoints;
    }

    public getMarriagePoints(): number {
        return this.marriagePoints;
    }

    public getTotalPoints(): number {
        return this.trickPoints + this.marriagePoints;
    }

    public getTricksWon(): number {
        return this.tricksWon;
    }

    public hasWonTrick(): boolean {
        return this.tricksWon > 0;
    }

    // =========================================================================
    // Marriages
    // =========================================================================

    /**
     * Checks which suits the player holds a marriage in (King + Queen).
     */
    public getAvailableMarriages(): Suit[] {
        const suits: Suit[] = [];
        const heldSuits = new Set<Suit>();

        for (const card of this.hand) {
            heldSuits.add(card.suit);
        }

        for (const suit of heldSuits) {
            if (this.hasMarriage(suit)) {
                suits.push(suit);
            }
        }
        return suits;
    }

    public hasMarriage(suit: Suit): boolean {
        const hasKing = this.hand.some((c) => c.suit === suit && c.rank === KING);
        const hasQueen = this.hand.some((c) => c.suit === suit && c.rank === QUEEN);
        return hasKing && hasQueen;
    }
}
