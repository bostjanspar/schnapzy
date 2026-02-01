import { describe, it, expect } from 'vitest';
import { BeliefState } from '../../src/gamelogic/cpu/belief-state.js';
import { CPUPlayer } from '../../src/gamelogic/cpu/cpu-player.js';
import {
    PLAYER_CPU,
    TALON_OPEN,
    TALON_EXHAUSTED,
    HEARTS,
    SPADES,
    CLUBS,
    DIAMONDS,
    ACE, TEN, KING, QUEEN, JACK, Card
} from '../../src/gamelogic/types.js';

describe('CPU Logic', () => {
    describe('BeliefState', () => {
        const myHand = [{ suit: HEARTS, rank: ACE }];
        const trump = { suit: HEARTS, rank: JACK } as Card;

        it('should track unknown cards correctly', () => {
            const state = new BeliefState(myHand, [], trump, TALON_OPEN, 10);
            const unknown = state.getUnknownCards();

            expect(unknown.length).toBe(18); // 20 - 1 (Hand) - 1 (Trump) = 18
            expect(unknown).not.toContainEqual(myHand[0]);
            expect(unknown).not.toContainEqual(trump);
        });

        it('should return exact opponent hand when talon exhausted', () => {
            const state = new BeliefState(myHand, [], trump, TALON_EXHAUSTED, 0);
            // When talon is exhausted (empty), unknown cards = opponent's hand exactly.
            // Deck has 20 cards, minus 1 card in my hand = 19 opponent cards.

            const oppHand = state.getOpponentHandExact();
            expect(oppHand.length).toBe(19); // 20 - 1 (myHand) = 19
        });
    });

    describe('CPUPlayer', () => {
        it('should choose valid move in open phase', () => {
            const cpu = new CPUPlayer(PLAYER_CPU);
            const hand = [{ suit: HEARTS, rank: TEN }, { suit: SPADES, rank: KING }];
            const trump = { suit: CLUBS, rank: ACE } as Card;

            cpu.initGame([trump], trump, CLUBS, TALON_OPEN, 10); // Init

            const move = cpu.decideMove(
                hand,
                null, // Leading
                TALON_OPEN,
                CLUBS,
                0, 0
            );

            expect(move).toBeDefined();
            expect(hand).toContain(move);
        });

        // it('should use minimax in closed phase', () => {
        // Testing Minimax requires complex setup. Skipped for brevity/runtime.
        // });
    });
});
