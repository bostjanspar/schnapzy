import { describe, it, expect } from 'vitest';
import {
    createDeck,
    shuffleDeck,
    getCardValue,
    cardsEqual,
    compareCards,
} from '../../src/gamelogic/card.js';
import { ACE, TEN, KING, QUEEN, JACK, HEARTS, SPADES } from '../../src/gamelogic/types.js';

describe('Card Utilities', () => {
    describe('createDeck', () => {
        it('should create a deck with 20 cards', () => {
            const deck = createDeck();
            expect(deck).toHaveLength(20);
        });

        it('should contain 4 suits and 5 ranks', () => {
            const deck = createDeck();
            const suits = new Set(deck.map((c) => c.suit));
            const ranks = new Set(deck.map((c) => c.rank));

            expect(suits.size).toBe(4);
            expect(ranks.size).toBe(5);
        });
    });

    describe('shuffleDeck', () => {
        it('should return a deck with the same cards', () => {
            const deck = createDeck();
            const shuffled = shuffleDeck(deck);

            expect(shuffled).toHaveLength(20);
            expect(new Set(shuffled)).toEqual(new Set(deck));
        });

        it('should not mutate the original deck', () => {
            const deck = createDeck();
            const originalFirst = deck[0];
            const shuffled = shuffleDeck(deck);

            expect(deck[0]).toEqual(originalFirst);
            expect(shuffled).not.toBe(deck);
        });
    });

    describe('getCardValue', () => {
        it('should return correct values for Schnapsen ranks', () => {
            expect(getCardValue({ suit: HEARTS, rank: ACE })).toBe(11);
            expect(getCardValue({ suit: HEARTS, rank: TEN })).toBe(10);
            expect(getCardValue({ suit: HEARTS, rank: KING })).toBe(4);
            expect(getCardValue({ suit: HEARTS, rank: QUEEN })).toBe(3);
            expect(getCardValue({ suit: HEARTS, rank: JACK })).toBe(2);
        });
    });

    describe('cardsEqual', () => {
        it('should return true for identical cards', () => {
            const card1 = { suit: HEARTS, rank: ACE };
            const card2 = { suit: HEARTS, rank: ACE };
            expect(cardsEqual(card1, card2)).toBe(true);
        });

        it('should return false for different cards', () => {
            const card1 = { suit: HEARTS, rank: ACE };
            const card2 = { suit: SPADES, rank: ACE };
            expect(cardsEqual(card1, card2)).toBe(false);
        });
    });

    describe('compareCards', () => {
        it('should rank Ace higher than Ten', () => {
            const ace = { suit: HEARTS, rank: ACE } as const;
            const ten = { suit: HEARTS, rank: TEN } as const;
            // Ace (4) - Ten (3) = 1 (positive)
            expect(compareCards(ace, ten)).toBeGreaterThan(0);
        });
    });
});
