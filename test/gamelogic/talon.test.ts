import { describe, it, expect, beforeEach } from 'vitest';
import { Talon } from '../../src/gamelogic/talon.js';
import { createDeck } from '../../src/gamelogic/card.js';
import {
    TALON_OPEN,
    TALON_CLOSED,
    TALON_EXHAUSTED,
    JACK,
    HEARTS,
    ACE,
} from '../../src/gamelogic/types.js';

describe('Talon', () => {
    let talon: Talon;

    beforeEach(() => {
        const deck = createDeck(); // 20 cards
        talon = new Talon(deck);
    });

    it('should initialize with correct state', () => {
        expect(talon.getSize()).toBe(20);
        expect(talon.getState()).toBe(TALON_OPEN);
        expect(talon.getTrumpCard()).toBeDefined();
    });

    it('should draw cards correctly', () => {
        const sizeBefore = talon.getSize();
        const card = talon.draw();

        expect(card).toBeDefined();
        expect(talon.getSize()).toBe(sizeBefore - 1);
    });

    it('should exhaust when last card is drawn', () => {
        // Draw 19 cards
        for (let i = 0; i < 19; i++) {
            talon.draw();
        }
        expect(talon.getState()).toBe(TALON_OPEN); // Still open until last is drawn? Or conceptually 1 card left?
        // Wait, if 20 cards, last one is trump.
        // Usually deck is [top ... bottom(trump)]

        // draw() removes from top (shift)
        // If I draw 19 times, 1 card left (trump)

        const lastCard = talon.draw(); // The trump card
        expect(lastCard).toBeDefined();
        expect(talon.getSize()).toBe(0);
        expect(talon.getState()).toBe(TALON_EXHAUSTED);

        const noCard = talon.draw();
        expect(noCard).toBeNull();
    });

    it('should exchange trump jack correctly', () => {
        // We need to construct a specific deck to test this deterministicly
        // Let's make a mock deck
        const trumpCard = { suit: HEARTS, rank: ACE };
        const jackCard = { suit: HEARTS, rank: JACK };
        const otherCard = { suit: HEARTS, rank: 'TEN' as const };

        const deck = [otherCard, trumpCard]; // trumpCard is at bottom

        const customTalon = new Talon(deck);
        expect(customTalon.getTrumpCard()).toEqual(trumpCard);

        const returnedTrump = customTalon.exchangeTrumpJack(jackCard);

        expect(returnedTrump).toEqual(trumpCard);
        expect(customTalon.getTrumpCard()).toEqual(jackCard);

        // Verify the bottom card is indeed the Jack now
        // Draw the top card
        customTalon.draw(); // otherCard
        // Draw the bottom card
        const bottomCard = customTalon.draw();
        expect(bottomCard).toEqual(jackCard);
    });

    it('should close talon correctly', () => {
        talon.close();
        expect(talon.getState()).toBe(TALON_CLOSED);
    });

    it('should not allow closing with too few cards', () => {
        // Draw until 1 card left
        for (let i = 0; i < 19; i++) talon.draw();

        expect(talon.canClose()).toBe(false);
        expect(() => talon.close()).toThrow();
    });

    it('should not allow closing with exactly 2 cards remaining', () => {
        // Draw 18 cards (leaving 2)
        for (let i = 0; i < 18; i++) talon.draw();
        
        expect(talon.getSize()).toBe(2);
        expect(talon.canClose()).toBe(false);
    });
});
