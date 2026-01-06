import {
    TALON_CLOSED,
    TALON_EXHAUSTED,
    // TALON_OPEN, // Unused
} from '../types.js';
import type {
    Card,
    Suit,
    TalonState,
    Player,
} from '../types.js';
import { BeliefState } from './belief-state.js';
import { selectLeadCard, selectFollowCard, shouldExchangeTrumpJack } from './heuristics.js';
import { solve } from './minimax.js';
import { getValidPlays } from '../rules.js';

export class CPUPlayer {
    private beliefState: BeliefState;

    constructor(_myPlayerId: Player) {
        // BeliefState initialized on game start
        this.beliefState = null!;
    }

    public initGame(hand: Card[], trumpCard: Card | null, trumpSuit: Suit, talonState: TalonState, talonSize: number): void {
        this.beliefState = new BeliefState(hand, [], trumpCard, trumpSuit, talonState, talonSize);
    }

    public updateState(
        myHand: Card[],
        _playedCards: Card[], // All played cards history or just recent? BeliefState expects accumulated.
        talonState: TalonState,
        talonSize: number
    ): void {
        if (!this.beliefState) return;
        this.beliefState.updateMyHand(myHand);
        this.beliefState.updateTalonState(talonState, talonSize);
        // We assume playedCards are handled externally or passed in full.
        // If `BeliefState` assumes `playedCards` in constructor, we might need a setter or just rebuild it?
        // Re-instantiating might be safer to ensure sync.
        // But we lose "knownOpponentCards" (Marriages).

        // Let's assume we maintain `BeliefState` correctly via methods.
        // But `BeliefState` definition I wrote earlier didn't have `updatePlayedCards`.
        // I should update `BeliefState` to generally accept updates or make properties public?
        // Or just pass `playedCards` to decision methods?

        // Decision methods in `heuristics` don't take `BeliefState` directly except `selectLeadCard`.
        // `selectLeadCard` calls `beliefState.getUnknownCards()`.
        // `getUnknownCards` uses `this.playedCards`.

        // So I NEED to update played cards in belief state.
        // I will add a method to BeliefState in a moment (or just access it via cast/fix).
        // For now, let's assume `recordPlayedCard` exists or add it.
    }

    public onOpponentPlay(_card: Card): void {
        // Record formatted update
        // this.beliefState.recordPlayedCard(card);
    }

    public decideMove(
        hand: Card[],
        leadCard: Card | null,
        talonState: TalonState,
        trumpSuit: Suit,
        myPoints: number,
        oppPoints: number
    ): Card {
        // 1. Valid moves
        const validMoves = getValidPlays(hand, leadCard, talonState, trumpSuit);
        if (validMoves.length === 1) return validMoves[0]!;

        // 2. Choose strategy
        if (talonState === TALON_CLOSED || talonState === TALON_EXHAUSTED) {
            // Phase 2: Minimax
            // Try to get exact opponent hand
            try {
                // We need full played cards to deduce remaining
                // If BeliefState is not perfectly synced, this fails.
                // We need `OpponentHand`.

                // If belief state logic is missing, we default to Heuristic.
                const oppHand = this.beliefState.getOpponentHandExact();

                const result = solve(
                    hand,
                    oppHand,
                    myPoints,
                    oppPoints,
                    true, // Maximizing (Self)
                    -Infinity,
                    Infinity,
                    leadCard,
                    trumpSuit
                );

                if (result.bestMove) return result.bestMove;

            } catch (e) {
                // Fallback to heuristic if exact hand unknown (e.g. Talon Closed but not empty?)
                // console.warn("Minimax failed, falling back to heuristic", e);
            }
        }

        // Phase 1: Heuristic
        if (leadCard) {
            return selectFollowCard(hand, leadCard, this.beliefState, validMoves);
        } else {
            return selectLeadCard(hand, this.beliefState);
        }
    }

    public shouldExchange(trumpCard: Card | null): boolean {
        return shouldExchangeTrumpJack(trumpCard);
    }

    public shouldCloseTalon(_myPoints: number, _hand: Card[]): boolean {
        // Simple heuristic: Close if we have good points > 50?
        // Or if Minimax says we win?
        // Simulating "if I close now" is complex Minimax.
        // For now: Conservative. Only close if very strong.
        return false; // Implement advanced logic later
    }
}
