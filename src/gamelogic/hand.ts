import {
    PLAYER_HUMAN,
    PLAYER_CPU,
    getOpponent,
} from './types.js';
import type {
    Card,
    Suit,
    Player,
    TrickResult,
    HandResult,
} from './types.js';
import { Talon } from './talon.js';
import { PlayerState } from './player-state.js';
import { Trick } from './trick.js';
import { createDeck, shuffleDeck } from './card.js';
import { isValidPlay, calculateHandResult, getPlayValidity } from './rules.js';



export class Hand {
    public talon: Talon;
    public players: Map<Player, PlayerState>;
    public currentTrick: Trick | null;
    public dealer: Player;
    public leadPlayer: Player; // Who leads the current trick
    public turnPlayer: Player; // Who is to act right now
    public isCompleted: boolean;
    public winner: Player | null; // Hand winner
    public closedBy: Player | null; // Who closed the talon
    public closedAtscore: number | null; // Opponent score when closed (for Viennese closing rule)

    // Viennese closing rule:
    // If I close, I must reach 66.
    // If I fail, opponent wins. 
    // Points awarded based on opponent's tricks/score AT THE MOMENT of closing?
    // No, points based on MY points at end?
    // Rule: "If the player who closed fails to reach 66, the opponent wins (3 points if closer has 0 tricks, else 2 points)."
    // Wait, standard closing penalty is opponent gets points based on CLOSER's status.
    // Actually, usually: If closer fails, opponent wins 2 points (or 3 if opponent had 0 tricks).
    // AND: Opponent wins based on THEIR score at end? No.

    // Implementation will delegate scoring to `calculateHandResult` in `rules.ts`.
    // Here we just track state.

    constructor(dealer: Player) {
        this.dealer = dealer;
        this.leadPlayer = getOpponent(dealer); // Non-dealer leads first trick
        this.turnPlayer = this.leadPlayer;
        this.isCompleted = false;
        this.winner = null;
        this.currentTrick = null;
        this.closedBy = null;
        this.closedAtscore = null;

        // 1. Create and shuffle deck
        const deck = shuffleDeck(createDeck());

        // 2. Initialize Talon
        // Talon constructor handles taking last card as trump
        // But we need to deal hands first? 
        // Standard deal: 3 cards each, then trump turned up?, then 2 cards each?
        // Or just 5 cards each then trump.
        // Result is the same for a shuffled deck.
        // Let's deal 5 to each, then create Talon from remainder.

        // Dealing 5 cards to each player (total 10)
        // Remaining 10 cards form the talon.
        const hand1Cards = deck.slice(0, 5);
        const hand2Cards = deck.slice(5, 10);
        const talonCards = deck.slice(10);

        this.talon = new Talon(talonCards);

        // 3. Initialize Players
        this.players = new Map();
        const p1State = new PlayerState(PLAYER_HUMAN);
        const p2State = new PlayerState(PLAYER_CPU);

        // Assign hands
        // Dealer is dealt to... usually opponent first?
        // Logic above dealt simply.
        // Let's assign correctly based on who is dealer if we care about "who got first card".
        // But simplified: P1 gets first 5, P2 gets next 5.

        // Assigning to correct player IDs
        // We just assume P1 and P2 exist.
        p1State.addCards(PLAYER_HUMAN === this.dealer ? hand2Cards : hand1Cards); // Non-dealer gets first batch?
        p2State.addCards(PLAYER_CPU === this.dealer ? hand2Cards : hand1Cards);
        // Actually, simplifiction: Just give hand1 to P1, hand2 to P2. Randomness is in shuffle.
        // Wait, `hand1Cards` assigned to P1State.
        // BUT we need `this.players` map.

        this.players.set(PLAYER_HUMAN, p1State); // Reset/New state
        this.players.set(PLAYER_CPU, p2State);

        // Adjust hands to ensure correct players got cards.
        // Implementation above:
        // P1 gets first 5.
        // P2 gets next 5.
        // If P1 is dealer, P2 led -> P2 received first? 
        // Doesn't matter for logic, only for simulation fidelity.
        // Hands are already assigned above.

        // 4. Start first trick
        this.startNewTrick(this.leadPlayer);
    }

    // =========================================================================
    // Game Actions
    // =========================================================================

    public playCard(player: Player, card: Card): { trickCompleted: boolean; result?: TrickResult } {
        this.validateAction(player);

        if (!this.currentTrick) {
            throw new Error("No active trick");
        }

        // Lead card logic handled inside validation or tricks
        // const leadCard = this.currentTrick.getCardPlayedBy(this.leadPlayer);
        // Wait, implementation of Trick in `trick.ts` handles lead vs follow internally?
        // Let's check `trick.ts`.
        // `trick.leadCard(player, card)` vs `trick.followCard(player, card)`
        // And `trick.getLeadPlayer()` returns lead player.

        // Validation using rules.ts
        const pState = this.players.get(player)!;
        const hand = pState.getHand(); // returns readonly Card[]
        // rules.isValidPlay expects Card[]

        // Determine lead card for validation
        // If I am leading, leadCard is null.
        // If I am following, lead card is valid.
        const validationLeadCard = this.currentTrick.getLeadPlayer() ?
            this.currentTrick.getCardPlayedBy(this.currentTrick.getLeadPlayer()!) ?? null
            : null;

        if (!isValidPlay(card, [...hand], validationLeadCard, this.talon.getState(), this.talon.getTrumpSuit())) {
            throw new Error(`Invalid play: ${card.rank} of ${card.suit}`);
        }

        // Execute Play
        pState.removeCard(card);

        if (!this.currentTrick.getLeadPlayer()) {
            this.currentTrick.leadCard(player, card);
            // Turn passes to opponent? 
            // No, in Schnapsen, trick consists of play-play.
            // Turn passes to other player to follow.
            this.turnPlayer = getOpponent(player);
            return { trickCompleted: false };
        } else {
            this.currentTrick.followCard(player, card);

            // Trick complete
            const result = this.currentTrick.complete();

            // Update game state
            this.handleTrickCompletion(result);

            return { trickCompleted: true, result };
        }
    }

    public canPlayerPlayCard(player: Player, card: Card): string {
        if (this.isCompleted) return "Hand is completed";
        if (player !== this.turnPlayer) return "Not your turn";

        const pState = this.players.get(player)!;
        const hand = pState.getHand();
        
        // Lead card
        const leadCard = this.currentTrick?.getLeadPlayer() ?
            this.currentTrick.getCardPlayedBy(this.currentTrick.getLeadPlayer()!) ?? null
            : null;

        const error = getPlayValidity(
            card,
            [...hand],
            leadCard,
            this.talon.getState(),
            this.talon.getTrumpSuit()
        );

        return error || "";
    }

    public declareMarriage(player: Player, suit: Suit): number {
        this.validateAction(player);

        const pState = this.players.get(player)!;
        // Validate
        // "Must be on lead" -> validated because it's their turn and trick is empty (start of trick)
        if (this.currentTrick!.getLeadPlayer()) {
            throw new Error("Cannot declare marriage when following.");
        }

        if (!pState.hasMarriage(suit)) {
            throw new Error("Player does not possess marriage.");
        }

        // Calculate points
        const isRoyal = suit === this.talon.getTrumpSuit();
        const points = isRoyal ? 40 : 20; // 40 for royal, 20 for common

        // Marriage logic:
        // Player shows both cards.
        // Player leads one of them.
        // Points only count if player wins at least one trick (checked at end of hand mostly, or tracked).
        // Standard: Points added immediately. 

        // WE DO NOT PLAY THE CARD HERE.
        // The action "Declare Marriage" usually implies playing one of the cards?
        // Standard UI: "Click Marriage Button" -> "Select Suit" -> "Select Card to Lead".
        // Or: "Play King" -> "Auto-detect Marriage possibility?"

        // Let's implement declaration as a state change update, but the user must still PLAY a card next.
        // OR: Input is `declareMarriage(player, suit, leadCard)`?
        // Let's modify: `declareMarriage` adds points. The NEXT action must be `playCard` with one of the marriage cards.
        // Enforcing playing marriage card:
        // We can just rely on the player to play it.
        // But strictly, declaring involves showing.

        pState.addMarriagePoints(points); // Add points immediately

        return points;
    }

    public exchangeTrumpJack(player: Player): void {
        this.validateAction(player);

        const pState = this.players.get(player)!;

        // Validate using Talon
        // Need Jack of Trumps
        const trumpSuit = this.talon.getTrumpSuit();
        const jackCard = pState.getHand().find(c => c.suit === trumpSuit && c.rank === 'JACK'); // Using 'JACK' string or import? JACK const imported. 
        // Imports need checking. JACK is exported from types.

        if (!jackCard) {
            throw new Error("Player does not have Trump Jack");
        }

        if (!this.talon.canExchange(jackCard)) {
            throw new Error("Cannot exchange Trump Jack (talon state or rules)");
        }

        // Execute exchange
        // Talon takes Jack, gives Trump.
        // Player hand swaps Jack for Trump.
        const newCard = this.talon.exchangeTrumpJack(jackCard); // Returns the old trump (e.g. Ace)

        pState.removeCard(jackCard);
        pState.addCards([newCard]);
    }

    public closeTalon(player: Player): void {
        this.validateAction(player);

        // Can only close if on lead? 
        // Rule: "The player who has the lead... can close the talon."
        if (this.currentTrick!.getLeadPlayer()) {
            throw new Error("Cannot close talon when following.");
        }

        this.talon.close();
        this.closedBy = player;
        this.closedAtscore = this.players.get(getOpponent(player))!.getTotalPoints(); // Track opponent score for penalties?
        // Actually tracked for scoring logic later.
    }

    // =========================================================================
    // Internal Logic
    // =========================================================================

    private startNewTrick(leader: Player): void {
        this.leadPlayer = leader;
        this.turnPlayer = leader;
        this.currentTrick = new Trick(this.talon.getTrumpSuit());
        // Trick is ready for `leadCard`
    }

    private handleTrickCompletion(result: TrickResult): void {
        const winner = result.winner;
        const points = result.points;

        const winnerState = this.players.get(winner)!;
        winnerState.addTrickPoints(points);
        winnerState.incrementTricksWon();

        // Check for win condition (66 points)
        if (winnerState.getTotalPoints() >= 66) {
            // Hand over immediately if player claims it / auto-win
            // Usually player must "announce" 66.
            // For simplicity/AI: Auto-end if 66 reached?
            this.endHand(winner);
            return;
        }

        // Check for last trick win (if talon exhausted and all cards played)
        // If 5 cards in hand reduced to 0?
        // Wait, drawing happens AFTER trick.

        if (this.players.get(PLAYER_HUMAN)!.getHand().length === 0 && this.talon.getSize() === 0) {
            // Hand played out.
            // Winner of last trick wins the hand?
            // Rule: "If neither player reaches 66, the winner of the last trick wins the hand." (1 point)
            this.endHand(winner);
            return;
        }

        // Drawing phase (only if talon open)
        if (this.talon.getState() === 'TALON_OPEN' ||
            (this.talon.getState() === 'TALON_EXHAUSTED' && this.talon.getSize() > 0)) {
            // Wait, TALON_EXHAUSTED means empty already.
            // TalonState logic: 
            // OPEN = cards available.
            // EXHAUSTED = empty.
            // CLOSED = closed by player.

            if (this.talon.getState() === 'TALON_OPEN') {
                this.drawCards(winner);
            }
        }

        // Start next trick
        // Winner leads
        if (!this.isCompleted) {
            this.startNewTrick(winner);
        }
    }

    private drawCards(winner: Player): void {
        const loser = getOpponent(winner);

        // Winner draws first
        const card1 = this.talon.draw();
        const card2 = this.talon.draw();

        if (card1) this.players.get(winner)!.addCards([card1]);
        if (card2) this.players.get(loser)!.addCards([card2]);

        // Note: Talon internal state updates to EXHAUSTED automatically if empty.
    }

    private validateAction(player: Player): void {
        if (this.isCompleted) throw new Error("Hand is completed");
        if (player !== this.turnPlayer) throw new Error("Not your turn");
    }

    private endHand(winner: Player): void {
        this.isCompleted = true;
        this.winner = winner;
        // Caller (Game) will handle calculating HandResult using rules.ts
    }

    public getResult(): HandResult | null {
        if (!this.isCompleted || !this.winner) return null;

        const loser = getOpponent(this.winner);
        const loserState = this.players.get(loser)!;

        // Need to handle "closer failed" case
        // If closedBy is NOT null, and winner is NOT closedBy -> Closer failed
        const closerFailed = (this.closedBy !== null && this.closedBy !== this.winner);

        return calculateHandResult(
            this.winner,
            loserState.getTotalPoints(),
            loserState.getTricksWon(),
            this.closedBy !== null,
            closerFailed
        );
    }
}
