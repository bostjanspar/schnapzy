import type { Game } from '../gamelogic/game.js';
import type { Hand } from '../gamelogic/hand.js';
import type { Card, Player, Suit, TalonState, GamePhase } from '../gamelogic/types.js';
import { PLAYER_ONE, PLAYER_TWO } from '../gamelogic/types.js';

export interface IGameStateReader {
  // Game-level
  getGamePhase(): GamePhase;
  getGamePoints(player: Player): number;
  getDealer(): Player;
  isGameOver(): boolean;
  getWinner(): Player | null;
  
  // Hand-level
  hasActiveHand(): boolean;
  getTurnPlayer(): Player | null;
  getLeadPlayer(): Player | null;
  getTrumpSuit(): Suit | null;
  getTrumpCard(): Card | null;
  getTalonSize(): number;
  getTalonState(): TalonState | null;
  isHandCompleted(): boolean;
  
  // Player state
  getPlayerHand(player: Player): readonly Card[];
  getPlayerTrickPoints(player: Player): number;
  getPlayerTotalPoints(player: Player): number;
  getPlayerTricksWon(player: Player): number;
  
  // Current trick
  getCurrentTrickCards(): { player: Player; card: Card }[];
  
  // Validation (read-only check)
  canPlayerPlayCard(player: Player, card: Card): string;
}

export class GameStateReader implements IGameStateReader {
  private game: Game;
  
  constructor(game: Game) {
    this.game = game;
  }
  
  getGamePhase(): GamePhase {
    return this.game.getGamePhase();
  }
  
  getGamePoints(player: Player): number {
    return this.game.getGamePoints(player);
  }
  
  getDealer(): Player {
    return this.game.getDealer();
  }
  
  isGameOver(): boolean {
    return this.game.isGameOver();
  }
  
  getWinner(): Player | null {
    return this.game.getWinner();
  }
  
  hasActiveHand(): boolean {
    return this.game.getCurrentHand() !== null;
  }
  
  private getHand(): Hand | null {
    return this.game.getCurrentHand();
  }
  
  getTurnPlayer(): Player | null {
    return this.getHand()?.turnPlayer ?? null;
  }
  
  getLeadPlayer(): Player | null {
    return this.getHand()?.leadPlayer ?? null;
  }
  
  getTrumpSuit(): Suit | null {
    return this.getHand()?.talon.getTrumpSuit() ?? null;
  }
  
  getTrumpCard(): Card | null {
    return this.getHand()?.talon.getTrumpCard() ?? null;
  }
  
  getTalonSize(): number {
    return this.getHand()?.talon.getSize() ?? 0;
  }
  
  getTalonState(): TalonState | null {
    return this.getHand()?.talon.getState() ?? null;
  }
  
  isHandCompleted(): boolean {
    return this.getHand()?.isCompleted ?? false;
  }
  
  getPlayerHand(player: Player): readonly Card[] {
    const hand = this.getHand();
    if (!hand) return [];
    return hand.players.get(player)?.getHand() ?? [];
  }
  
  getPlayerTrickPoints(player: Player): number {
    const hand = this.getHand();
    if (!hand) return 0;
    return hand.players.get(player)?.getTrickPoints() ?? 0;
  }
  
  getPlayerTotalPoints(player: Player): number {
    const hand = this.getHand();
    if (!hand) return 0;
    return hand.players.get(player)?.getTotalPoints() ?? 0;
  }
  
  getPlayerTricksWon(player: Player): number {
    const hand = this.getHand();
    if (!hand) return 0;
    return hand.players.get(player)?.getTricksWon() ?? 0;
  }
  
  getCurrentTrickCards(): { player: Player; card: Card }[] {
    const hand = this.getHand();
    if (!hand || !hand.currentTrick) return [];
    
    const cards: { player: Player; card: Card }[] = [];
    const leadPlayer = hand.currentTrick.getLeadPlayer();
    
    if (leadPlayer) {
      const leadCard = hand.currentTrick.getCardPlayedBy(leadPlayer);
      if (leadCard) {
        cards.push({ player: leadPlayer, card: leadCard });
      }
    }
    
    // Check for follow card (opponent of leader)
    const players = [PLAYER_ONE, PLAYER_TWO];
    for (const p of players) {
      if (p !== leadPlayer) {
        const followCard = hand.currentTrick.getCardPlayedBy(p);
        if (followCard) {
          cards.push({ player: p, card: followCard });
        }
      }
    }
    
    return cards;
  }
  
  canPlayerPlayCard(player: Player, card: Card): string {
    return this.game.canPlayerPlayCard(player, card);
  }
}
