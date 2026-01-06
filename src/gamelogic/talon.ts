import {
    TALON_OPEN,
    TALON_CLOSED,
    TALON_EXHAUSTED,
    JACK,
} from './types.js';
import type {
    Card,
    Suit,
    TalonState,
} from './types.js';

/**
 * Manages the talon (draw pile) and the face-up trump card.
 */
export class Talon {
    private deck: Card[];
    private trumpCard: Card;
    private state: TalonState;

    /**
     * Initializes the talon with a shuffled deck.
     * The last card becomes the trump card.
     * @param deck Shuffled deck of cards
     */
    constructor(deck: Card[]) {
        if (deck.length === 0) {
            throw new Error('Cannot initialize talon with empty deck');
        }
        this.deck = [...deck]; // Copy to avoid external mutation

        // In Schnapsen, the last card is turned face up as trump
        // But conceptually it stays at the bottom of the talon
        const trump = this.deck[this.deck.length - 1];
        if (!trump) {
            throw new Error('Deck must have at least one card');
        }
        this.trumpCard = trump;
        this.state = TALON_OPEN;

    }

    /**
     * Draws the top card from the talon.
     * @returns The drawn card, or null if talon is empty
     */
    public draw(): Card | null {
        if (this.deck.length === 0) {
            return null;
        }

        const card = this.deck.shift();

        // If the last card (trump) is drawn, the talon becomes exhausted
        if (this.deck.length === 0) {
            this.state = TALON_EXHAUSTED;
        }

        return card || null;
    }

    /**
     * Allows a player holding the Trump Jack to exchange it for the face-up trump card.
     * @param jackCard The Trump Jack card provided by the player for verification
     * @returns The old trump card (that was face up)
     */
    public exchangeTrumpJack(jackCard: Card): Card {
        if (!this.canExchange(jackCard)) {
            throw new Error('Cannot exchange trump Jack');
        }

        const oldTrump = this.trumpCard;

        // Replace the bottom card (trump) with the Jack
        this.deck[this.deck.length - 1] = jackCard;
        this.trumpCard = jackCard;

        return oldTrump;
    }

    /**
     * Closes the talon. No more cards can be drawn.
     */
    public close(): void {
        if (!this.canClose()) {
            throw new Error('Cannot close talon');
        }

        this.state = TALON_CLOSED;
    }

    // =========================================================================
    // Queries
    // =========================================================================

    public getTrumpCard(): Card {
        return this.trumpCard;
    }

    public getTrumpSuit(): Suit {
        return this.trumpCard.suit;
    }

    public getState(): TalonState {
        return this.state;
    }

    public getSize(): number {
        return this.deck.length;
    }

    public canExchange(card: Card): boolean {
        // Can only exchange if:
        // 1. Talon is open
        // 2. Card provided is actually the Trump Jack
        // 3. Deck has more than 1 card (cannot exchange if only trump is left? Rules say talon must not be exhausted/closed)
        // Actually, rules say you can exchange as long as talon is open and you have the lead (checked effectively by game logic)

        return (
            this.state === TALON_OPEN &&
            card.rank === JACK &&
            card.suit === this.trumpCard.suit
        );
    }

    public canClose(): boolean {
        // Can only close if:
        // 1. Talon is open
        // 2. Talon still has cards (at least 2? Rules vary, but usually need > 2 to make sense, but conceptually just "open" is enough provided strict checks elsewhere)
        // Vienna rules: Can close as long as talon is open and opponent has not just drawn

        // Rule: The talon cannot be closed when only two cards remain in it (the face up trump and one face down card).
        return this.state === TALON_OPEN && this.deck.length >= 3;
    }
}
