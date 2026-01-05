import { Container, type Application, Sprite, Text } from 'pixi.js';
import { BaseScene } from './base-scene.js';
import { EventBus } from './event-bus.js';
import { GameScene } from './types.js';
import { CardAssets } from './card-assets.js';
import type { Card, Suit, Rank } from '../gamelogic/types.js';

const SUITS: Suit[] = ['CLUBS', 'DIAMONDS', 'HEARTS', 'SPADES'];
const RANKS: Rank[] = ['ACE', 'KING', 'QUEEN', 'JACK', 'TEN'];

export class DealCardsScene extends BaseScene {
  private cardAssets: CardAssets;

  // Existing containers (keeping for backward compatibility, will refactor)
  private playerHandContainer: Container;
  private deckContainer: Container;
  private cardSprites: Sprite[] = [];

  // New containers for full game UI
  private cpuInfoContainer: Container;
  private cpuHandContainer: Container;
  private playerInfoContainer: Container;
  private talonContainer: Container;
  private trickAreaContainer: Container;
  private cpuTrickPileContainer: Container;
  private playerTrickPileContainer: Container;
  private scoreBoardContainer: Container;

  // Layout constants
  private readonly TOP_ZONE = 0.25;      // CPU area (25% of screen height)
  private readonly MIDDLE_ZONE = 0.50;   // Talon + trick area (50%)
  private readonly BOTTOM_ZONE = 0.25;   // Player area (25%)

  private readonly H_MARGIN = 40;
  private readonly V_MARGIN = 30;
  private readonly CARD_SPACING = 130;
  private readonly DECK_STACK_OFFSET = 4;

  private readonly CARD_WIDTH = 100;
  private readonly CARD_HEIGHT = 140;

  private readonly HAND_Y_OFFSET = 200; // Distance from bottom

  // Perspective scale factors (fake 3D depth)
  private readonly SCALE_CPU = 0.65;        // CPU hand (farthest)
  private readonly SCALE_TALON = 0.75;      // Talon (middle distance)
  private readonly SCALE_TRICK = 0.85;      // Current trick (closer)
  private readonly SCALE_PLAYER = 1.0;      // Player hand (closest)
  private readonly SCALE_TRICK_PILE = 0.6;  // Trick piles (far)


  constructor(app: Application, eventBus: EventBus) {
    super(app, eventBus, GameScene.DEAL_CARDS);
    this.cardAssets = CardAssets.getInstance();

    // Initialize existing containers
    this.playerHandContainer = new Container();
    this.deckContainer = new Container();

    // Initialize new containers
    this.cpuInfoContainer = new Container();
    this.cpuHandContainer = new Container();
    this.playerInfoContainer = new Container();
    this.talonContainer = new Container();
    this.trickAreaContainer = new Container();
    this.cpuTrickPileContainer = new Container();
    this.playerTrickPileContainer = new Container();
    this.scoreBoardContainer = new Container();
  }

  async init(): Promise<void> {
    // Ensure card assets are loaded
    if (!this.cardAssets.isLoaded()) {
      await this.cardAssets.loadAll();
    }

    // Add all containers to the scene
    this.addChild(this.cpuInfoContainer);
    this.addChild(this.cpuHandContainer);
    this.addChild(this.playerInfoContainer);
    this.addChild(this.playerHandContainer);
    this.addChild(this.talonContainer);
    this.addChild(this.trickAreaContainer);
    this.addChild(this.cpuTrickPileContainer);
    this.addChild(this.playerTrickPileContainer);
    this.addChild(this.scoreBoardContainer);
    this.addChild(this.deckContainer); // Keep for backward compatibility

    // Position all containers
    this.positionContainers();

    window.addEventListener('resize', this.handleResize);
  }

  enter(_data?: unknown): void {
    this.visible = true;
    this.dealCards();
  }

  private positionContainers(): void {
    const w = this.app.screen.width;
    const h = this.app.screen.height;

    // Responsive scale factor for smaller screens
    const minDim = Math.min(w, h);
    const responsiveScale = minDim < 800 ? minDim / 800 : 1;

    // Apply responsive scaling to containers
    this.cpuHandContainer.scale.set(responsiveScale);
    this.playerHandContainer.scale.set(responsiveScale);
    this.talonContainer.scale.set(responsiveScale);
    this.trickAreaContainer.scale.set(responsiveScale);
    this.cpuTrickPileContainer.scale.set(responsiveScale);
    this.playerTrickPileContainer.scale.set(responsiveScale);
    this.scoreBoardContainer.scale.set(responsiveScale);

    // CPU hand (top-center)
    this.cpuHandContainer.x = w / 2;
    this.cpuHandContainer.y = h * 0.12;

    // Player hand (bottom-center)
    this.playerHandContainer.x = w / 2;
    this.playerHandContainer.y = h - this.HAND_Y_OFFSET * responsiveScale;

    // Talon (middle-left)
    this.talonContainer.x = w/2 - (this.CARD_WIDTH*2) *responsiveScale;
    this.talonContainer.y = ((h / 2) - this.CARD_HEIGHT/2)*responsiveScale;;

    // Trick area (middle-right)
    this.trickAreaContainer.x = w * 0.62;
    this.trickAreaContainer.y = h / 2;

    // CPU trick pile (top area)
    this.cpuTrickPileContainer.x = w * 0.28;
    this.cpuTrickPileContainer.y = h * 0.15;

    // Player trick pile (bottom area)
    this.playerTrickPileContainer.x = w * 0.28;
    this.playerTrickPileContainer.y = h * 0.75;

    // Score board (right side, vertically centered)
    this.scoreBoardContainer.x = w - this.H_MARGIN;
    this.scoreBoardContainer.y = h / 2;

    // CPU info (top-left)
    this.cpuInfoContainer.x = this.H_MARGIN;
    this.cpuInfoContainer.y = this.V_MARGIN;

    // Player info (bottom-left)
    this.playerInfoContainer.x = this.H_MARGIN;
    this.playerInfoContainer.y = h * 0.80;
  }

  private async dealCards(): Promise<void> {
    // Create all UI elements with fake values
    this.createCPUInfo();
    this.createPlayerInfo();
    this.createScoreBoard();
    this.createCPUHand();
    this.createPlayerHand();
    this.createTalon();
    this.createTrickArea();
    this.createTrickPiles();
  }

  private createCPUInfo(): void {
    this.cpuInfoContainer.removeChildren();
    // No info text displayed
  }

  private createPlayerInfo(): void {
    this.playerInfoContainer.removeChildren();
    // No info text displayed
  }

  private createScoreBoard(): void {
    this.scoreBoardContainer.removeChildren();

    const title = new Text({
      text: '[ TOTAL SCORE]',
      style: { fontFamily: 'Arial', fontSize: 18, fill: 0xffffff, align: 'right' }
    });
    const header = new Text({
      text: 'You | Robot',
      style: { fontFamily: 'Arial', fontSize: 18, fill: 0xffffff }
    });
    const divider = new Text({
      text: '___________',
      style: { fontFamily: 'Arial', fontSize: 18, fill: 0xffffff }
    });
    const values = new Text({
      text: '7  |  7',
      style: { fontFamily: 'Arial', fontSize: 24, fill: 0xffffff }
    });

    title.anchor.set(1, 0);
    values.anchor.set(1, 0);

    header.y = 20;
    divider.y = 40;
    values.y = 50;

    this.scoreBoardContainer.addChild(title, header, divider, values);
  }

  private createCPUHand(): void {
    this.cpuHandContainer.removeChildren();

    const cardCount = 5;
    const totalWidth = (cardCount * this.CARD_WIDTH * this.SCALE_CPU) + ((cardCount - 1) * this.CARD_SPACING * this.SCALE_CPU);
    const startX = -totalWidth / 2 + (this.CARD_WIDTH * this.SCALE_CPU) / 2;

    for (let i = 0; i < cardCount; i++) {
      const sprite = new Sprite(this.cardAssets.getCardBackTexture());
      sprite.anchor.set(0.5);
      sprite.scale.set(this.SCALE_CPU);
      sprite.x = startX + i * (this.CARD_WIDTH + this.CARD_SPACING) * this.SCALE_CPU;
      this.cpuHandContainer.addChild(sprite);
      this.cardSprites.push(sprite);
    }
  }

  private createPlayerHand(): void {
    this.playerHandContainer.removeChildren();

    // Fake hand with specific cards
    const fakeCards: Card[] = [
      { suit: 'SPADES', rank: 'ACE' },
      { suit: 'HEARTS', rank: 'TEN' },
      { suit: 'CLUBS', rank: 'QUEEN' },
      { suit: 'CLUBS', rank: 'KING' },
      { suit: 'SPADES', rank: 'JACK' }
    ];

    const totalWidth = (fakeCards.length * this.CARD_WIDTH * this.SCALE_PLAYER) + ((fakeCards.length - 1) * this.CARD_SPACING * this.SCALE_PLAYER);
    const startX = -totalWidth / 2 + (this.CARD_WIDTH * this.SCALE_PLAYER) / 2;

    fakeCards.forEach((card, i) => {
      const sprite = new Sprite(this.cardAssets.getCardTexture(card));
      sprite.anchor.set(0.5);
      sprite.scale.set(this.SCALE_PLAYER);
      sprite.x = startX + i * (this.CARD_WIDTH + this.CARD_SPACING) * this.SCALE_PLAYER;
      sprite.eventMode = 'static';
      sprite.cursor = 'pointer';
      this.playerHandContainer.addChild(sprite);
      this.cardSprites.push(sprite);
    });
  }

  private createTalon(): void {
    this.talonContainer.removeChildren();

    // Trump card (Jack of Diamonds) below, rotated 180 degrees
    const trumpSprite = new Sprite(this.cardAssets.getCardTexture({ suit: 'DIAMONDS', rank: 'JACK' }));
    trumpSprite.anchor.set(0.5);
    trumpSprite.scale.set(this.SCALE_TALON);
    trumpSprite.rotation = Math.PI/2; // 180 degrees in radians
    trumpSprite.y = this.DECK_STACK_OFFSET * this.SCALE_TALON
    trumpSprite.x = -this.CARD_HEIGHT * this.SCALE_TALON 
    this.talonContainer.addChild(trumpSprite);
    this.cardSprites.push(trumpSprite);

    // Stack of 5 card backs
    for (let i = 0; i < 5; i++) {
      const sprite = new Sprite(this.cardAssets.getCardBackTexture());
      sprite.anchor.set(0.5);
      sprite.scale.set(this.SCALE_TALON);
      sprite.x = -(i * this.DECK_STACK_OFFSET * this.SCALE_TALON);
      sprite.y = -(i * this.DECK_STACK_OFFSET * this.SCALE_TALON);
      this.talonContainer.addChild(sprite);
      this.cardSprites.push(sprite);
    }
  }

  private createTrickArea(): void {
    this.trickAreaContainer.removeChildren();
    const Y_OFFSET = 90;
    // CPU card (top) - 10 of Diamonds
    const cpuCard = new Sprite(this.cardAssets.getCardTexture({ suit: 'DIAMONDS', rank: 'TEN' }));
    cpuCard.anchor.set(0.5);
    cpuCard.scale.set(this.SCALE_TRICK);
    cpuCard.y = -Y_OFFSET * this.SCALE_TRICK; // Move up further
    this.trickAreaContainer.addChild(cpuCard);
    this.cardSprites.push(cpuCard);

    // Player card (bottom) - Ace of Diamonds
    const playerCard = new Sprite(this.cardAssets.getCardTexture({ suit: 'DIAMONDS', rank: 'ACE' }));
    playerCard.anchor.set(0.5);
    playerCard.scale.set(this.SCALE_TRICK);
    playerCard.y = -Y_OFFSET * this.SCALE_TRICK; // Move down further
    playerCard.x = -(this.CARD_WIDTH*2+this.CARD_WIDTH/3) * this.SCALE_TRICK; 
    this.trickAreaContainer.addChild(playerCard);
    this.cardSprites.push(playerCard);
  }

  private createTrickPiles(): void {
    this.cpuTrickPileContainer.removeChildren();
    this.playerTrickPileContainer.removeChildren();

    // CPU's pile (3 cards visible)
    for (let i = 0; i < 3; i++) {
      const sprite = new Sprite(this.cardAssets.getCardBackTexture());
      sprite.anchor.set(0.5);
      sprite.scale.set(this.SCALE_TRICK_PILE);
      sprite.x = -(i * 2);
      sprite.y = -(i * 2);
      this.cpuTrickPileContainer.addChild(sprite);
      this.cardSprites.push(sprite);
    }

    // Player's pile (2 cards visible)
    for (let i = 0; i < 2; i++) {
      const sprite = new Sprite(this.cardAssets.getCardBackTexture());
      sprite.anchor.set(0.5);
      sprite.scale.set(this.SCALE_TRICK_PILE);
      sprite.x = -(i * 2);
      sprite.y = -(i * 2);
      this.playerTrickPileContainer.addChild(sprite);
      this.cardSprites.push(sprite);
    }
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
    this.positionContainers();
  };

  override destroy(): void {
    window.removeEventListener('resize', this.handleResize);
    // Clean up all card sprites
    this.cardSprites.forEach(sprite => sprite.destroy());
    this.cardSprites = [];
    super.destroy();
  }
}
