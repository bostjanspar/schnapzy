import { Container, Sprite, Text, type Application } from 'pixi.js';
import { LAYOUT, SCALE } from './layout-constants.js';
import { CardAssets } from './card-assets.js';
import type { Card } from '../../gamelogic/types.js';

export interface TableLayoutOptions {
  interactive?: boolean;  // Enable card click handlers
}

export class GameTableLayout extends Container {
  // Public containers for scene access
  public readonly cpuHandContainer: Container;
  public readonly playerHandContainer: Container;
  public readonly talonContainer: Container;
  public readonly scoreBoardContainer: Container;
  public readonly cpuInfoContainer: Container;
  public readonly playerInfoContainer: Container;
  
  private cardAssets: CardAssets;
  private cardSprites: Sprite[] = [];
  private app: Application;
  
  // Card click callback
  public onCardClick?: (card: Card, sprite: Sprite) => void;
  
  constructor(app: Application) {
    super();
    this.app = app;
    this.cardAssets = CardAssets.getInstance();
    
    // Initialize containers
    this.cpuHandContainer = new Container();
    this.playerHandContainer = new Container();
    this.talonContainer = new Container();
    this.scoreBoardContainer = new Container();
    this.cpuInfoContainer = new Container();
    this.playerInfoContainer = new Container();
    
    // Add to display list
    this.addChild(this.cpuInfoContainer);
    this.addChild(this.cpuHandContainer);
    this.addChild(this.playerInfoContainer);
    this.addChild(this.playerHandContainer);
    this.addChild(this.talonContainer);
    this.addChild(this.scoreBoardContainer);
  }
  
  positionContainers(): void {
    const w = this.app.screen.width;
    const h = this.app.screen.height;
    
    const minDim = Math.min(w, h);
    const responsiveScale = minDim < 800 ? minDim / 800 : 1;
    
    // Apply responsive scaling
    this.cpuHandContainer.scale.set(responsiveScale);
    this.playerHandContainer.scale.set(responsiveScale);
    this.talonContainer.scale.set(responsiveScale);
    this.scoreBoardContainer.scale.set(responsiveScale);
    
    // CPU hand (top-center)
    this.cpuHandContainer.x = w / 2;
    this.cpuHandContainer.y = h * 0.12;
    
    // Player hand (bottom-center)
    this.playerHandContainer.x = w / 2;
    this.playerHandContainer.y = h - LAYOUT.HAND_Y_OFFSET * responsiveScale;
    
    // Talon (middle-left)
    this.talonContainer.x = w / 2 - (LAYOUT.CARD_WIDTH * 2) * responsiveScale;
    this.talonContainer.y = ((h / 2) - LAYOUT.CARD_HEIGHT / 2) * responsiveScale;
    
    // Score board (right side)
    this.scoreBoardContainer.x = w - LAYOUT.H_MARGIN;
    this.scoreBoardContainer.y = 20;
    
    // CPU info (top-left)
    this.cpuInfoContainer.x = LAYOUT.H_MARGIN;
    this.cpuInfoContainer.y = LAYOUT.V_MARGIN;
    
    // Player info (bottom-left)
    this.playerInfoContainer.x = LAYOUT.H_MARGIN;
    this.playerInfoContainer.y = h * 0.80;
  }
  
  // =========================================================================
  // Render Methods
  // =========================================================================
  
  renderCpuHand(cardCount: number): void {
    this.cpuHandContainer.removeChildren();
    
    const totalWidth = (cardCount * LAYOUT.CARD_WIDTH * SCALE.CPU) + 
                       ((cardCount - 1) * LAYOUT.CARD_SPACING * SCALE.CPU);
    const startX = -totalWidth / 2 + (LAYOUT.CARD_WIDTH * SCALE.CPU) / 2;
    
    for (let i = 0; i < cardCount; i++) {
      const sprite = new Sprite(this.cardAssets.getCardBackTexture());
      sprite.anchor.set(0.5);
      sprite.scale.set(SCALE.CPU);
      sprite.x = startX + i * (LAYOUT.CARD_WIDTH + LAYOUT.CARD_SPACING) * SCALE.CPU;
      this.cpuHandContainer.addChild(sprite);
      this.cardSprites.push(sprite);
    }
  }
  
  renderPlayerHand(cards: readonly Card[], interactive: boolean = false): void {
    this.playerHandContainer.removeChildren();
    
    const count = cards.length;
    const totalWidth = (count * LAYOUT.CARD_WIDTH * SCALE.PLAYER) + 
                       ((count - 1) * LAYOUT.CARD_SPACING * SCALE.PLAYER);
    const startX = -totalWidth / 2 + (LAYOUT.CARD_WIDTH * SCALE.PLAYER) / 2;
    
    cards.forEach((card, i) => {
      const sprite = new Sprite(this.cardAssets.getCardTexture(card));
      sprite.anchor.set(0.5);
      sprite.scale.set(SCALE.PLAYER);
      sprite.x = startX + i * (LAYOUT.CARD_WIDTH + LAYOUT.CARD_SPACING) * SCALE.PLAYER;
      
      if (interactive) {
        sprite.eventMode = 'static';
        sprite.cursor = 'pointer';
        sprite.on('pointerdown', () => {
          this.onCardClick?.(card, sprite);
        });
      }
      
      this.playerHandContainer.addChild(sprite);
      this.cardSprites.push(sprite);
    });
  }
  
  renderTalon(trumpCard: Card | null, talonSize: number): void {
    this.talonContainer.removeChildren();
    
    // Trump card (rotated 90°)
    if (trumpCard) {
      const trumpSprite = new Sprite(this.cardAssets.getCardTexture(trumpCard));
      trumpSprite.anchor.set(0.5);
      trumpSprite.scale.set(SCALE.TALON);
      trumpSprite.rotation = Math.PI / 2;
      trumpSprite.y = LAYOUT.DECK_STACK_OFFSET * SCALE.TALON;
      trumpSprite.x = -LAYOUT.CARD_HEIGHT * SCALE.TALON;
      this.talonContainer.addChild(trumpSprite);
      this.cardSprites.push(trumpSprite);
    }
    
    // Draw pile (card backs stacked)
    const stackCount = Math.min(talonSize, 5);
    for (let i = 0; i < stackCount; i++) {
      const sprite = new Sprite(this.cardAssets.getCardBackTexture());
      sprite.anchor.set(0.5);
      sprite.scale.set(SCALE.TALON);
      sprite.x = -(i * LAYOUT.DECK_STACK_OFFSET * SCALE.TALON);
      sprite.y = -(i * LAYOUT.DECK_STACK_OFFSET * SCALE.TALON);
      this.talonContainer.addChild(sprite);
      this.cardSprites.push(sprite);
    }
  }
  
  renderScoreBoard(player1GamePoints: number, player2GamePoints: number): void {
    this.scoreBoardContainer.removeChildren();
    
    const title = new Text({
      text: 'TOTAL SCORE',
      style: { fontFamily: 'Arial', fontSize: 18, fill: 0xffffff, align: 'right' }
    });
    const header = new Text({
      text: 'You | CPU',
      style: { fontFamily: 'Arial', fontSize: 18, fill: 0xffffff }
    });
    const values = new Text({
      text: `${player1GamePoints}  |  ${player2GamePoints}`,
      style: { fontFamily: 'Arial', fontSize: 24, fill: 0xffffff }
    });
    
    title.anchor.set(1, 0);
    header.anchor.set(1, 0);
    values.anchor.set(1, 0);
    
    header.y = 20;
    values.y = 50;
    
    this.scoreBoardContainer.addChild(title, header, values);
  }
  
  // =========================================================================
  // Cleanup
  // =========================================================================
  
  clearAllCards(): void {
    this.cardSprites.forEach(sprite => sprite.destroy());
    this.cardSprites = [];

    this.cpuHandContainer.removeChildren();
    this.playerHandContainer.removeChildren();
    this.talonContainer.removeChildren();
  }

  /**
   * Remove a card from CPU hand and return its world position.
   * Returns the center position of the rightmost card.
   */
  removeCpuCard(): { x: number; y: number } {
    const container = this.cpuHandContainer;

    // Get world position of the rightmost card (last child)
    const lastCard = container.children[container.children.length - 1];
    if (lastCard) {
      const worldPos = lastCard.getGlobalPosition();
      lastCard.destroy();
      return { x: worldPos.x, y: worldPos.y };
    }

    // Fallback to container center if no card
    return { x: container.x, y: container.y };
  }

  /**
   * Remove a specific card from player hand and return its world position.
   */
  removePlayerCard(card: Card): { x: number; y: number } {
    const container = this.playerHandContainer;

    // Find the sprite for this card
    for (const child of container.children) {
      if (child instanceof Sprite) {
        // Match by texture (each card has unique texture)
        const texture = child.texture;
        const cardTexture = this.cardAssets.getCardTexture(card);
        if (texture === cardTexture) {
          const worldPos = child.getGlobalPosition();
          child.destroy();
          return { x: worldPos.x, y: worldPos.y };
        }
      }
    }

    // Fallback to container center
    return { x: container.x, y: container.y };
  }
  
  override destroy(): void {
    this.clearAllCards();
    super.destroy({ children: true });
  }
}
