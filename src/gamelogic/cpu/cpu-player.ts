import {
    TALON_CLOSED,
    TALON_EXHAUSTED,
    ACE, TEN, KING, QUEEN,
    // TALON_OPEN, // Unused
} from '../types.js';
import type {
    Card,
    Suit,
    TalonState,
    Player,
} from '../types.js';
import { getCardValue } from '../card.js';
import { BeliefState } from './belief-state.js';
import { selectLeadCard, selectFollowCard, shouldExchangeTrumpJack } from './heuristics.js';
import { solve } from './minimax.js';
import { getValidPlays } from '../rules.js';

export class CPUPlayer {
    private beliefState: BeliefState;

    constructor() {
        // BeliefState initialized on game start
        this.beliefState = null!;
    }

    public initGame(hand: Card[], trumpCard: Card | null, trumpSuit: Suit, talonState: TalonState, talonSize: number): void {
        this.beliefState = new BeliefState(hand, [], trumpCard, trumpSuit, talonState, talonSize);
    }

    public updateState(
        myHand: Card[],
        playedCards: Card[], // All played cards history
        talonState: TalonState,
        talonSize: number
    ): void {
        if (!this.beliefState) return;
        this.beliefState.updateMyHand(myHand);
        this.beliefState.updateTalonState(talonState, talonSize);
        this.beliefState.updatePlayedCards(playedCards);
    }

    public onOpponentPlay(card: Card): void {
        if (this.beliefState) {
            this.beliefState.recordPlayedCard(card);
        }
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

    public shouldCloseTalon(myPoints: number, hand: Card[]): boolean {
        if (!this.beliefState) return false;
        
        const trumpSuit = this.beliefState.getTrumpSuit();

        // Basic heuristic: Close if we have strong trumps and good points
        const trumps = hand.filter(c => c.suit === trumpSuit);
        const hasTrumpAce = trumps.some(c => c.rank === ACE);
        const hasTrumpTen = trumps.some(c => c.rank === TEN);
        const hasTrumpMarriage = trumps.some(c => c.rank === KING) && trumps.some(c => c.rank === QUEEN);

        // Calculate points in hand
        const handPoints = hand.reduce((sum, c) => sum + getCardValue(c), 0);

        // Strong enough to close?
        
        // Case 1: Trump Marriage (40 pts) - very strong position
        if (hasTrumpMarriage) return true;
        
        // Case 2: High score already and have a high trump to secure tricks
        if (myPoints > 45 && (hasTrumpAce || hasTrumpTen)) return true;

        // Case 3: 3+ trumps (likely to control game)
        if (trumps.length >= 3) return true;

        // Case 4: Enough points to win instantly if we win tricks (and we have a high trump)
        if (myPoints + handPoints >= 66 && (hasTrumpAce || hasTrumpTen)) return true;

        return false; 
    }
}
