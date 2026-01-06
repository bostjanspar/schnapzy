# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Schnapzy is a fully-featured web-based implementation of Schnapsen, a traditional Austrian two-player point-trick card game. The game is feature-complete with a sophisticated AI opponent, comprehensive test coverage, and a professional PixiJS-based UI.


## Development Commands

- `npm run dev` - Start the development server at http://localhost:5173/ with hot-reload
- `npm run build` - Build for production (runs TypeScript compiler then Vite build)
- `npm run preview` - Preview the production build locally

### Testing
- `npm test` - Run tests in watch mode
- `npm run test:run` - Run tests once (CI-friendly)
- `npm run test:ui` - Run tests with visual UI interface
- `npm run coverage` - Generate test coverage report

### Browser Debugging
When `npm run dev` is running, use MCP tools to debug and visualize the application:

**To view and analyze the current page:**
1. Navigate: `mcp__chrome-devtools__navigate_page` to http://localhost:5173/
2. Take screenshot: `mcp__chrome-devtools__take_screenshot`
3. Process image: `mcp__zai-mcp-server__analyze_image` to analyze layout, design, and UI

**Additional Chrome DevTools MCP capabilities:**
- `take_snapshot` - Get text-based page structure snapshot
- `list_console_messages` - Check for JavaScript errors
- `list_network_requests` - Inspect API calls and resource loading
- `evaluate_script` - Run JavaScript in the browser context
- `click`/`fill`/`hover` - Interact with UI elements

**Performance audits:**
- `performance_start_trace` / `performance_stop_trace` - Record performance metrics
- Check Core Web Vitals (LCP, FID, CLS)

## Architecture

### Tech Stack
- **Vite** - Build tool and dev server
- **TypeScript** - Type-safe JavaScript (strict mode enabled)
- **Pixi.js 8.14.3** - 2D WebGL rendering engine
- **@pixi/ui** - UI components library
- **Vitest** - Test runner with jsdom environment
- **loglevel** - Lightweight logging

### Directory Structure

```
src/
├── gamelogic/          # Core game engine (Schnapsen rules and logic)
│   ├── card.ts         # Card utilities: deck creation, shuffling, comparison
│   ├── game.ts         # Main game orchestrator (match scoring, hand rotation)
│   ├── hand.ts         # Complete hand logic (tricks, marriages, closing)
│   ├── hint-system.ts  # Hint system for suggesting plays
│   ├── player-state.ts # Individual player state (hand, points, tricks)
│   ├── rules.ts        # Game rules validation (valid plays, scoring)
│   ├── talon.ts        # Talon management (draw pile, trump tracking)
│   ├── trick.ts        # Trick mechanics and winner determination
│   ├── types.ts        # Core type definitions
│   └── cpu/            # AI implementation
│       ├── belief-state.ts    # Opponent card tracking and inference
│       ├── cpu-player.ts      # AI decision making
│       ├── heuristics.ts      # Strategic card selection rules
│       └── minimax.ts         # Game tree search algorithm
├── ui/                 # PixiJS-based user interface
│   ├── base-scene.ts           # Base class for all scenes
│   ├── gameplay-scene.ts       # Main game interface
│   ├── card-assets.ts          # SVG card asset management
│   ├── game-table-layout.ts    # Responsive table layout
│   ├── game-state-reader.ts    # Read-only game state access for UI
│   ├── event-bus.ts            # Event system for UI interactions
│   ├── scene-manager.ts        # Scene transition management
│   ├── ui-manager.ts           # Main UI controller
│   └── [scenes]/               # Individual scene implementations
│       ├── loading-scene.ts
│       ├── start-menu-scene.ts
│       ├── dealer-selection-scene.ts
│       ├── deal-animation-scene.ts
│       └── game-finished-scene.ts
├── game_sm/            # Game state machine
│   ├── game-state-machine.ts   # State machine factory and config
│   ├── game-base-state.ts      # Base class for game states
│   └── [states]/               # Individual state implementations
├── sm/                 # Generic hierarchical state machine framework
├── events/             # Event system for game events
└── main.ts             # Application entry point

test/
└── gamelogic/          # Comprehensive test suite (9 test files)
    ├── card.test.ts
    ├── game.test.ts
    ├── hand.test.ts
    ├── rules.test.ts
    ├── talon.test.ts
    ├── cpu.test.ts
    ├── full-game.test.ts
    ├── player-state.test.ts
    └── [others]

public/
└── cards/              # SVG card assets (20 cards + back)
```

### TypeScript Configuration
- Target: ES2022 with bundler module resolution
- Strict mode enabled with all strict flags (`strictNullChecks`, `noImplicitAny`, etc.)
- Additional strict options: `exactOptionalPropertyProperties`, `noUncheckedIndexedAccess`, `noImplicitOverride`
- Supports `package.json` exports and imports fields via `resolvePackageJsonExports`
- Tests use separate `tsconfig.spec.json` that extends base config

### File Naming Conventions
- **Source files**: Must use `kebab-case` naming (e.g., `game.ts`, `base-scene.ts`, `ui-manager.ts`)
- **Class names**: Use `PascalCase` (e.g., `Game`, `BaseScene`, `UIManager`)
- **Import paths**: Always use the actual kebab-case file names (with `.js` extension for ES modules)

## Core Architecture

### Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Presentation Layer                    │
│                    (PixiJS UI + Scenes)                      │
└─────────────────────────────┬───────────────────────────────┘
                              │ EventBus (UI → Game)
                              │ GameStateReader (Game → UI)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│              (GameStateMachine + Game States)                │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         Domain Layer                         │
│           (Game, Hand, PlayerState, Rules, etc.)             │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

**Domain Layer (`src/gamelogic/`):**
- **Game** - Orchestrates the match (7 game points to win, hand rotation)
- **Hand** - Manages individual hands (dealing, tricks, scoring, marriages)
- **PlayerState** - Tracks each player's cards, points, and tricks
- **Talon** - Manages the draw pile and trump card
- **Rules** - Validates plays and calculates scores
- **Trick** - Handles trick mechanics and determines winners
- **Card** - Provides card utilities (deck creation, shuffling, comparison)
- **CPUPlayer** - AI opponent with belief states and minimax

**Application Layer (`src/game_sm/`):**
- **GameStateMachine** - Hierarchical state machine for game flow
- States: Loading, StartMenu, DealerSelection, DealCards, PlayHand, HandResult, GameFinished

**Presentation Layer (`src/ui/`):**
- **UIManager** - Main UI controller
- **SceneManager** - Scene transition management
- **Scenes** - Individual PixiJS containers for each game state
- **GameStateReader** - Read-only interface for UI to access game state
- **EventBus** - Event system for UI-game communication

## Game Rules Reference

Complete Schnapsen implementation including:

- **Deck:** 20 cards (Ace, Ten, King, Queen, Jack in four suits)
- **Objective:** First to 66 card points wins a hand; first to 0 game points wins the match
- **Two gameplay phases:** Open talon (flexible play) and closed/exhausted talon (strict suit-following rules)
- **Special actions:**
  - Trump Jack exchange (before first lead)
  - Marriage melds (20 points for same-suit K+Q, 40 for trump marriage)
  - Talon closing (Viennese rules: must have >32 card points or will lose 3 points)
- **Scoring:** Mental scorekeeping, 1-3 game points per hand based on opponent's tricks/points
- **Last trick rule:** If neither player reaches 66, last trick winner wins the hand

## AI Implementation

The CPU opponent (`src/gamelogic/cpu/`) uses:

1. **Belief State Tracking** - Infers opponent's likely cards based on played cards
2. **Minimax Algorithm** - Game tree search for optimal play depth
3. **Heuristics** - Strategic rules for card selection when search depth is limited
4. **Phase-Aware Logic** - Different strategies for open vs. closed talon

## Testing

Comprehensive test suite with 9 test files covering:
- Card utilities (deck creation, shuffling, comparison)
- Game orchestration (match scoring, hand rotation)
- Hand logic (tricks, marriages, closing)
- Rules validation (valid plays, scoring)
- AI behavior (belief states, decision making)
- Integration testing (full game scenarios)

## Implementation Guidelines

When working with this codebase:

1. **Maintain separation of concerns** - Game logic should never depend on UI
2. **Use the state machine** - Game flow changes go through `GameStateMachine`, not direct manipulation
3. **Read-only game state** - UI accesses game state via `GameStateReader`, never directly
4. **Event-driven UI** - UI actions emit events through `EventBus`, handled by state machine
5. **Test game logic independently** - All game logic is tested without UI dependencies
6. **Follow naming conventions** - kebab-case files, PascalCase classes
7. **Import with .js extensions** - ES modules require explicit extensions
