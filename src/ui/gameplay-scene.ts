import { Container, Sprite, type Application } from 'pixi.js';
import { BaseScene } from './base-scene.js';
import { EventBus } from './event-bus.js';
import { GameScene } from './types.js';
import { GameTableLayout } from './game-table-layout.js';
import { CardAssets } from './card-assets.js';
import { LAYOUT, SCALE } from './layout-constants.js';
import type { IGameStateReader } from './game-state-reader.js';
import type { Card, Player } from '../gamelogic/types.js';

export interface GameplaySceneData {
  gameStateReader: IGameStateReader;
  onCardPlayed?: (card: Card) => void;
  onMarriageDeclared?: (suit: string) => void;
  onTalonClosed?: () => void;
  onTrumpExchanged?: () => void;
}

export class GameplayScene extends BaseScene {
  private tableLayout: GameTableLayout;
  private stateReader: IGameStateReader | null = null;
  private cardAssets: CardAssets;
  
  // Gameplay-specific containers (not in shared layout)
  private trickAreaContainer: Container;
  private cpuTrickPileContainer: Container;
  private playerTrickPileContainer: Container;
  
  // Action callbacks
  private onCardPlayed: ((card: Card) => void) | undefined;
  
  constructor(app: Application, eventBus: EventBus) {
    super(app, eventBus, GameScene.GAMEPLAY);
    this.tableLayout = new GameTableLayout(this.app);
    this.cardAssets = CardAssets.getInstance();
    
    this.trickAreaContainer = new Container();
    this.cpuTrickPileContainer = new Container();
    this.playerTrickPileContainer = new Container();
  }
  
  async init(): Promise<void> {
    await this.tableLayout.init();
    
    this.addChild(this.tableLayout);
    this.addChild(this.trickAreaContainer);
    this.addChild(this.cpuTrickPileContainer);
    this.addChild(this.playerTrickPileContainer);
    
    this.positionContainers();
    
    // Setup card click handler
    this.tableLayout.onCardClick = this.handleCardClick.bind(this);
    
    window.addEventListener('resize', this.handleResize);
  }
  
  private positionContainers(): void {
    const w = this.app.screen.width;
    const h = this.app.screen.height;
    const minDim = Math.min(w, h);
    const responsiveScale = minDim < 800 ? minDim / 800 : 1;
    
    // Position shared layout
    this.tableLayout.positionContainers();
    
    // Position gameplay-specific containers
    this.trickAreaContainer.scale.set(responsiveScale);
    this.cpuTrickPileContainer.scale.set(responsiveScale);
    this.playerTrickPileContainer.scale.set(responsiveScale);
    
    // Trick area (middle-right)
    this.trickAreaContainer.x = w * 0.62;
    this.trickAreaContainer.y = h / 2;
    
    // CPU trick pile (top area)
    this.cpuTrickPileContainer.x = w * 0.23;
    this.cpuTrickPileContainer.y = h * 0.13;
    
    // Player trick pile (bottom area)
    this.playerTrickPileContainer.x = w * 0.88;
    this.playerTrickPileContainer.y = h * 0.75;
  }
  
  enter(data?: GameplaySceneData): void {
    this.visible = true;
    this.stateReader = data?.gameStateReader ?? null;
    this.onCardPlayed = data?.onCardPlayed;
    
    this.renderFromState();
  }
  
  /**
   * Re-render UI from current game state.
   * Call this after any game action to update the display.
   */
  public refreshFromState(): void {
    this.renderFromState();
  }
  
  private renderFromState(): void {
    if (!this.stateReader) return;
    
    const playerHand = this.stateReader.getPlayerHand('PLAYER_ONE' as any);
    const cpuHand = this.stateReader.getPlayerHand('PLAYER_TWO' as any);
    const trumpCard = this.stateReader.getTrumpCard();
    const talonSize = this.stateReader.getTalonSize();
    const p1Points = this.stateReader.getGamePoints('PLAYER_ONE' as any);
    const p2Points = this.stateReader.getGamePoints('PLAYER_TWO' as any);
    
    // Render shared layout (interactive player hand)
    this.tableLayout.renderPlayerHand(playerHand, true);
    this.tableLayout.renderCpuHand(cpuHand.length);
    this.tableLayout.renderTalon(trumpCard, talonSize);
    this.tableLayout.renderScoreBoard(p1Points, p2Points);
    
    // Render gameplay-specific elements
    this.renderTrickArea();
    this.renderTrickPiles();
  }
  
  private renderTrickArea(): void {
    this.trickAreaContainer.removeChildren();
    
    if (!this.stateReader) return;
    
    const trickCards = this.stateReader.getCurrentTrickCards();
    const Y_OFFSET = 90;
    
    for (const { player, card } of trickCards) {
      const sprite = new Sprite(this.cardAssets.getCardTexture(card));
      sprite.anchor.set(0.5);
      sprite.scale.set(SCALE.TRICK);
      
      // Position based on player (CPU top, Player bottom)
      if (player === 'PLAYER_TWO') {
        sprite.y = -Y_OFFSET * SCALE.TRICK;
      } else {
        sprite.y = -Y_OFFSET * SCALE.TRICK;
        sprite.x = -(LAYOUT.CARD_WIDTH * 2 + LAYOUT.CARD_WIDTH / 3) * SCALE.TRICK;
      }
      
      this.trickAreaContainer.addChild(sprite);
    }
  }
  
  private renderTrickPiles(): void {
    this.cpuTrickPileContainer.removeChildren();
    this.playerTrickPileContainer.removeChildren();
    
    if (!this.stateReader) return;
    
    const cpuTricks = this.stateReader.getPlayerTricksWon('PLAYER_TWO' as any);
    const playerTricks = this.stateReader.getPlayerTricksWon('PLAYER_ONE' as any);
    
    // CPU trick pile
    const cpuStackCount = Math.min(cpuTricks, 5);
    for (let i = 0; i < cpuStackCount; i++) {
      const sprite = new Sprite(this.cardAssets.getCardBackTexture());
      sprite.anchor.set(0.5);
      sprite.scale.set(SCALE.TRICK_PILE);
      sprite.x = -(i * 2);
      sprite.y = -(i * 2);
      this.cpuTrickPileContainer.addChild(sprite);
    }
    
    // Player trick pile
    const playerStackCount = Math.min(playerTricks, 5);
    for (let i = 0; i < playerStackCount; i++) {
      const sprite = new Sprite(this.cardAssets.getCardBackTexture());
      sprite.anchor.set(0.5);
      sprite.scale.set(SCALE.TRICK_PILE);
      sprite.x = -(i * 2);
      sprite.y = -(i * 2);
      this.playerTrickPileContainer.addChild(sprite);
    }
  }
  
  private handleCardClick(card: Card, _sprite: Sprite): void {
    if (!this.stateReader) return;
    
    // Validate play (read-only check)
    const error = this.stateReader.canPlayerPlayCard('PLAYER_ONE' as any, card);
    if (error) {
      // TODO: Show error feedback (shake animation, tooltip, etc.)
      console.warn('Invalid play:', error);
      return;
    }
    
    // Trigger action callback
    this.onCardPlayed?.(card);
  }
  
  // =========================================================================
  // Animation Methods (for future use)
  // =========================================================================
  
  async animateCardPlay(_player: Player, _card: Card): Promise<void> {
    // TODO: Implement card play animation
  }
  
  async animateTrickCollection(_winner: Player): Promise<void> {
    // TODO: Implement trick collection animation
  }
  
  exit(): void {
    this.visible = false;
    this.tableLayout.clearAllCards();
    this.trickAreaContainer.removeChildren();
    this.cpuTrickPileContainer.removeChildren();
    this.playerTrickPileContainer.removeChildren();
    this.stateReader = null;
  }
  
  update(_delta: number): void {
    // Animation updates
  }
  
  private handleResize = (): void => {
    this.positionContainers();
  };
  
  override destroy(): void {
    window.removeEventListener('resize', this.handleResize);
    this.tableLayout.destroy();
    super.destroy();
  }
}
