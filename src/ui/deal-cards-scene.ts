/**
 * Deal cards scene - displays cards with animations.
 * Shows player hand at bottom (5 cards front-facing) and deck in middle (card backs).
 * Emits DEAL_ANIM_COMPLETE when deal animation finishes.
 */

import { Container, type Application, Sprite } from 'pixi.js';
import { BaseScene } from './base-scene.js';
import { EventBus } from './event-bus.js';
import { GAME_EVENT_IDS } from '../events/index.js';
import { GameScene } from './types.js';
import { CardAssets } from './card-assets.js';
import type { Card, Suit, Rank } from '../gamelogic/types.js';

const SUITS: Suit[] = ['CLUBS', 'DIAMONDS', 'HEARTS', 'SPADES'];
const RANKS: Rank[] = ['ACE', 'KING', 'QUEEN', 'JACK', 'TEN'];

export class DealCardsScene extends BaseScene {
  private cardAssets: CardAssets;
  private playerHandContainer: Container;
  private deckContainer: Container;
  private cardSprites: Sprite[] = [];

  private readonly HAND_Y_OFFSET = 150; // Distance from bottom
  private readonly CARD_SPACING = 130;   // Space between cards in hand
  private readonly DECK_STACK_OFFSET = 3; // Offset for stacked deck cards

  constructor(app: Application, eventBus: EventBus) {
    super(app, eventBus, GameScene.DEAL_CARDS);
    this.cardAssets = CardAssets.getInstance();
    this.playerHandContainer = new Container();
    this.deckContainer = new Container();
  }

  async init(): Promise<void> {
    // Ensure card assets are loaded
    if (!this.cardAssets.isLoaded()) {
      await this.cardAssets.loadAll();
    }

    // Setup deck container (middle of screen)
    this.deckContainer.x = this.app.screen.width / 2;
    this.deckContainer.y = this.app.screen.height / 2 -10;
    this.addChild(this.deckContainer);

    // Setup player hand container (bottom of screen)
    this.playerHandContainer.x = this.app.screen.width / 2;
    this.playerHandContainer.y = this.app.screen.height - this.HAND_Y_OFFSET;
    this.addChild(this.playerHandContainer);

    window.addEventListener('resize', this.handleResize);
  }

  enter(_data?: unknown): void {
    this.visible = true;
    this.dealCards();
  }

  private async dealCards(): Promise<void> {
    // Create the deck display (card backs in middle)
    this.createDeck();

    // Create the player hand (5 random cards at bottom)
    this.createPlayerHand();

    // Notify State Machine that deal animation is complete
    setTimeout(() => {
      this.eventBus.emit({ type: GAME_EVENT_IDS.DEAL_ANIM_COMPLETE });
    }, 500);
  }

  private createDeck(): void {
    // Clear existing deck sprites
    this.deckContainer.removeChildren();

    // Create a stack of card backs to represent the deck/talon
    const deckSize = 5;
    for (let i = 0; i < deckSize; i++) {
      const backTexture = this.cardAssets.getCardBackTexture();
      const backSprite = new Sprite(backTexture);

      // Stack cards with slight offset to show depth
      backSprite.x = -(i * this.DECK_STACK_OFFSET);
      backSprite.y = -(i * this.DECK_STACK_OFFSET);
      backSprite.anchor.set(0.5);

      this.deckContainer.addChild(backSprite);
      this.cardSprites.push(backSprite);
    }
  }

  private createPlayerHand(): void {
    // Clear existing hand sprites
    this.playerHandContainer.removeChildren();

    // Generate 5 random cards
    const handCards: Card[] = [];
    for (let i = 0; i < 5; i++) {
      handCards.push(this.getRandomCard());
    }

    // Calculate starting X position to center the hand
    const cardWidth = 100; // Approximate width, will be adjusted by texture
    const totalWidth = (handCards.length * cardWidth) + ((handCards.length - 1) * this.CARD_SPACING);
    const startX = -totalWidth / 2 + cardWidth / 2;

    // Create and position each card
    handCards.forEach((card, index) => {
      const texture = this.cardAssets.getCardTexture(card);
      const cardSprite = new Sprite(texture);

      cardSprite.x = startX + index * (cardWidth + this.CARD_SPACING);
      cardSprite.y = 0;
      cardSprite.anchor.set(0.5);

      // Make cards interactive (for future card selection)
      cardSprite.eventMode = 'static';
      cardSprite.cursor = 'pointer';

      this.playerHandContainer.addChild(cardSprite);
      this.cardSprites.push(cardSprite);
    });
  }

  private getRandomCard(): Card {
    const randomSuit = SUITS[Math.floor(Math.random() * SUITS.length)]!;
    const randomRank = RANKS[Math.floor(Math.random() * RANKS.length)]!;
    return { suit: randomSuit, rank: randomRank };
  }

  exit(): void {
    this.visible = false;
  }

  update(_delta: number): void {
    // Card animations, hover effects (can be added later)
  }

  private handleResize = (): void => {
    this.deckContainer.x = this.app.screen.width / 2;
    this.deckContainer.y = this.app.screen.height / 2;
    this.playerHandContainer.x = this.app.screen.width / 2;
    this.playerHandContainer.y = this.app.screen.height - this.HAND_Y_OFFSET;
  };

  override destroy(): void {
    window.removeEventListener('resize', this.handleResize);
    // Clean up all card sprites
    this.cardSprites.forEach(sprite => sprite.destroy());
    this.cardSprites = [];
    super.destroy();
  }
}
