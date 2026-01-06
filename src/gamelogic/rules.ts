import {
    TALON_OPEN,
} from './types.js';
import type {
    Card,
    Suit,
    TalonState,
    HandResult,
    Player,
} from './types.js';
import { cardsEqual } from './card.js';
import { PlayerState } from './player-state.js';

/**
 * Determines which cards from a player's hand are valid to play.
 * @param hand Player's current hand
 * @param leadCard Card led by opponent (null if player is leading)
 * @param talonState Current state of talon
 * @param trumpSuit The game's trump suit
 * @returns Array of valid cards
 */
export function getValidPlays(
    hand: Card[],
    leadCard: Card | null,
    talonState: TalonState,
    trumpSuit: Suit
): Card[] {
    // If leading, any card is valid
    if (!leadCard) {
        return [...hand];
    }

    // If following with open talon (and not exhausted), any card is valid.
    // Exception: If talon is exhausted, strict rules apply.
    if (talonState === TALON_OPEN) {
        return [...hand];
    }

    // Strict rules (Talon Closed or Exhausted):
    // 1. Must follow suit
    // 2. Must win trick if possible (play higher card of same suit)
    // 3. Must trump if cannot follow suit
    // 4. Any card if cannot follow suit or trump (wait, standard Schnapsen rules say just follow suit and head trick if possible, or trump if void in suit)

    // Actually, standard Schnapsen/66 rules for strict play:
    // "You must follow suit. If you can, you must play a higher card to win the trick.
    // If you cannot follow suit, you must play a trump card.
    // If you cannot follow suit and have no trumps, you can play any card."

    // Let's implement strict rules step-by-step:

    // 1. Check for same suit cards
    const sameSuitCards = hand.filter((c) => c.suit === leadCard.suit);

    if (sameSuitCards.length > 0) {
        // Must follow suit.
        // Must try to head the trick (play higher rank)

        // Check for higher cards
        // To check rank value, we need rank comparison
        // We already have compareCards in card.ts, but that's for sorting (Ace > Ten)
        // Here we need numeric comparison
        // Wait, rank values: Ace=11, Ten=10, King=4, Queen=3, Jack=2
        // But for winning the trick - YES, higher rank value (Ace > Ten > King...)
        // Actually, compareCards uses: Ace=4, Ten=3, etc... so compareCards(a,b) > 0 means a is higher.

        // But `compareCards` logic was: rankOrder[a] - rankOrder[b] where Ace=4, Ten=3.
        // So yes, we can use `compareCards`.

        // Re-importing evaluate/compare helpers might be circular if not careful.
        // Let's implement local comparison or assume imported helpers work.
        // I can assume standard logical comparison.

        // Find higher cards
        // We need to compare specific rank values for "heading the trick". 
        // Ace(11) > Ten(10) > King(4) > Queen(3) > Jack(2).
        // Standard card order: A, 10, K, Q, J.

        // Let's just return all same suit cards for now? 
        // Rule: "If possible, a player must head the trick."
        // This implies if you have a higher card, you MUST play it? 
        // Or just "You must play a card that wins the trick"? i.e. strict compulsion to win.

        // Official Schnapsen: "You must follow suit. Additionally, you are compelled to win the trick: if you have a higher card of the led suit, you must play it. If you cannot follow suit, you must trumpet. If you must trumpet and have multiple trumps, you are not compelled to overtrump (since you weren't following suit), but usually simply 'trump' is the requirement."

        // Wait, "compelled to win the trick" applies to following suit? Yes.

        const higherCards = sameSuitCards.filter(c => isRankHigher(c.rank, leadCard.rank));
        if (higherCards.length > 0) {
            return higherCards;
        }

        // Cannot win but must follow suit -> return all same suit cards (which are lower)
        return sameSuitCards;
    }

    // 2. Cannot follow suit. Must play trump?
    const trumps = hand.filter(c => c.suit === trumpSuit);
    if (trumps.length > 0) {
        // Must play trump.
        // Is there a requirement to "overtrump" if the lead card was a trump?
        // Logic above "follow suit" handles lead card being trump.
        // Here, lead card is NOT trump (since we checked sameSuitCards and found none, implies lead was not trump or we just have no trumps if lead was trump... wait).

        // If lead card IS trump, sameSuitCards would be trumps. 
        // So this block is reached only if lead card is NOT trump.
        // So we just play any trump.
        return trumps;
    }

    // 3. Cannot follow suit, no trumps. Any card valid.
    return [...hand];
}

function isRankHigher(rankA: string, rankB: string): boolean {
    const order = { 'ACE': 4, 'TEN': 3, 'KING': 2, 'QUEEN': 1, 'JACK': 0 };
    return order[rankA as keyof typeof order] > order[rankB as keyof typeof order];
}

export function getPlayValidity(
    card: Card,
    hand: Card[],
    leadCard: Card | null,
    talonState: TalonState,
    trumpSuit: Suit
): string | null {
    if (!hand.some((c) => cardsEqual(c, card))) {
        return "Card not in hand";
    }

    if (!leadCard) return null;
    if (talonState === TALON_OPEN) return null;

    // Strict Rules (Talon Closed or Exhausted)
    const sameSuitCards = hand.filter((c) => c.suit === leadCard.suit);
    
    // 1. Must follow suit
    if (sameSuitCards.length > 0) {
        if (card.suit !== leadCard.suit) {
            return "Must follow suit";
        }

        // 2. Must head the trick if possible
        const higherCards = sameSuitCards.filter(c => isRankHigher(c.rank, leadCard.rank));
        if (higherCards.length > 0) {
            if (!isRankHigher(card.rank, leadCard.rank)) {
                return "Must head the trick";
            }
        }
        return null;
    }

    // 2. Must play trump if cannot follow suit
    const trumps = hand.filter(c => c.suit === trumpSuit);
    if (trumps.length > 0) {
        if (card.suit !== trumpSuit) {
            return "Must play trump";
        }
    }

    // 3. Any card valid
    return null;
}

export function isValidPlay(
    card: Card,
    hand: Card[],
    leadCard: Card | null,
    talonState: TalonState,
    trumpSuit: Suit
): boolean {
    return getPlayValidity(card, hand, leadCard, talonState, trumpSuit) === null;
}

export function canDeclareMarriage(
    player: PlayerState,
    suit: Suit
): boolean {
    // Basic check: Does player have King + Queen?
    if (!player.hasMarriage(suit)) {
        return false;
    }

    // Rule: Marriage validation forbidden until player wins >= 1 trick.
    if (!player.hasWonTrick()) {
        return false;
    }

    // Must be on lead (checked by caller usually, but logic here assumes we ask "Can I declare now?" implies it's my turn)
    // We assume caller checks if it is player's turn to LEAD.

    return true;
}

export function calculateHandResult(
    winner: Player,
    opponentPoints: number,
    opponentTricks: number,
    _wasClosed: boolean,
    _closerFailed: boolean
): HandResult {
    // Game points:
    // 3 points (Schwarz): Opponent has 0 tricks.
    // 2 points (Schneider): Opponent has < 33 points.
    // 1 point: Opponent has 33+ points.

    let pointsWon = 1;

    if (opponentTricks === 0) {
        pointsWon = 3;
    } else if (opponentPoints < 33) {
        pointsWon = 2;
    }

    // Special rules overlap?

    return {
        winner,
        pointsWon,
        opponentPoints,
        opponentTricks,
    };
}
