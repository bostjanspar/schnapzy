// Import PIXI
import { Application, Sprite, Container } from 'pixi.js';
import { gsap } from 'gsap';
import { BaseScene } from '../utils/base-scene.js';
import { EventBus } from '../utils/event-bus.js';
import { GameScene } from '../utils/types.js';
import { GameTableLayout } from '../utils/game-table-layout.js';
import { LAYOUT, SCALE } from '../utils/layout-constants.js';
import type { Card, Player } from '../../gamelogic/types.js';
import { getOpponent } from '../../gamelogic/types.js';
import { compareCards } from '../../gamelogic/card.js'; // CardAssets
import { EventDealAnimationComplete } from '../../events/game-event-types.js';
import { CardAssets } from '../utils/card-assets.js';
import type { IGameStateReader } from '../index.js';
// Type alias for GSAP timeline
type GSAPTimeline = ReturnType<typeof gsap.timeline>;

// Animation timing (in seconds for GSAP)
// Animation timing (in seconds for GSAP)
const ANIMATION_TIME = {
  CARD_DEAL: 0.35,     // Slower card flight
  TRUMP_PLACE: 0.6,    // Trump card placement
  TALON_STACK: 0.1,    // Talon stacking
  SORT_CARD: 0.1,      // Card move during sort
};

export class DealAnimationScene extends BaseScene {
  private tableLayout: GameTableLayout;
  private cardAssets: CardAssets;
  private animationContainer: Container;
  private animationSprites: Sprite[] = [];
  private gsapContext: gsap.Context | null = null;

  // Cards dealt to each position during animation
  private playerCards: Card[] = [];
  private cpuCards: Card[] = [];
  private trumpCard: Card | null = null;
  private talonCards: Card[] = [];

  // Track sprites for sorting
  private playerSpritesMap: Map<string, Sprite> = new Map();

  constructor(app: Application, eventBus: EventBus, gameStateReader: IGameStateReader) {
    super(app, eventBus, gameStateReader, GameScene.DEAL_ANIMATION);
    this.tableLayout = new GameTableLayout(this.app);
    this.cardAssets = CardAssets.getInstance();
    this.animationContainer = new Container();
  }

  init(): void {
    this.addChild(this.animationContainer);
    this.addChild(this.tableLayout);
    this.tableLayout.positionContainers();

    window.addEventListener('resize', this.handleResize);
  }

  enter(): void {

    this.visible = true;
    this.startDealSequence();
  }

  // =========================================================================
  // Animation Sequence
  // =========================================================================

  private async startDealSequence(): Promise<void> {
    
    // Get cards from state
    const playerHand = this.gameStateReader.getPlayerHand('PLAYER_HUMAN' as any);
    const cpuHand = this.gameStateReader.getPlayerHand('PLAYER_CPU' as any);
    const trumpCard = this.gameStateReader.getTrumpCard();
    const talonSize = this.gameStateReader.getTalonSize();
    const p1Points = this.gameStateReader.getGamePoints('PLAYER_HUMAN' as any);
    const p2Points = this.gameStateReader.getGamePoints('PLAYER_CPU' as any);

    // Store card data
    this.playerCards = [...playerHand];
    this.cpuCards = [...cpuHand];
    this.trumpCard = trumpCard;
    this.talonCards = Array(talonSize).fill(null);

    // Clear containers for animation
    this.tableLayout.playerHandContainer.removeChildren();
    this.tableLayout.cpuHandContainer.removeChildren();
    this.tableLayout.talonContainer.removeChildren();

    // Render score board immediately
    this.tableLayout.renderScoreBoard(p1Points, p2Points);

    // Create GSAP context for easy cleanup
    this.gsapContext = gsap.context();

    // Use timeline for better performance and sequencing
    const tl = gsap.timeline();

    // Build the deal sequence
    this.buildDealTimeline(tl);

    // Wait for timeline to complete
    await new Promise<void>((resolve) => {
      tl.eventCallback('onComplete', resolve);
    });

    this.eventBus.emit( new EventDealAnimationComplete() );
  }

  private buildDealTimeline(tl: GSAPTimeline): void {
    const dealer = this.gameStateReader?.getDealer() ?? 'PLAYER_CPU' as Player;
    const nonDealer = getOpponent(dealer);

    // 0. Create visual deck (talon cards) at center - Full Deck Start
    const talonSprites: Sprite[] = [];
    // Ensure we have enough visuals (cap at 10 or actual talon size)
    const deckVisualCount = Math.min(this.talonCards.length, 10);

    // Base position for the deck (40% height)
    const deckBaseX = this.app.screen.width / 2;
    const deckBaseY = this.app.screen.height * 0.4;

    // Track the "top" of the deck for spawning cards
    let topDeckPos = { x: deckBaseX, y: deckBaseY };

    for (let i = 0; i < deckVisualCount; i++) {
      const offset = LAYOUT.DECK_STACK_OFFSET * SCALE.TALON;
      const localX = -(i * offset);
      const localY = -(i * offset);

      const spawnX = deckBaseX + localX;
      const spawnY = deckBaseY + localY;

      topDeckPos = { x: spawnX, y: spawnY };

      const sprite = this.createCardSprite(null, true, SCALE.TALON, spawnX, spawnY);
      // Override: Visible immediately as the "Deck"
      sprite.visible = true;

      this.animationContainer.addChild(sprite);
      talonSprites.push(sprite);
    }

    // Phase 1: Deal first 3 cards to each player (alternating, non-dealer first)
    for (let i = 0; i < 3; i++) {
      const nonDealerCard = nonDealer === 'PLAYER_CPU' ? this.cpuCards[i] : this.playerCards[i];
      const dealerCard = dealer === 'PLAYER_CPU' ? this.cpuCards[i] : this.playerCards[i];

      if (nonDealerCard && dealerCard) {
        this.addDealToTimeline(tl, nonDealer, i, nonDealerCard, topDeckPos);
        this.addDealToTimeline(tl, dealer, i, dealerCard, topDeckPos);
      }
    }

    // Phase 2: Place trump card
    if (this.trumpCard) {
      // Spawn from top of deck
      const trumpSprite = this.createCardSprite(this.trumpCard, false, SCALE.TALON, topDeckPos.x, topDeckPos.y);
      // Add AFTER deck loop so it appears on top (z-index)
      this.animationContainer.addChild(trumpSprite);

      const talonPos = this.getTalonPosition();
      tl.to(trumpSprite, {
        x: talonPos.x,
        y: talonPos.y,
        rotation: Math.PI / 2,
        duration: ANIMATION_TIME.TRUMP_PLACE,
        ease: 'power2.out',
        onStart: () => { trumpSprite.visible = true; },
        onComplete: () => {
          this.animationContainer.removeChild(trumpSprite);
          // Set final local position to match renderTalon
          trumpSprite.x = -LAYOUT.CARD_HEIGHT * SCALE.TALON;
          trumpSprite.y = LAYOUT.DECK_STACK_OFFSET * SCALE.TALON;
          this.tableLayout.talonContainer.addChild(trumpSprite);
        },
      });
    }

    // Phase 3: Deal last 2 cards to each player (alternating)
    for (let i = 0; i < 2; i++) {
      const nonDealerCard = nonDealer === 'PLAYER_CPU' ? this.cpuCards[3 + i] : this.playerCards[3 + i];
      const dealerCard = dealer === 'PLAYER_CPU' ? this.cpuCards[3 + i] : this.playerCards[3 + i];

      if (nonDealerCard && dealerCard) {
        this.addDealToTimeline(tl, nonDealer, 3 + i, nonDealerCard, topDeckPos);
        this.addDealToTimeline(tl, dealer, 3 + i, dealerCard, topDeckPos);
      }
    }

    // Phase 4: Move remaining deck to talon position
    if (talonSprites.length > 0) {
      const target = this.animationContainer.toLocal(this.tableLayout.talonContainer.toGlobal({ x: 0, y: 0 }));

      tl.to(talonSprites, {
        x: target.x,
        y: target.y,
        duration: ANIMATION_TIME.TALON_STACK,
        ease: 'power1.out',
        onComplete: () => {
          talonSprites.forEach((sprite, i) => {
            const offset = -(i * LAYOUT.DECK_STACK_OFFSET * SCALE.TALON);
            sprite.position.set(offset, offset);
            this.tableLayout.talonContainer.addChild(sprite);
          });
        },
      });
    }

    // Phase 5: Animated Hand Sorting
    this.buildSortTimeline(tl);
  }

  private buildSortTimeline(tl: GSAPTimeline): void {
    // 1. Create sorted copy of hand
    const sortedHand = [...this.playerCards].sort(compareCards);

    // 2. Animate each card to its new position locally
    sortedHand.forEach((card, newIndex) => {
      const key = this.getCardKey(card);
      const sprite = this.playerSpritesMap.get(key);

      if (sprite) {
        // Calculate target local X for this index
        const targetLocalX = this.getLocalCardX(newIndex, false); // false = player

        // Animate local X position
        tl.to(sprite, {
          x: targetLocalX,
          duration: ANIMATION_TIME.SORT_CARD,
          ease: 'back.out(1.2)', // Nice little bounce effect
        }, ">0.1"); // Start 0.1s after previous starts
      }
    });

    // Wait a bit after sorting before finishing scene
    tl.to({}, { duration: 0.5 });
  }

  private addDealToTimeline(
    tl: GSAPTimeline,
    player: Player,
    cardIndex: number,
    card: Card,
    startPos: { x: number, y: number }
  ): void {
    const isCpu = player === 'PLAYER_CPU';
    const scale = isCpu ? SCALE.CPU : SCALE.PLAYER;
    const sprite = this.createCardSprite(card, isCpu, scale, startPos.x, startPos.y);
    this.animationContainer.addChild(sprite);

    // Track sprite if it belongs to human
    if (!isCpu) {
      this.playerSpritesMap.set(this.getCardKey(card), sprite);
    }

    const targetPos = this.getHandCardPosition(isCpu, cardIndex);

    tl.to(sprite, {
      x: targetPos.x,
      y: targetPos.y,
      duration: ANIMATION_TIME.CARD_DEAL,
      ease: 'power2.out',
      onStart: () => { sprite.visible = true; },
      onComplete: () => {
        this.animationContainer.removeChild(sprite);

        // Set final local position
        sprite.x = this.getLocalCardX(cardIndex, isCpu);
        sprite.y = 0;

        if (isCpu) {
          this.tableLayout.cpuHandContainer.addChild(sprite);
        } else {
          this.tableLayout.playerHandContainer.addChild(sprite);
        }
      },
    });
  }

  private getCardKey(card: Card): string {
    return `${card.suit}_${card.rank}`;
  }

  // =========================================================================
  // Card Sprite Helpers
  // =========================================================================

  private createCardSprite(
    card: Card | null,
    faceDown: boolean,
    scale: number,
    startX?: number,
    startY?: number
  ): Sprite {
    const texture = faceDown
      ? this.cardAssets.getCardBackTexture()
      : this.cardAssets.getCardTexture(card!);

    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);

    // Use provided start pos or default to center/deck base
    sprite.x = startX ?? this.app.screen.width / 2;
    sprite.y = startY ?? this.app.screen.height * 0.4;

    // Initially invisible until animation starts
    sprite.visible = false;

    // Set scale based on target
    sprite.scale.set(scale);

    this.animationSprites.push(sprite);
    return sprite;
  }

  private getLocalCardX(cardIndex: number, isCpu: boolean): number {
    const scale = isCpu ? SCALE.CPU : SCALE.PLAYER;
    const totalCards = 5;
    const totalWidth = (totalCards * LAYOUT.CARD_WIDTH * scale) +
      ((totalCards - 1) * LAYOUT.CARD_SPACING * scale);
    const startX = -totalWidth / 2 + (LAYOUT.CARD_WIDTH * scale) / 2;
    return startX + cardIndex * (LAYOUT.CARD_WIDTH + LAYOUT.CARD_SPACING) * scale;
  }

  private getHandCardPosition(isCpu: boolean, cardIndex: number): { x: number; y: number } {
    const container = isCpu
      ? this.tableLayout.cpuHandContainer
      : this.tableLayout.playerHandContainer;

    const localX = this.getLocalCardX(cardIndex, isCpu);

    // Convert local container position to global screen position
    return container.toGlobal({ x: localX, y: 0 });
  }

  private getTalonPosition(): { x: number; y: number } {
    // Trump card position (rotated 90°) - same local coordinates as in renderTalon
    const localX = -LAYOUT.CARD_HEIGHT * SCALE.TALON;
    const localY = LAYOUT.DECK_STACK_OFFSET * SCALE.TALON;
    return this.tableLayout.talonContainer.toGlobal({ x: localX, y: localY });
  }

  // =========================================================================
  // Cleanup
  // =========================================================================

  private clearAnimationData(): void {
    // Clean up GSAP context (reverts all animations)
    if (this.gsapContext) {
      this.gsapContext.revert();
      this.gsapContext = null;
    }

    // Clear tracking arrays
    this.animationSprites = [];
    this.playerCards = [];
    this.cpuCards = [];
    this.trumpCard = null;
    this.talonCards = [];
  }

  exit(): void {
    this.visible = false;
    this.clearAnimationData();
    this.animationContainer.removeChildren();
    this.tableLayout.clearAllCards();
  }

  // GSAP handles its own updates automatically
  update(_delta: number): void {
    // No manual update needed with GSAP timelines
  }

  private handleResize = (): void => {
    this.tableLayout.positionContainers();
  };

  override destroy(): void {
    window.removeEventListener('resize', this.handleResize);
    this.clearAnimationData();
    this.animationContainer.destroy();
    this.tableLayout.destroy();
    super.destroy();
  }
}
