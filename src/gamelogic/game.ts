import {
    PLAYER_HUMAN,
    PLAYER_CPU,
    NOT_STARTED,
    IN_PROGRESS,
    HAND_COMPLETE,
    GAME_OVER,
    getOpponent,
} from './types.js';
import type {
    Player,
    GamePhase,
    Card,
    Suit,
    HandResult,
} from './types.js';
import { Hand } from './hand.js';
// import { HandResult } from './types.js'; // Duplicate removed

export class Game {
    private phase: GamePhase;
    private gamePoints: Map<Player, number>;
    private dealer: Player;
    private currentHand: Hand | null;
    private winner: Player | null; // Overall game winner

    constructor() {
        this.phase = NOT_STARTED;
        this.gamePoints = new Map();
        this.gamePoints.set(PLAYER_HUMAN, 7);
        this.gamePoints.set(PLAYER_CPU, 7);
        this.dealer = PLAYER_HUMAN; // Standard start
        this.currentHand = null;
        this.winner = null;
    }

    // =========================================================================
    // Game Flow
    // =========================================================================

    public startGame(): void {
        if (this.phase !== NOT_STARTED && this.phase !== GAME_OVER) {
            throw new Error("Game already in progress");
        }

        // Reset state
        this.phase = IN_PROGRESS;
        this.gamePoints.set(PLAYER_HUMAN, 7);
        this.gamePoints.set(PLAYER_CPU, 7);
        this.dealer = PLAYER_HUMAN;
        this.winner = null;

        this.startNewHand();
    }

    public startNewHand(): void {
        if (this.phase === GAME_OVER) {
            throw new Error("Game is over");
        }

        // Create new hand
        this.currentHand = new Hand(this.dealer);
        this.phase = IN_PROGRESS; // Ensure phase is correct
    }

    /**
     * Called to finalize a hand when it's completed (e.g. by playCard returning result or manual claim).
     * Usually invoked automatically if Hand logic detects end.
     * But `Hand` is just logic state. Who calls `game.endHand`?
     * The UI/Controller calling `hand.playCard` getting `result` should call this?
     * OR `playCard` here delegates and checks `hand.isCompleted`.
     */
    public processHandCompletion(): void {
        if (!this.currentHand || !this.currentHand.isCompleted) return;

        const result = this.currentHand.getResult();
        if (!result) return; // Should not happen if completed

        this.handleHandResult(result);
    }

    private handleHandResult(result: HandResult): void {
        const winner = result.winner;
        const pointsWon = result.pointsWon;

        const current = this.gamePoints.get(winner)!;
        const newPoints = Math.max(0, current - pointsWon);
        this.gamePoints.set(winner, newPoints);

        if (newPoints === 0) {
            this.winner = winner;
            this.phase = GAME_OVER;
            this.currentHand = null;
        } else {
            this.phase = HAND_COMPLETE;
            // Rotate dealer
            this.dealer = getOpponent(this.dealer);
            // Wait for explicit "startNextHand" or auto? 
            // Usually UI waits for user to click "Next Hand".

            this.currentHand = null; // Clean up old hand ref? Or keep for display?
            // Keep it until startNewHand is called?
            // If we null it, we lose display info.
            // Better keep it but mark phase HAND_COMPLETE.
        }
    }

    // =========================================================================
    // Actions (Delegating to Hand)
    // =========================================================================

    public playCard(player: Player, card: Card): void {
        this.validateAction();
        this.currentHand!.playCard(player, card);

        if (this.currentHand!.isCompleted) {
            this.processHandCompletion();
        }
    }

    public declareMarriage(player: Player, suit: Suit): number {
        this.validateAction();
        return this.currentHand!.declareMarriage(player, suit);
    }

    public exchangeTrumpJack(player: Player): void {
        this.validateAction();
        this.currentHand!.exchangeTrumpJack(player);
    }

    public closeTalon(player: Player): void {
        this.validateAction();
        this.currentHand!.closeTalon(player);
    }

    public canPlayerPlayCard(player: Player, card: Card): string {
        if (this.phase !== IN_PROGRESS || !this.currentHand) {
            return "No active hand in progress";
        }
        return this.currentHand.canPlayerPlayCard(player, card);
    }

    private validateAction(): void {
        if (this.phase !== IN_PROGRESS || !this.currentHand) {
            throw new Error("No active hand in progress");
        }
    }

    // =========================================================================
    // Queries
    // =========================================================================

    public getGamePhase(): GamePhase {
        return this.phase;
    }

    public getGamePoints(player: Player): number {
        return this.gamePoints.get(player) ?? 0;
    }

    public getWinner(): Player | null {
        return this.winner;
    }

    public getDealer(): Player {
        return this.dealer;
    }

    public getCurrentHand(): Hand | null {
        return this.currentHand;
    }

    // Backwards compatibility adapters for state machine
    public getCurrentDeal(): Hand | null {
        return this.getCurrentHand();
    }

    public isGameOver(): boolean {
        return this.phase === GAME_OVER;
    }
}
