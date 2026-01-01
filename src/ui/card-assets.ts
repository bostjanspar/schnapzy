/**
 * Card asset manager for loading and accessing card textures.
 * Loads all SVG card images from the public/cards folder.
 */

import { Assets, Texture } from 'pixi.js';
import type { Card, Suit, Rank } from '../gamelogic/types.js';

// ============================================================================
// Asset Path Constants
// ============================================================================

const ASSETS_BASE_PATH = '/cards';

const CARD_BACK_PATH = `${ASSETS_BASE_PATH}/back.svg`;

/**
 * Mapping of suit constants to file path suffixes.
 */
const SUIT_PATHS: Readonly<Record<Suit, string>> = {
  CLUBS: 'clubs',
  DIAMONDS: 'diamonds',
  HEARTS: 'hearts',
  SPADES: 'spades',
} as const;

/**
 * Mapping of rank constants to file path suffixes.
 */
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

/**
 * Manages loading and retrieval of card texture assets.
 * All card images are loaded as SVGs which PixiJS supports natively.
 */
export class CardAssets {
  private static instance: CardAssets | null = null;
  private texturesLoaded = false;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get the singleton instance of CardAssets.
   */
  static getInstance(): CardAssets {
    if (!CardAssets.instance) {
      CardAssets.instance = new CardAssets();
    }
    return CardAssets.instance;
  }

  /**
   * Load all card textures from the public/cards folder.
   * Must be called before any texture retrieval methods.
   */
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

  /**
   * Get the texture for a specific card.
   * @param card - The card to get the texture for
   * @returns The texture for the card
   * @throws Error if textures haven't been loaded yet
   */
  getCardTexture(card: Card): Texture {
    this.ensureLoaded();
    const path = this.getCardPath(card);
    return Assets.get(path);
  }

  /**
   * Get the card back texture.
   * @returns The card back texture
   * @throws Error if textures haven't been loaded yet
   */
  getCardBackTexture(): Texture {
    this.ensureLoaded();
    return Assets.get(CARD_BACK_PATH);
  }

  /**
   * Get all card textures as a map keyed by their string representation.
   * Useful for batch operations or lookups.
   * @returns Map of card key to texture
   */
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

  /**
   * Check if all textures have been loaded.
   */
  isLoaded(): boolean {
    return this.texturesLoaded;
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Get the file path for a specific card.
   */
  private getCardPath(card: Card): string {
    const suitPath = SUIT_PATHS[card.suit];
    const rankPath = RANK_PATHS[card.rank];
    return `${ASSETS_BASE_PATH}/${suitPath}_${rankPath}.svg`;
  }

  /**
   * Get a unique key for a card (suit_rank format).
   */
  private getCardKey(card: Card): string {
    return `${card.suit}_${card.rank}`;
  }

  /**
   * Ensure textures are loaded before access.
   */
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

/**
 * Get the singleton CardAssets instance.
 */
export function getCardAssets(): CardAssets {
  return CardAssets.getInstance();
}
