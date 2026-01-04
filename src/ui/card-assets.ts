import { Assets, Texture } from 'pixi.js';
import type { Card, Suit, Rank } from '../gamelogic/types.js';

// ============================================================================
// Asset Path Constants
// ============================================================================

const ASSETS_BASE_PATH = '/cards';

const CARD_BACK_PATH = `${ASSETS_BASE_PATH}/back.svg`;

const SUIT_PATHS: Readonly<Record<Suit, string>> = {
  CLUBS: 'clubs',
  DIAMONDS: 'diamonds',
  HEARTS: 'hearts',
  SPADES: 'spades',
} as const;

const RANK_PATHS: Readonly<Record<Rank, string>> = {
  JACK: 'jack',
  QUEEN: 'queen',
  KING: 'king',
  TEN: 'ten',
  ACE: 'ace',
} as const;

// ============================================================================
// CardAssets Class
// ============================================================================

export class CardAssets {
  private static instance: CardAssets | null = null;
  private texturesLoaded = false;

  private constructor() {
    // Private constructor for singleton pattern
  }

  static getInstance(): CardAssets {
    if (!CardAssets.instance) {
      CardAssets.instance = new CardAssets();
    }
    return CardAssets.instance;
  }

  async loadAll(): Promise<void> {
    if (this.texturesLoaded) {
      return;
    }

    const assetUrls: string[] = [CARD_BACK_PATH];

    // Add all card combinations
    for (const suit of Object.values(SUIT_PATHS)) {
      for (const rank of Object.values(RANK_PATHS)) {
        assetUrls.push(`${ASSETS_BASE_PATH}/${suit}_${rank}.svg`);
      }
    }

    // Load all assets in batch for better performance
    await Assets.load(assetUrls);

    this.texturesLoaded = true;
  }

  getCardTexture(card: Card): Texture {
    this.ensureLoaded();
    const path = this.getCardPath(card);
    return Assets.get(path);
  }

  getCardBackTexture(): Texture {
    this.ensureLoaded();
    return Assets.get(CARD_BACK_PATH);
  }

  getAllCardTextures(): Map<string, Texture> {
    this.ensureLoaded();
    const textureMap = new Map<string, Texture>();

    for (const suit of Object.keys(SUIT_PATHS) as Suit[]) {
      for (const rank of Object.keys(RANK_PATHS) as Rank[]) {
        const card: Card = { suit, rank };
        const path = this.getCardPath(card);
        textureMap.set(this.getCardKey(card), Assets.get(path));
      }
    }

    return textureMap;
  }

  isLoaded(): boolean {
    return this.texturesLoaded;
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private getCardPath(card: Card): string {
    const suitPath = SUIT_PATHS[card.suit];
    const rankPath = RANK_PATHS[card.rank];
    return `${ASSETS_BASE_PATH}/${suitPath}_${rankPath}.svg`;
  }

  private getCardKey(card: Card): string {
    return `${card.suit}_${card.rank}`;
  }

  private ensureLoaded(): void {
    if (!this.texturesLoaded) {
      throw new Error(
        'CardAssets: Textures not loaded. Call loadAll() before accessing textures.'
      );
    }
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

export function getCardAssets(): CardAssets {
  return CardAssets.getInstance();
}
