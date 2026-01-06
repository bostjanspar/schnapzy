import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hand } from '../../src/gamelogic/hand.js';
import { PLAYER_HUMAN, PLAYER_CPU, CLUBS, HEARTS, SPADES, DIAMONDS, JACK, ACE, TEN, KING, QUEEN, Card } from '../../src/gamelogic/types.js';

describe('Hand Orchestration', () => {
    let hand: Hand;

    beforeEach(() => {
        hand = new Hand(PLAYER_HUMAN);
    });

    it('should initialize correctly', () => {
        expect(hand.dealer).toBe(PLAYER_HUMAN);
        expect(hand.leadPlayer).toBe(PLAYER_CPU);
        expect(hand.turnPlayer).toBe(PLAYER_CPU);
        expect(hand.players.get(PLAYER_HUMAN)!.getHand()).toHaveLength(5);
        expect(hand.players.get(PLAYER_CPU)!.getHand()).toHaveLength(5);
        expect(hand.talon.getSize()).toBe(10); // 20 - 10 dealt
        expect(hand.currentTrick).toBeDefined();
    });

    it('should allow playing a valid card', () => {
        const player = hand.turnPlayer;
        const pState = hand.players.get(player)!;
        const cardToPlay = pState.getHand()[0];

        const result = hand.playCard(player, cardToPlay);

        expect(result.trickCompleted).toBe(false);
        expect(hand.turnPlayer).not.toBe(player); // Turn passes
        expect(pState.getHand()).not.toContain(cardToPlay);
    });

    it('should complete a trick when second player plays', () => {
        // Mock getValidPlays to allow any play for testing flow?
        // Or just pick valid cards. Talon is open initially, so any card valid.

        const leader = hand.turnPlayer; // CPU
        const follower = hand.dealer; // Human

        const p2Card = hand.players.get(leader)!.getHand()[0];
        hand.playCard(leader, p2Card);

        expect(hand.turnPlayer).toBe(follower);

        const p1Card = hand.players.get(follower)!.getHand()[0];
        const result = hand.playCard(follower, p1Card);

        expect(result.trickCompleted).toBe(true);
        expect(result.result).toBeDefined();

        // Check cards drawn (talon open)
        // Hand size should restore to 5
        expect(hand.players.get(leader)!.getHand()).toHaveLength(5);
        expect(hand.players.get(follower)!.getHand()).toHaveLength(5);
    });

    it('should prevent acting out of turn', () => {
        const wrongPlayer = hand.dealer; // Human (turn is CPU)
        const card = hand.players.get(wrongPlayer)!.getHand()[0];

        expect(() => hand.playCard(wrongPlayer, card)).toThrow("Not your turn");
    });

    it('should return explanation when play is invalid via canPlayerPlayCard', () => {
        const wrongPlayer = hand.dealer; // Human (turn is CPU)
        const card = hand.players.get(wrongPlayer)!.getHand()[0];

        const reason = hand.canPlayerPlayCard(wrongPlayer, card);
        expect(reason).toBe("Not your turn");
    });

    // TODO: More complex scenarios (marriage, closing) requires strict state setup
    // For now validating basic flow.
});
