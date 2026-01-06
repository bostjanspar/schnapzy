import { type Application } from 'pixi.js';
import { BaseScene } from './base-scene.js';
import { EventBus } from './event-bus.js';
import { GameScene } from './types.js';
import { GameTableLayout } from './game-table-layout.js';
import type { IGameStateReader } from './game-state-reader.js';

type AnimationPhase = 'WAITING' | 'DEALING' | 'COMPLETE';

export class DealAnimationScene extends BaseScene {
  private tableLayout: GameTableLayout;
  private stateReader: IGameStateReader | null = null;
  private animationPhase: AnimationPhase = 'WAITING';
  private animationTimer: number = 0;
  
  constructor(app: Application, eventBus: EventBus) {
    super(app, eventBus, GameScene.DEAL_ANIMATION);
    this.tableLayout = new GameTableLayout(this.app);
  }
  
  init(): void {
    this.addChild(this.tableLayout);
    this.tableLayout.positionContainers();
    
    window.addEventListener('resize', this.handleResize);
  }
  
  prepare(gameStateReader: IGameStateReader): void {
    this.stateReader = gameStateReader;
  }

  enter(): void {
    this.visible = true;
    this.animationPhase = 'DEALING';
    this.animationTimer = 0;
    
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
    
    // Render all elements (no interaction in deal scene)
    this.tableLayout.renderPlayerHand(playerHand, false);
    this.tableLayout.renderCpuHand(cpuHand.length);
    this.tableLayout.renderTalon(trumpCard, talonSize);
    this.tableLayout.renderScoreBoard(p1Points, p2Points);
  }
  
  exit(): void {
    this.visible = false;
    this.tableLayout.clearAllCards();
    this.stateReader = null;
  }
  
  update(delta: number): void {
    if (this.animationPhase === 'DEALING') {
      this.animationTimer += delta;
      
      // Simple timed transition (replace with actual animation later)
      if (this.animationTimer > 60) { // ~1 second at 60fps
        this.animationPhase = 'COMPLETE';
        this.eventBus.emit({ type: 'DEAL_ANIMATION_COMPLETE' });
      }
    }
  }
  
  private handleResize = (): void => {
    this.tableLayout.positionContainers();
  };
  
  override destroy(): void {
    window.removeEventListener('resize', this.handleResize);
    this.tableLayout.destroy();
    super.destroy();
  }
}
