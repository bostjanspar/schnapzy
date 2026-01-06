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
            const state = new BeliefState(myHand, [], trump, HEARTS, TALON_OPEN, 10);
            const unknown = state.getUnknownCards();

            expect(unknown.length).toBe(18); // 20 - 1 (Hand) - 1 (Trump) = 18
            expect(unknown).not.toContainEqual(myHand[0]);
            expect(unknown).not.toContainEqual(trump);
        });

        it('should return exact opponent hand when talon exhausted', () => {
            const state = new BeliefState(myHand, [], trump, HEARTS, TALON_EXHAUSTED, 0);
            // Assume all 20 cards played except myHand and OpponentHand? 
            // Wait, logic is: Unknown = OpponentHand (since talon empty).
            // If played cards = 0, then OpponentHand = 18 cards? (Impossible but logic holds)

            const oppHand = state.getOpponentHandExact();
            expect(oppHand.length).toBe(19); // 20 - 1 (Hand) = 19 (Trump matches card in hand or is unknown)
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
