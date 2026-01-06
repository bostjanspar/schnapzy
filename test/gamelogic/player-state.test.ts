import { describe, it, expect, beforeEach } from 'vitest';
import { PlayerState } from '../../src/gamelogic/player-state.js';
import { PLAYER_ONE, HEARTS, SPADES, KING, QUEEN, ACE } from '../../src/gamelogic/types.js';

describe('PlayerState', () => {
    let player: PlayerState;
    const kingHearts = { suit: HEARTS, rank: KING } as const;
    const queenHearts = { suit: HEARTS, rank: QUEEN } as const;
    const aceSpades = { suit: SPADES, rank: ACE } as const;

    beforeEach(() => {
        player = new PlayerState(PLAYER_ONE);
    });

    it('should initialize with empty hand and 0 points', () => {
        expect(player.getHand()).toHaveLength(0);
        expect(player.getTotalPoints()).toBe(0);
        expect(player.getTricksWon()).toBe(0);
    });

    it('should add cards to hand', () => {
        player.addCards([kingHearts, queenHearts]);
        expect(player.getHand()).toHaveLength(2);
        expect(player.hasCard(kingHearts)).toBe(true);
    });

    it('should remove cards from hand', () => {
        player.addCards([kingHearts, queenHearts]);
        player.removeCard(kingHearts);

        expect(player.getHand()).toHaveLength(1);
        expect(player.hasCard(kingHearts)).toBe(false);
        expect(player.hasCard(queenHearts)).toBe(true);
    });

    it('should track points correctly', () => {
        player.addTrickPoints(10);
        player.addMarriagePoints(20);

        expect(player.getTrickPoints()).toBe(10);
        expect(player.getMarriagePoints()).toBe(20);
        expect(player.getTotalPoints()).toBe(30);
    });

    it('should identify marriages correctly', () => {
        player.addCards([kingHearts, queenHearts, aceSpades]);

        expect(player.hasMarriage(HEARTS)).toBe(true);
        expect(player.hasMarriage(SPADES)).toBe(false);

        const marriages = player.getAvailableMarriages();
        expect(marriages).toEqual([HEARTS]);
    });
});
