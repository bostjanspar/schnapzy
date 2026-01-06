import { describe, it, expect, beforeEach } from 'vitest';
import { Game } from '../../src/gamelogic/game.js';
import {
    PLAYER_HUMAN,
    PLAYER_CPU,
    IN_PROGRESS,
    GAME_OVER,
    HAND_COMPLETE
} from '../../src/gamelogic/types.js';

describe('Game Orchestration', () => {
    let game: Game;

    beforeEach(() => {
        game = new Game();
    });

    it('should start a new game correctly', () => {
        game.startGame();

        expect(game.getGamePhase()).toBe(IN_PROGRESS);
        expect(game.getGamePoints(PLAYER_HUMAN)).toBe(7);
        expect(game.getGamePoints(PLAYER_CPU)).toBe(7);
        expect(game.getDealer()).toBe(PLAYER_HUMAN);
        expect(game.getCurrentHand()).toBeDefined();
    });

    it('should track points and rotate dealer across hands', () => {
        game.startGame();
        const hand1 = game.getCurrentHand()!;

        // Simulate P2 winning hand with 2 points
        // We can manually call 'processHandCompletion' if we mock Hand, 
        // or we just call 'handleHandResult' via private access/exposed method?
        // Or better: integrate enough to end logic.
        // Actually, `game.ts` has `handleHandResult` as private.
        // But `processHandCompletion` is public.
        // We can mock `currentHand.isCompleted` and `currentHand.getResult()`.

        // Let's use a spy on currentHand
        // This requires `game.currentHand` to be accessible or set.
        // It is private.
        // We can assume valid play loop triggers it.

        // OR: integration test style?
        // Let's use `vi.spyOn` if possible, but private property access is tricky in TS without @ts-ignore.

        // Simulating full flow is hard.
        // Let's just test public API state changes if possible.

        // Alternative: expose `handleHandResult` for testing? No (bad practice).
        // Let's rely on `processHandCompletion`.

        // Mock the hand result
        // We need to overwrite `currentHand` with a mock object or use valid Hand.
        // Using valid Hand requires playing 20+ cards.

        // Workaround: Use `(game as any).handleHandResult(...)`.

        (game as any).handleHandResult({
            winner: PLAYER_CPU,
            pointsWon: 2,
            opponentPoints: 0,
            opponentTricks: 0
        });

        expect(game.getGamePoints(PLAYER_CPU)).toBe(5); // 7 - 2
        expect(game.getGamePoints(PLAYER_HUMAN)).toBe(7);
        expect(game.getGamePhase()).toBe(HAND_COMPLETE);
        expect(game.getDealer()).toBe(PLAYER_CPU); // Rotated

        // Start next hand
        game.startNewHand();
        expect(game.getGamePhase()).toBe(IN_PROGRESS);
        expect(game.getCurrentHand()).toBeDefined();
    });

    it('should end game when points reach 0', () => {
        game.startGame();

        // P1 wins 7 points immediately (e.g. 3 + 3 + 1)
        (game as any).handleHandResult({
            winner: PLAYER_HUMAN,
            pointsWon: 7,
            opponentPoints: 0,
            opponentTricks: 0
        });

        expect(game.getGamePoints(PLAYER_HUMAN)).toBe(0);
        expect(game.getWinner()).toBe(PLAYER_HUMAN);
        expect(game.getGamePhase()).toBe(GAME_OVER);
    });

    it('should explain invalid move via canPlayerPlayCard', () => {
        game.startGame();
        const p1 = PLAYER_HUMAN;
        const hand = game.getCurrentHand()!;
        
        // Dealer is P1, so P2 leads. P1 moving is out of turn.
        const card = hand.players.get(p1)!.getHand()[0];
        const reason = game.canPlayerPlayCard(p1, card);
        expect(reason).toBe("Not your turn");
    });
});
