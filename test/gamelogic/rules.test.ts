import { describe, it, expect } from 'vitest';
import {
    getValidPlays,
    isValidPlay,
    calculateHandResult,
    canDeclareMarriage
} from '../../src/gamelogic/rules.js';
import { PlayerState } from '../../src/gamelogic/player-state.js';
import {
    TALON_OPEN,
    TALON_CLOSED,
    TALON_EXHAUSTED,
    HEARTS,
    SPADES,
    CLUBS,
    ACE,
    TEN,
    KING,
    QUEEN,
    JACK,
    PLAYER_HUMAN,
    Card
} from '../../src/gamelogic/types.js';

describe('Rules', () => {
    const aceHearts = { suit: HEARTS, rank: ACE } as const;
    const tenHearts = { suit: HEARTS, rank: TEN } as const;
    const kingHearts = { suit: HEARTS, rank: KING } as const;
    const jackHearts = { suit: HEARTS, rank: JACK } as const;

    const aceSpades = { suit: SPADES, rank: ACE } as const;
    const jackSpades = { suit: SPADES, rank: JACK } as const;

    const kingClubs = { suit: CLUBS, rank: KING } as const;

    const hand1 = [aceHearts, jackHearts, aceSpades, kingClubs];

    describe('getValidPlays - Talon Open', () => {
        it('allows any card when following suit is not required (talon open)', () => {
            // Lead: Spade. Hand has Spade and other suits. Talon Open.
            const valid = getValidPlays(hand1, jackSpades, TALON_OPEN, CLUBS);
            // Expect all cards to be valid
            expect(valid).toHaveLength(4);
        });
    });

    describe('getValidPlays - Talon Closed (Strict Rules)', () => {
        it('must follow suit if possible', () => {
            // Lead: Heart. Hand has Hearts.
            const valid = getValidPlays(hand1, tenHearts, TALON_CLOSED, CLUBS);

            // Should return only Hearts
            const hearts = valid.filter(c => c.suit === HEARTS);
            expect(hearts.length).toBe(valid.length);
            expect(hearts.length).toBeGreaterThan(0);
            expect(hearts.length).toBe(1); // Only Ace is valid because it wins, Jack loses
            expect(valid).toContain(aceHearts);
            expect(valid).not.toContain(jackHearts);
            expect(valid).not.toContain(aceSpades);
        });

        it('must head the trick if possible', () => {
            // Lead: Ten Hearts. Hand has Ace Hearts (winning) and Jack Hearts (losing).
            // Hand: Ace H, Jack H, Ace S, King C.
            // Must play Ace Hearts to win.
            const valid = getValidPlays(hand1, tenHearts, TALON_CLOSED, CLUBS);

            expect(valid).toHaveLength(1);
            expect(valid[0]).toEqual(aceHearts);
        });

        it('allows playing lower same suit if cannot win', () => { // Wait, rule is "must head trick IF POSSIBLE". If not possible, just follow suit.
            // Lead: Ace Hearts. Hand has Ten Hearts (losing) and Jack Hearts (losing).
            // Opponent plays Ace. You have 10, J. 
            // You cannot win. Must follow suit. Both valid?
            // Yes.

            const losingHand = [tenHearts, jackHearts, aceSpades];
            const valid = getValidPlays(losingHand, aceHearts, TALON_CLOSED, CLUBS);

            expect(valid).toHaveLength(2);
            expect(valid).toContain(tenHearts);
            expect(valid).toContain(jackHearts);
        });

        it('must trump if cannot follow suit', () => {
            // Lead: Spade. Hand: [Hearts(Trump), Clubs]. No Spades.
            const trumpHand = [aceHearts, kingClubs];
            const valid = getValidPlays(trumpHand, aceSpades, TALON_CLOSED, HEARTS); // Hearts is trump

            expect(valid).toHaveLength(1);
            expect(valid[0]).toEqual(aceHearts); // Must play trump
        });

        it('allows any card if cannot follow suit or trump', () => {
            // Lead: Spade. Hand: [Diamonds], no Trumps.
            // Assuming hand has only clubs (non-trump)
            const weakHand = [kingClubs];
            const valid = getValidPlays(weakHand, aceSpades, TALON_CLOSED, HEARTS);

            expect(valid).toHaveLength(1);
            expect(valid[0]).toEqual(kingClubs);
        });
    });

    describe('calculateHandResult', () => {
        it('awards 1 point for normal win', () => {
            const result = calculateHandResult(PLAYER_HUMAN, 40, 2, false, false);
            expect(result.pointsWon).toBe(1);
        });

        it('awards 2 points for Schneider (<33)', () => {
            const result = calculateHandResult(PLAYER_HUMAN, 30, 2, false, false);
            expect(result.pointsWon).toBe(2);
        });

        it('awards 3 points for Schwarz (0 tricks)', () => {
            const result = calculateHandResult(PLAYER_HUMAN, 0, 0, false, false);
            expect(result.pointsWon).toBe(3);
        });
    });

    describe('canDeclareMarriage', () => {
        it('should return false if player has not won any tricks', () => {
            const player = new PlayerState(PLAYER_HUMAN);
            player.addCards([{ suit: HEARTS, rank: KING }, { suit: HEARTS, rank: QUEEN }]);

            expect(canDeclareMarriage(player, HEARTS)).toBe(false);
        });

        it('should return true if player has won a trick', () => {
            const player = new PlayerState(PLAYER_HUMAN);
            player.addCards([{ suit: HEARTS, rank: KING }, { suit: HEARTS, rank: QUEEN }]);
            player.incrementTricksWon();
            
            expect(canDeclareMarriage(player, HEARTS)).toBe(true);
        });
    });
});
