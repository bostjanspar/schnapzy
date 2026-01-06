import {
    CLUBS,
    DIAMONDS,
    HEARTS,
    SPADES,
    JACK,
    QUEEN,
    KING,
    TEN,
    ACE,
} from '../types.js';
import type {
    Card,
    Suit,
    TalonState,
} from '../types.js';
import { cardsEqual, createDeck } from '../card.js';

/**
 * Tracks the CPU's knowledge of the game state used for decision making.
 * Handles the "Information Boundary" - ensuring CPU only acts on what it sees.
 */
export class BeliefState {
    private myHand: Card[];
    private playedCards: Card[];
    private knownOpponentCards: Card[];
    private trumpCard: Card | null; // The face-up trump (if talon open)
    private trumpSuit: Suit;
    private talonState: TalonState;
    private talonSize: number;

    constructor(
        myHand: Card[],
        playedCards: Card[],
        trumpCard: Card | null,
        trumpSuit: Suit,
        talonState: TalonState,
        talonSize: number
    ) {
        this.myHand = [...myHand];
        this.playedCards = [...playedCards];
        this.trumpCard = trumpCard;
        this.trumpSuit = trumpSuit;
        this.talonState = talonState;
        this.talonSize = talonSize;
        this.knownOpponentCards = [];
        // knownOpponentCards must be updated via events (marriage declaration, exchange)
        // For now, it starts empty unless passed in. 
        // But conceptually, `BeliefState` is often rebuilt each turn from GameKnowledge?
        // If rebuilt, we lose memory of "seen" cards like Marriages unless those are passed in.
        // So BeliefState should probably be persistent or take "public information" history.

        // Simplification: We assume `playedCards` contains all cards played to tricks.
        // We need a method `recordOpponentEvent` to track extra info.
    }

    public updateMyHand(hand: Card[]): void {
        this.myHand = [...hand];
    }

    public updateTalonState(state: TalonState, size: number): void {
        this.talonState = state;
        this.talonSize = size;
    }

    public recordPlayedCard(card: Card): void {
        if (!this.playedCards.some(c => cardsEqual(c, card))) {
            this.playedCards.push(card);
        }
        // Also remove from known opponent if it was there
        this.knownOpponentCards = this.knownOpponentCards.filter(c => !cardsEqual(c, card));
    }

    public getTrumpSuit(): Suit {
        return this.trumpSuit;
    }

    /**
     * Records a card shown by the opponent (e.g. Marriage declaration).
     */
    public recordOpponentCard(card: Card): void {
        if (!this.knownOpponentCards.some(c => cardsEqual(c, card))) {
            this.knownOpponentCards.push(card);
        }
    }

    /**
     * Calculates all cards whose location is unknown to the CPU.
     * Unknown = All Cards - My Hand - Played Cards - Known Opponent Cards - Face Up Trump
     */
    public getUnknownCards(): Card[] {
        const allCards = createDeck();

        return allCards.filter(card => {
            // Exclude my hand
            if (this.myHand.some(c => cardsEqual(c, card))) return false;

            // Exclude played cards
            if (this.playedCards.some(c => cardsEqual(c, card))) return false;

            // Exclude known opponent cards?
            // No, "Unknown" usually means "Not in my hand and not played".
            // If I know opponent has it, it is technically "Known Location: Opponent".
            // But is it "Unknown to me?" No.
            // But for "Probabilistic sampling of talon vs opponent", we need to separate.
            // Let's refine:
            // UnknownLocation = All - MyHand - Played - FaceUpTrump.
            // These belong to either Opponent or Talon.

            if (this.trumpCard && cardsEqual(this.trumpCard, card) && this.talonState !== 'TALON_EXHAUSTED') {
                // Face-up trump is known (at bottom of talon)
                return false;
            }

            return true;
        });
    }

    /**
     * During Phase 2 (Closed/Exhausted), the opponent's hand is known exactly.
     * Returns the array of cards in opponent's hand.
     * Throws if Talon is still open / exact hand not calculable.
     */
    public getOpponentHandExact(): Card[] {
        // If talon is not empty/closed, we can't play perfect info game (unless we counted card by card and talon size is 0?)
        // Wait, if Talon is CLOSED by player, there are cards in Talon hidden.
        // So Opponent Hand is NOT exact?
        // Rule: "When talon is closed, strict rules apply." 
        // But do we know opponent cards? 
        // No, unseen talon cards remain unseen.
        // So Minimax only works when Talon is EXHAUSTED (empty).
        // OR if we assume closed talon cards are irrelevant? No, they are relevant (opponent doesn't have them).
        // But we don't know WHICH are in talon vs opponent hand.

        // So Minimax is only strictly applicable when `getUnknownCards().length === opponentHandSize`.
        // i.e. NO hidden talon cards.

        // If Talon is Closed, we have `Unknown = OpponentHand + TalonCards`.
        // We can only use PIMC (sampling).

        // If Talon is Exhausted (Size 0), then `Unknown = OpponentHand`.

        if (this.talonSize > 0 && this.talonState === 'TALON_OPEN') {
            throw new Error("Cannot get exact opponent hand: Talon is open");
        }
        // If closed, size > 0, we also don't know.
        if (this.talonSize > 0) {
            // Check if we can deduce?
            // Usually no.
            // So we return null?
            return []; // Cannot return correct hand.
        }

        // Talon size 0 (Exhausted).
        // Unknown cards = Opponent Hand exactly.
        return this.getUnknownCards();
    }

    public getKnownOpponentHand(): Card[] {
        return this.knownOpponentCards.filter(c => {
            // Remove if played
            return !this.playedCards.some(pc => cardsEqual(pc, c));
        });
    }
}
