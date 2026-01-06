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
    RANK_VALUES,
} from './types.js';
import type {
    Card,
    Suit,
    Rank,
} from './types.js';

/**
 * Creates a standard 20-card Schnapsen deck.
 * @returns An array of 20 cards (Ace, Ten, King, Queen, Jack of each suit)
 */
export function createDeck(): Card[] {
    const suits: Suit[] = [CLUBS, DIAMONDS, HEARTS, SPADES];
    const ranks: Rank[] = [ACE, TEN, KING, QUEEN, JACK];
    const deck: Card[] = [];

    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push({ suit, rank });
        }
    }

    return deck;
}

/**
 * Shuffles a deck of cards using the Fisher-Yates algorithm.
 * @param deck The deck to shuffle
 * @returns A new array with shuffeled cards (does not mutate original)
 */
export function shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = shuffled[i];
        if (temp) {
             shuffled[i] = shuffled[j] as Card;
             shuffled[j] = temp;
        }
    }
    return shuffled;
}

/**
 * Gets the point value of a card.
 * @param card The card to evaluate
 * @returns Point value (Ace=11, Ten=10, King=4, Queen=3, Jack=2)
 */
export function getCardValue(card: Card): number {
    return RANK_VALUES[card.rank];
}



/**
 * Checks if two cards are identical.
 * @param a First card
 * @param b Second card
 * @returns True if suit and rank match
 */
export function cardsEqual(a: Card, b: Card): boolean {
    return a.suit === b.suit && a.rank === b.rank;
}

/**
 * Compares two cards to determine which is higher.
 * This function is for sorting/display purposes, not trick winning logic.
 * Order: Ace > Ten > King > Queen > Jack
 */
export function compareCards(a: Card, b: Card): number {
    const rankOrder: Record<Rank, number> = {
        [ACE]: 4,
        [TEN]: 3,
        [KING]: 2,
        [QUEEN]: 1,
        [JACK]: 0,
    };

    if (a.suit !== b.suit) {
        return a.suit.localeCompare(b.suit);
    }

    return rankOrder[a.rank] - rankOrder[b.rank];
}
