import type { Card, Suit, TalonState } from './types.js';
import { CPUPlayer } from './cpu/cpu-player.js';
import { selectLeadCard, selectFollowCard } from './cpu/heuristics.js';
import { BeliefState } from './cpu/belief-state.js';
import { getValidPlays } from './rules.js';

// Type definitions for Hint
export interface Hint {
    card: Card;
    reason: string;
    confidence: number; // 0-1
}

export class HintSystem {
    // private cpuPlayer: CPUPlayer; // Unused for now


    constructor() {
        // We reuse CPU logic but purely for suggestion
        // We need a CPUPlayer instance to hold belief state? 
        // Or just use the static logic?
        // CPUPlayer holds state. We want to suggest based on CURRENT game state.
        // So we need to feed current game state to a temporary CPU/BeliefState.
        // Or the Game UI maintains a "Helper CPU" instance?

        // Simplest: Create a throwaway BeliefState and call heuristic functions.
        // CPUPlayer class is stateful.
    }

    public getHint(
        hand: Card[],
        playedCards: Card[],
        talonState: TalonState,
        talonSize: number,
        trumpSuit: Suit,
        trumpCard: Card | null,
        leadCard: Card | null,
        myPoints: number,
        oppPoints: number
    ): Hint {
        // 1. Build Belief State
        const beliefState = new BeliefState(
            hand,
            playedCards,
            trumpCard,
            trumpSuit,
            talonState,
            talonSize
        );

        // 2. Get AI Decision
        let suggestedCard: Card;
        let reason = "AI Suggestion";

        // We can invoke `CPUPlayer` logic if we refactored it to be stateless/pure or instantiate it.
        // Let's use Heuristics directly for Phase 1 as it's easier to verify.

        if (leadCard) {
            const validMoves = getValidPlays(hand, leadCard, talonState, trumpSuit);
            suggestedCard = selectFollowCard(hand, leadCard, beliefState, validMoves);
            reason = "Best follow response";
        } else {
            suggestedCard = selectLeadCard(hand, beliefState);
            reason = "Best calculated lead";
        }

        // 3. Generate explanation
        // Heuristic functions don't return reason strings currently.
        // We could match the card against specific heuristic checks to generate text.

        return {
            card: suggestedCard,
            reason: reason,
            confidence: 0.8 // Dummy confidence
        };
    }
}
