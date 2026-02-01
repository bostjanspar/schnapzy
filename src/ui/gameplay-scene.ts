import { Container, Sprite, type Application } from 'pixi.js';
import { BaseScene } from './utils/base-scene.js';
import { EventBus } from './utils/event-bus.js';
import { GameScene } from './utils/types.js';
import { GameTableLayout } from './utils/game-table-layout.js';
import { LAYOUT, SCALE } from './utils/layout-constants.js';
import type { Card, Player } from '../gamelogic/types.js';
import { compareCards } from '../gamelogic/card.js';
import { CardAssets } from './utils/card-assets.js';
import type { IGameStateReader } from './index.js';
import { EventGamePlayReady } from '../events/game-event-types.js';

export class GameplayScene extends BaseScene {
  private tableLayout: GameTableLayout;
  private cardAssets: CardAssets;
  
  // Gameplay-specific containers (not in shared layout)
  private trickAreaContainer: Container;
  private cpuTrickPileContainer: Container;
  private playerTrickPileContainer: Container;

  // Action callbacks
  private onCardPlayed: ((card: Card) => void) | undefined;
  
  constructor(app: Application, eventBus: EventBus, gameStateReader: IGameStateReader) {
    super(app, eventBus, gameStateReader, GameScene.GAMEPLAY);
    this.tableLayout = new GameTableLayout(this.app);
    this.cardAssets = CardAssets.getInstance();
    
    this.trickAreaContainer = new Container();
    this.cpuTrickPileContainer = new Container();
    this.playerTrickPileContainer = new Container();
  }
  
  init(): void {
    
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
  
  enter(): void {
    this.visible = true;
    this.renderFromState();
    this.eventBus.emit(new EventGamePlayReady());
  }
  
  /**
   * Re-render UI from current game state.
   * Call this after any game action to update the display.
   */
  public refreshFromState(): void {
    this.renderFromState();
  }
  
  private renderFromState(): void {
    
    const playerHand = this.gameStateReader.getPlayerHand('PLAYER_HUMAN' as any);
    const cpuHand = this.gameStateReader.getPlayerHand('PLAYER_CPU' as any);
    const trumpCard = this.gameStateReader.getTrumpCard();
    const talonSize = this.gameStateReader.getTalonSize();
    const p1Points = this.gameStateReader.getGamePoints('PLAYER_HUMAN' as any);
    const p2Points = this.gameStateReader.getGamePoints('PLAYER_CPU' as any);
    
    // Render shared layout (interactive player hand)
    this.tableLayout.renderPlayerHand([... playerHand].sort(compareCards), true);
    this.tableLayout.renderCpuHand(cpuHand.length);
    this.tableLayout.renderTalon(trumpCard, talonSize);
    this.tableLayout.renderScoreBoard(p1Points, p2Points);
    
    // Render gameplay-specific elements
    this.renderTrickArea();
    this.renderTrickPiles();    
  }
  
  private renderTrickArea(): void {
    this.trickAreaContainer.removeChildren();
    
    const trickCards = this.gameStateReader.getCurrentTrickCards();
    const Y_OFFSET = 90;
    
    for (const { player, card } of trickCards) {
      const sprite = new Sprite(this.cardAssets.getCardTexture(card));
      sprite.anchor.set(0.5);
      sprite.scale.set(SCALE.TRICK);
      
      // Position based on player (CPU top, Player bottom)
      if (player === 'PLAYER_CPU') {
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
    
    
    const cpuTricks = this.gameStateReader.getPlayerTricksWon('PLAYER_CPU' as any);
    const playerTricks = this.gameStateReader.getPlayerTricksWon('PLAYER_HUMAN' as any);
    
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
  
    
    // Validate play (read-only check)
    const error = this.gameStateReader.canPlayerPlayCard('PLAYER_HUMAN' as any, card);
    if (error) {
      // TODO: Show error feedback (shake animation, tooltip, etc.)
      console.warn('Invalid play:', error);
      return;
    }
    
    // Trigger action callback
    this.onCardPlayed?.(card);
  }
  
  // =========================================================================
  // Animation Methods
  // =========================================================================

  async animateCardPlay(player: Player, card: Card): Promise<void> {
    const w = this.app.screen.width;
    const h = this.app.screen.height;
    const minDim = Math.min(w, h);
    const responsiveScale = minDim < 800 ? minDim / 800 : 1;

    const isCpu = player === 'PLAYER_CPU';
    const handScale = isCpu ? SCALE.CPU : SCALE.PLAYER;

    // Remove card from hand and get its world position
    const startPos = isCpu
      ? this.tableLayout.removeCpuCard()
      : this.tableLayout.removePlayerCard(card);

    // Get current trick count to determine target position
    const trickCards = this.gameStateReader.getCurrentTrickCards();
    const isFirstCard = trickCards.length === 0;

    // Calculate target position in trick area
    const Y_OFFSET = 90;
    const targetX = isFirstCard ? 0 : -(LAYOUT.CARD_WIDTH * 2 + LAYOUT.CARD_WIDTH / 3) * SCALE.TRICK;
    const targetY = -Y_OFFSET * SCALE.TRICK;

    // Create animated sprite with card back for CPU, face for player
    const animSprite = new Sprite(
      isCpu ? this.cardAssets.getCardBackTexture() : this.cardAssets.getCardTexture(card)
    );
    animSprite.anchor.set(0.5);
    animSprite.scale.set(handScale * responsiveScale);

    // Set initial position (convert world coordinates to trick area container local coordinates)
    animSprite.x = startPos.x - this.trickAreaContainer.x;
    animSprite.y = startPos.y - this.trickAreaContainer.y;

    this.trickAreaContainer.addChild(animSprite);

    // Animate to target (flip CPU card to show face)
    const faceTexture = isCpu ? this.cardAssets.getCardTexture(card) : undefined;
    await this.tweenSprite(animSprite, targetX, targetY, SCALE.TRICK * responsiveScale, 400, faceTexture);
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
  }
  
  update(_delta: number): void {
    // Animation updates
  }
  
  private handleResize = (): void => {
    this.positionContainers();
  };

  /**
   * Simple tween animation for sprite properties.
   * Optionally flips card to show face texture during animation.
   */
  private tweenSprite(
    sprite: Sprite,
    targetX: number,
    targetY: number,
    targetScale: number,
    duration: number,
    faceTexture?: import('pixi.js').Texture
  ): Promise<void> {
    return new Promise((resolve) => {
      const startX = sprite.x;
      const startY = sprite.y;
      const startScale = sprite.scale.x;
      const startTime = Date.now();

      // Track if we've flipped the card yet
      let flipped = false;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);

        sprite.x = startX + (targetX - startX) * eased;
        sprite.y = startY + (targetY - startY) * eased;
        const currentScale = startScale + (targetScale - startScale) * eased;
        sprite.scale.set(currentScale);

        // Flip card at 50% of animation if face texture provided
        if (faceTexture && !flipped && progress >= 0.5) {
          flipped = true;
          sprite.texture = faceTexture;
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }
  
  override destroy(): void {
    window.removeEventListener('resize', this.handleResize);
    this.tableLayout.destroy();
    super.destroy();
  }
}
