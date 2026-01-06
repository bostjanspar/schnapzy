import { describe, it, expect } from 'vitest';
import { Game } from '../../src/gamelogic/game.js';
import { CPUPlayer } from '../../src/gamelogic/cpu/cpu-player.js';
import {
    PLAYER_ONE,
    PLAYER_TWO,
    IN_PROGRESS,
    GAME_OVER,
    Card,
    getOpponent,
    HAND_COMPLETE
} from '../../src/gamelogic/types.js';

describe('Schnapsen Full Game Integration', () => {
    it('should complete a hand with CPU vs Random play', () => {
        const game = new Game();
        game.startGame();

        const cpu = new CPUPlayer(PLAYER_TWO);
        const hand = game.getCurrentHand()!;

        // Init CPU knowledge
        const p2State = hand.players.get(PLAYER_TWO)!;
        cpu.initGame(
            p2State.getHand() as Card[],
            hand.talon.getTrumpCard()!,
            hand.talon.getTrumpSuit(),
            hand.talon.getState(),
            hand.talon.getSize()
        );

        let moves = 0;
        const maxMoves = 100; // Safety break

        while (game.getGamePhase() === IN_PROGRESS && moves < maxMoves) {
            const currentHand = game.getCurrentHand();
            if (!currentHand) break; // Hand finished

            if (currentHand.isCompleted) {
                // Should invoke processing
                game.processHandCompletion();
                if (game.getGamePhase() === HAND_COMPLETE) {
                    // Start next hand if not game over
                    // game.startNewHand(); // Test only checks one hand for brevity
                    break;
                }
                continue;
            }

            const turnPlayer = currentHand.turnPlayer;

            if (turnPlayer === PLAYER_ONE) {
                // P1 (Mock Opponent) just plays first valid card
                const p1Hand = currentHand.players.get(PLAYER_ONE)!.getHand();
                // We need valid play
                // If leading: any card.
                // If following: valid card.

                // Need to know lead card to validate play
                // But `game.playCard` delegates to `hand.playCard` which validates.
                // WE need to pick a valid card.
                const leadCard = currentHand.currentTrick?.getLeadPlayer() ?
                    currentHand.currentTrick.getCardPlayedBy(currentHand.currentTrick.getLeadPlayer()!) ?? null
                    : null;

                // Just try first card, if valid. If not, try next.
                // Or use `getValidPlays` helper if we export it? 
                // We do export it from rules.ts. but imports need to be correct.
                // Quick hack: try all cards.

                let moved = false;
                for (const card of p1Hand) {
                    try {
                        game.playCard(PLAYER_ONE, card);
                        moved = true;

                        // Update CPU knowledge of P1's move
                        cpu.onOpponentPlay(card);
                        break;
                    } catch (e) {
                        // Invalid move, try next
                    }
                }

                if (!moved) {
                    throw new Error("P1 has no valid moves?");
                }

            } else {
                // CPU Turn (P2)
                const p2Hand = currentHand.players.get(PLAYER_TWO)!.getHand() as Card[];

                const leadCard = currentHand.currentTrick?.getLeadPlayer() ?
                    currentHand.currentTrick.getCardPlayedBy(currentHand.currentTrick.getLeadPlayer()!) ?? null
                    : null;

                const move = cpu.decideMove(
                    p2Hand,
                    leadCard,
                    hand.talon.getState(),
                    hand.talon.getTrumpSuit(),
                    currentHand.players.get(PLAYER_TWO)!.getTotalPoints(),
                    currentHand.players.get(PLAYER_ONE)!.getTotalPoints()
                );

                game.playCard(PLAYER_TWO, move);

                // Update CPU knowledge of OWN move (if not auto-handled by CPU state maintenance)
                // CPUPlayer logic assumes it updates its own hand via updateState?
                // cpu.decideMove just returns card.
                // We need to sync state.

                // Update belief state
                // This is manual because we are simulating the Controller/UI
                const newP2Hand = currentHand.players.get(PLAYER_TWO)!.getHand() as Card[];
                cpu.updateState(
                    newP2Hand,
                    [], // Played cards history - simplified/omitted for test unless CPU relies on it strictly
                    hand.talon.getState(),
                    hand.talon.getSize()
                );
            }

            // If trick completed? 
            // `playCard` handles it.
            // If trick completed, `Hand` updates state, draws cards.

            moves++;
        }

        expect(moves).toBeLessThan(maxMoves);
        expect(game.getGamePhase() === HAND_COMPLETE || game.getGamePhase() === GAME_OVER).toBe(true);
    });
});
