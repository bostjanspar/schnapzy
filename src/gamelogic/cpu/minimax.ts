import { TALON_CLOSED } from '../types.js';
import type { Card, Suit } from '../types.js';
import { getValidPlays } from '../rules.js';
import { getCardValue } from '../card.js';

// Note: Imports might need adjustment based on exact file structure.
// src/gamelogic/cpu/minimax.ts -> ../types.js

interface MinimaxResult {
    score: number; // Positive if maximizing player wins, negative if minimizing
    bestMove: Card | null;
}

/**
 * Minimax solver for endgame (Perfect Information).
 * 
 * @param cpuHand Cards held by CPU
 * @param oppHand Cards held by Opponent
 * @param cpuPoints Current game points (0-66) for CPU
 * @param oppPoints Current game points (0-66) for Opponent
 * @param isMaximizing True if it's CPU's turn to move
 * @param alpha Alpha-beta pruning
 * @param beta Alpha-beta pruning
 * @param leadCard The card led in the current trick (null if leading provided by isMaximizing logic? No, state tracking)
 *                 Actually, structure is better if we pass "who leads".
 *                 Simpler: "state" object.
 * @param trumpSuit The trump suit
 */
export function solve(
    cpuHand: Card[],
    oppHand: Card[],
    cpuPoints: number,
    oppPoints: number,
    isMaximizing: boolean,
    alpha: number,
    beta: number,
    leadCard: Card | null,
    trumpSuit: Suit
): MinimaxResult {
    // 1. Terminal State Checks

    // Check if someone reached 66
    if (cpuPoints >= 66) return { score: 1000, bestMove: null };
    if (oppPoints >= 66) return { score: -1000, bestMove: null };

    // Check if hands empty (Game Over by exhaustion)
    if (cpuHand.length === 0 && oppHand.length === 0) {
        // Last trick winner rule?
        // Usually handled by "points > opponent".
        // But if neither reached 66?
        // Rules say: Last trick winner (1 point).
        // Score difference?
        // Return heuristic score: (cpu - opp)
        return { score: cpuPoints - oppPoints, bestMove: null };
    }

    // 2. Move Generation

    let validMoves: Card[];
    const currentHand = isMaximizing ? cpuHand : oppHand;

    if (leadCard) {
        // Following
        validMoves = getValidPlays(currentHand, leadCard, TALON_CLOSED, trumpSuit);
    } else {
        // Leading
        validMoves = currentHand;
    }

    if (validMoves.length === 0) {
        // Should not happen if game not over
        return { score: 0, bestMove: null };
    }

    // 3. Search

    let bestScore = isMaximizing ? -Infinity : Infinity;
    let bestMove: Card | null = validMoves[0];

    for (const card of validMoves) {
        // Create new state
        // Remove card from hand
        // If following, resolve trick.
        // If leading, set leadCard.

        let newCpuHand = [...cpuHand];
        let newOppHand = [...oppHand];
        let newCpuPoints = cpuPoints;
        let newOppPoints = oppPoints;
        let nextIsMaximizing = !isMaximizing;
        let nextLeadCard: Card | null = null;

        if (isMaximizing) {
            newCpuHand = newCpuHand.filter(c => c !== card); // Assume exact ref or filter by logic
            // Using filter by ref might fail if copies. Using rank/suit filter usually safer.
            // But let's assume objects from same source.
            // Better: filter by value.
            newCpuHand = cpuHand.filter(c => c.suit !== card.suit || c.rank !== card.rank);
        } else {
            newOppHand = oppHand.filter(c => c.suit !== card.suit || c.rank !== card.rank);
        }

        if (leadCard) {
            // Trick complete
            const result = resolveTrick(leadCard, card, trumpSuit);
            const points = result.points;

            // Who played what?
            // leadCard played by previous player. card by current.
            // isMaximizing is current player.
            // If isMaximizing (CPU) is following:
            //    CPU played `card`. Opponent played `leadCard`.
            //    If `card` wins (result.winner === 'current'), CPU wins.
            //    If `result.winner === 'lead'`, Opponent wins.

            const cpuPlayed = isMaximizing ? card : leadCard;
            // logic: resolveTrick returns 'LEADER' or 'FOLLOWER'.
            // if isMaximizing (CPU) is FOLLOWER:
            //    winner=FOLLOWER -> CPU wins.
            //    winner=LEADER -> Opponent wins.

            const amIFollower = true; // Since leadCard exists
            const iAmCpu = isMaximizing;

            // Helper needed to determine absolute winner.
            const cpuWonTrick = (result.winner === 'FOLLOWER' && iAmCpu) ||
                (result.winner === 'LEADER' && !iAmCpu);

            if (cpuWonTrick) {
                newCpuPoints += points;
                nextIsMaximizing = true; // Winner leads next
            } else {
                newOppPoints += points;
                nextIsMaximizing = false; // Winner leads next
            }

            nextLeadCard = null; // Trick over, new lead

        } else {
            // Lead set
            nextLeadCard = card;
            // Turn passes to other player
            nextIsMaximizing = !isMaximizing;
        }

        // Recurring
        const result = solve(
            newCpuHand, newOppHand,
            newCpuPoints, newOppPoints,
            nextIsMaximizing,
            alpha, beta,
            nextLeadCard,
            trumpSuit
        );

        if (isMaximizing) {
            if (result.score > bestScore) {
                bestScore = result.score;
                bestMove = card;
            }
            alpha = Math.max(alpha, bestScore);
        } else {
            if (result.score < bestScore) {
                bestScore = result.score;
                bestMove = card;
            }
            beta = Math.min(beta, bestScore);
        }

        if (beta <= alpha) break;
    }

    return { score: bestScore, bestMove };
}

// Helper to resolve trick without full objects
function resolveTrick(lead: Card, follow: Card, trumpSuit: Suit): { points: number, winner: 'LEADER' | 'FOLLOWER' } {
    const points = getCardValue(lead) + getCardValue(follow);
    let winner: 'LEADER' | 'FOLLOWER' = 'LEADER';

    // Trump logic
    if (follow.suit === trumpSuit && lead.suit !== trumpSuit) {
        winner = 'FOLLOWER';
    } else if (follow.suit === lead.suit) {
        // Higher rank wins
        // Using getCardValue works for rank comparison?
        // Ace=11, Ten=10, King=4, Queen=3, Jack=2.
        // Yes, order is strictly by points basically.
        // wait, 10 > K. Yes.
        if (getCardValue(follow) > getCardValue(lead)) {
            winner = 'FOLLOWER';
        }
        // Note: if same value (impossible in valid deck unless cheat), leader wins tie.
    }

    return { points, winner };
}
